from django.db import models
from django.conf import settings
from apps.catalog.models import Template


class Cart(models.Model):
    customer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.customer.email}"

    @property
    def total_items(self):
        return self.items.count()

    @property
    def total_price(self):
        # Uses current published price of the templates for strict server-side validity
        return sum(item.template.price for item in self.items.filter(template__status=Template.Status.PUBLISHED))


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    template = models.ForeignKey(Template, on_delete=models.CASCADE)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cart", "template")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.template.title} in cart {self.cart.id}"

