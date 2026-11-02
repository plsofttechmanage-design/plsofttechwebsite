from django.contrib import admin
from apps.orders.models import Order, OrderItem, PaymentTransaction, Coupon


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("template", "template_title", "price_snapshot", "license_type")


class PaymentTransactionInline(admin.TabularInline):
    model = PaymentTransaction
    extra = 0
    readonly_fields = ("transaction_id", "payment_gateway", "amount", "status", "created_at", "verified_at")


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "times_used", "max_uses", "is_active", "valid_to")
    list_filter = ("discount_type", "is_active", "valid_to")
    search_fields = ("code",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "customer", "status", "total_amount", "discount_amount", "currency", "payment_method", "created_at")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("order_number", "customer__email", "customer__username")
    readonly_fields = ("order_number", "created_at", "updated_at")
    inlines = [OrderItemInline, PaymentTransactionInline]


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("transaction_id", "order", "payment_gateway", "amount", "status", "created_at", "verified_at")
    list_filter = ("status", "payment_gateway", "created_at")
    search_fields = ("transaction_id", "order__order_number")
