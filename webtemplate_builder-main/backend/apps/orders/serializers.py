from rest_framework import serializers
from apps.orders.models import Order, OrderItem, PaymentTransaction, Coupon
from apps.catalog.serializers import TemplateListSerializer


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "max_uses",
            "times_used",
            "valid_from",
            "valid_to",
            "is_active",
            "created_at",
        ]


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)


class OrderItemSerializer(serializers.ModelSerializer):
    template = TemplateListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "template", "template_title", "price_snapshot", "license_type"]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "transaction_id",
            "payment_gateway",
            "amount",
            "currency",
            "status",
            "created_at",
            "verified_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    transactions = PaymentTransactionSerializer(many=True, read_only=True)
    coupon = CouponSerializer(read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_email",
            "status",
            "total_amount",
            "discount_amount",
            "coupon",
            "currency",
            "payment_method",
            "items",
            "transactions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "order_number", "status", "total_amount", "discount_amount", "created_at", "updated_at"]


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(
        choices=["MOCK", "STRIPE", "RAZORPAY"],
        default="MOCK"
    )
    coupon_code = serializers.CharField(required=False, allow_blank=True, default="")


class PaymentVerifySerializer(serializers.Serializer):
    order_number = serializers.CharField(required=True)
    transaction_id = serializers.CharField(required=True)
    provider = serializers.CharField(default="MOCK")
    status = serializers.ChoiceField(choices=["SUCCESS", "FAILED"], default="SUCCESS")
    payload = serializers.DictField(required=False, default=dict)
