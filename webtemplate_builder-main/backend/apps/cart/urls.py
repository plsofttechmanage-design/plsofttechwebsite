from django.urls import path
from apps.cart.views import CartView, CartItemRemoveView

app_name = "cart"

urlpatterns = [
    path("", CartView.as_view(), name="cart_detail"),
    path("items/<int:item_id>/", CartItemRemoveView.as_view(), name="cart_item_remove"),
]

