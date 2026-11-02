from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, inline_serializer

from apps.cart.models import Cart, CartItem
from apps.cart.serializers import CartSerializer
from apps.catalog.models import Template


class AddToCartInputSerializer(serializers.Serializer):
    template_id = serializers.IntegerField(required=True)


class CartView(APIView):
    """
    Get customer cart, add item to cart, or clear cart.
    Enforces server-side validation of availability and pricing.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(customer=user)
        return cart

    @extend_schema(responses={200: CartSerializer})
    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @extend_schema(request=AddToCartInputSerializer, responses={201: CartSerializer})
    def post(self, request):
        serializer = AddToCartInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        template_id = serializer.validated_data["template_id"]

        template = get_object_or_404(Template, id=template_id)

        if template.status != Template.Status.PUBLISHED:
            return Response(
                {"error": "This template is not currently available for purchase."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = self.get_cart(request.user)

        # Check if already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            template=template,
            defaults={"price_snapshot": template.price}
        )

        if not created:
            # Already in cart (since digital templates are purchased once per cart)
            return Response(
                {"message": "Template is already in your cart.", "cart": CartSerializer(cart).data},
                status=status.HTTP_200_OK,
            )

        return Response(
            {"message": "Item added to cart.", "cart": CartSerializer(cart).data},
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(responses={200: CartSerializer})
    def delete(self, request):
        cart = self.get_cart(request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared successfully.", "cart": CartSerializer(cart).data})


class CartItemRemoveView(APIView):
    """
    Remove a specific item from the cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: CartSerializer})
    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, customer=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response({"message": "Item removed from cart.", "cart": CartSerializer(cart).data})
