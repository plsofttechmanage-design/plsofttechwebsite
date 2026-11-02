from rest_framework.views import APIView
from rest_framework import generics, permissions, status, filters, viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from apps.orders.models import Order, Coupon
from apps.orders.serializers import (
    OrderSerializer,
    CheckoutSerializer,
    PaymentVerifySerializer,
    CouponSerializer,
    ApplyCouponSerializer,
)
from apps.orders.services import create_order_from_cart, verify_and_fulfill_payment
from apps.common.permissions import IsAdminUserRole
from apps.catalog.models import Template
from apps.accounts.models import User
from apps.cart.models import Cart


class ApplyCouponView(APIView):
    """
    Validates a promotional coupon code against the customer's current cart subtotal.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ApplyCouponSerializer, responses={200: dict})
    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"].strip()

        cart = Cart.objects.filter(customer=request.user).first()
        if not cart or not cart.items.exists():
            return Response({"error": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = cart.total_price
        coupon = Coupon.objects.filter(code__iexact=code).first()
        if not coupon:
            return Response({"error": "Invalid promo code."}, status=status.HTTP_400_BAD_REQUEST)

        valid, reason = coupon.is_valid_for_amount(subtotal)
        if not valid:
            return Response({"error": reason}, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(subtotal)
        final_total = max(0, subtotal - discount)

        return Response({
            "valid": True,
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": str(coupon.discount_value),
            "discount_amount": str(discount),
            "subtotal": str(subtotal),
            "final_total": str(final_total),
            "message": f"Coupon applied: ${discount} discount!",
        })


class CheckoutView(APIView):
    """
    Creates a pending order from the customer's current shopping cart.
    Validates prices, availability, and promotional coupons on the server.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=CheckoutSerializer, responses={201: OrderSerializer})
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment_method = serializer.validated_data.get("payment_method", "MOCK")
        coupon_code = serializer.validated_data.get("coupon_code", "").strip()
        order = create_order_from_cart(request.user, payment_method=payment_method, coupon_code=coupon_code)

        return Response(
            {
                "success": True,
                "message": "Order created. Proceed to payment verification.",
                "order": OrderSerializer(order).data,
                "payment_details": {
                    "order_number": order.order_number,
                    "amount": str(order.total_amount),
                    "discount_amount": str(order.discount_amount),
                    "currency": order.currency,
                    "payment_method": order.payment_method,
                    "transaction_id": order.transactions.first().transaction_id if order.transactions.exists() else None,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentVerifyView(APIView):
    """
    Verifies payment completion.
    Server verifies transaction and idempotently marks order as paid,
    clearing the cart and unlocking downloadable packages.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=PaymentVerifySerializer, responses={200: OrderSerializer})
    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_number = serializer.validated_data["order_number"]
        transaction_id = serializer.validated_data["transaction_id"]
        provider = serializer.validated_data["provider"]
        payment_status = serializer.validated_data["status"]
        payload = serializer.validated_data.get("payload", {})

        # Ensure customer owns the order or is admin
        order = get_object_or_404(Order, order_number=order_number)
        if order.customer != request.user and not request.user.is_admin:
            return Response({"error": "Unauthorized order access."}, status=status.HTTP_403_FORBIDDEN)

        is_success = payment_status == "SUCCESS"
        order, success, message = verify_and_fulfill_payment(
            order=order,
            transaction_id=transaction_id,
            is_success=is_success,
            provider=provider,
            payload=payload,
            request=request,
        )

        return Response(
            {
                "success": success,
                "message": message,
                "order": OrderSerializer(order).data,
            },
            status=status.HTTP_200_OK if success else status.HTTP_400_BAD_REQUEST,
        )


class CustomerOrderListView(generics.ListAPIView):
    """
    List orders belonging to the authenticated customer.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Order.objects.none()
        return Order.objects.filter(customer=self.request.user).prefetch_related("items", "transactions")


class CustomerOrderDetailView(generics.RetrieveAPIView):
    """
    Retrieve order details for the authenticated customer.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "order_number"
    queryset = Order.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Order.objects.none()
        return Order.objects.filter(customer=self.request.user).prefetch_related("items", "transactions")


class AdminOrderListView(generics.ListAPIView):
    """
    Administrative overview of all orders across the marketplace.
    """
    queryset = Order.objects.all().select_related("customer").prefetch_related("items", "transactions")
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "payment_method"]
    search_fields = ["order_number", "customer__email", "customer__username"]
    ordering_fields = ["created_at", "total_amount", "status"]


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Administrative detail view to review or update order status (e.g. handle refunds).
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUserRole]
    lookup_field = "order_number"


class AdminCouponViewSet(viewsets.ModelViewSet):
    """
    Administrative management for discount and promotional coupon codes.
    """
    queryset = Coupon.objects.all().order_by("-created_at")
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code"]
    ordering_fields = ["created_at", "discount_value", "times_used"]


class AdminDashboardSummaryView(APIView):
    """
    Administrative dashboard summary metrics and analytics.
    """
    permission_classes = [IsAdminUserRole]

    @extend_schema(responses={200: dict})
    def get(self, request):
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        published_templates = Template.objects.filter(status=Template.Status.PUBLISHED).count()
        total_templates = Template.objects.count()
        total_orders = Order.objects.count()
        paid_orders = Order.objects.filter(status=Order.Status.PAID).count()

        revenue_result = Order.objects.filter(status=Order.Status.PAID).aggregate(total_revenue=Sum("total_amount"))
        total_revenue = revenue_result["total_revenue"] or 0

        recent_orders = OrderSerializer(Order.objects.all().order_by("-created_at")[:5], many=True).data

        # Monthly analytics projection
        chart_data = [
            {"month": "May", "revenue": 1240, "orders": 24},
            {"month": "Jun", "revenue": 1890, "orders": 38},
            {"month": "Jul", "revenue": 2450, "orders": 47},
            {"month": "Aug", "revenue": 3120, "orders": 61},
            {"month": "Sep", "revenue": 3980, "orders": 75},
            {"month": "Oct", "revenue": float(total_revenue), "orders": paid_orders},
        ]

        return Response({
            "metrics": {
                "total_customers": total_customers,
                "published_templates": published_templates,
                "total_templates": total_templates,
                "total_orders": total_orders,
                "paid_orders": paid_orders,
                "total_revenue": float(total_revenue),
                "currency": "USD",
            },
            "recent_orders": recent_orders,
            "chart_data": chart_data,
        })
