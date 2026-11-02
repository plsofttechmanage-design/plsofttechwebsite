import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.catalog.models import Template


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage Discount"
        FIXED = "FIXED", "Fixed Amount Discount"

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_uses = models.PositiveIntegerField(blank=True, null=True, help_text="Total allowed redemptions (null for unlimited)")
    times_used = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField(blank=True, null=True)
    valid_to = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        val = f"{self.discount_value}%" if self.discount_type == self.DiscountType.PERCENTAGE else f"${self.discount_value}"
        return f"{self.code} ({val} off)"

    def is_valid_for_amount(self, order_amount):
        now = timezone.now()
        if not self.is_active:
            return False, "This promo code is no longer active."
        if self.valid_from and now < self.valid_from:
            return False, "This promo code is not active yet."
        if self.valid_to and now > self.valid_to:
            return False, "This promo code has expired."
        if self.max_uses and self.times_used >= self.max_uses:
            return False, "This promo code has reached its maximum redemption limit."
        if order_amount < self.min_order_amount:
            return False, f"Minimum purchase amount of ${self.min_order_amount} required to apply this coupon."
        return True, "Valid"

    def calculate_discount(self, order_amount):
        valid, msg = self.is_valid_for_amount(order_amount)
        if not valid:
            return Decimal("0.00")

        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (order_amount * self.discount_value) / Decimal("100.00")
        else:
            discount = self.discount_value

        return min(discount, order_amount)


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending Payment"
        PAID = "PAID", "Paid"
        FAILED = "FAILED", "Payment Failed"
        CANCELLED = "CANCELLED", "Cancelled"
        REFUNDED = "REFUNDED", "Refunded"

    order_number = models.CharField(max_length=50, unique=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )
    currency = models.CharField(max_length=10, default="USD")
    payment_method = models.CharField(max_length=50, default="MOCK")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} - {self.customer.email} ({self.status})"

    @property
    def is_paid(self):
        return self.status == self.Status.PAID


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True)
    template_title = models.CharField(max_length=200)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    license_type = models.CharField(max_length=50, default="Standard Single-Use")

    def __str__(self):
        return f"{self.template_title} - {self.order.order_number}"


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="transactions")
    transaction_id = models.CharField(max_length=120, unique=True)
    payment_gateway = models.CharField(max_length=50, default="MOCK")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    idempotency_key = models.CharField(max_length=120, blank=True, null=True, unique=True)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Txn {self.transaction_id} ({self.status}) for {self.order.order_number}"
