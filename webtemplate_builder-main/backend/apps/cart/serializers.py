from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.cart.models import Cart, CartItem
from apps.catalog.serializers import TemplateListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    template = TemplateListSerializer(read_only=True)
    current_price = serializers.DecimalField(source="template.price", max_digits=10, decimal_places=2, read_only=True)
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "template", "price_snapshot", "current_price", "is_available", "added_at"]
        read_only_fields = ["id", "added_at"]

    @extend_schema_field(serializers.BooleanField)
    def get_is_available(self, obj):
        return obj.template.status == "PUBLISHED"


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "total_items", "total_price", "updated_at"]
        read_only_fields = ["id", "updated_at"]
