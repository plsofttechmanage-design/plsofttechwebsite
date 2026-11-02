from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Template
from apps.cart.models import Cart, CartItem

User = get_user_model()


class CartTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="carttester@example.com",
            username="carttester",
            password="Password123!",
            role=User.Role.CUSTOMER,
        )
        self.category = Category.objects.create(name="Landing", slug="landing")
        self.template1 = Template.objects.create(
            title="Landing Pro",
            slug="landing-pro",
            description="High converting landing page",
            category=self.category,
            price=Decimal("49.00"),
            status=Template.Status.PUBLISHED,
        )
        self.template2 = Template.objects.create(
            title="Landing Basic",
            slug="landing-basic",
            description="Basic landing page",
            category=self.category,
            price=Decimal("29.00"),
            status=Template.Status.PUBLISHED,
        )

    def test_authenticated_user_can_add_item_to_cart(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/cart/", {"template_id": self.template1.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["cart"]["total_items"], 1)
        self.assertEqual(Decimal(str(response.data["cart"]["total_price"])), Decimal("49.00"))

    def test_cannot_add_duplicate_template_to_cart(self):
        self.client.force_authenticate(user=self.user)
        self.client.post("/api/cart/", {"template_id": self.template1.id}, format="json")
        response = self.client.post("/api/cart/", {"template_id": self.template1.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart = Cart.objects.get(customer=self.user)
        self.assertEqual(cart.items.count(), 1)

    def test_remove_item_from_cart(self):
        self.client.force_authenticate(user=self.user)
        self.client.post("/api/cart/", {"template_id": self.template1.id}, format="json")
        cart_item = CartItem.objects.get(cart__customer=self.user, template=self.template1)
        
        del_response = self.client.delete(f"/api/cart/items/{cart_item.id}/")
        self.assertEqual(del_response.status_code, status.HTTP_200_OK)
        self.assertEqual(del_response.data["cart"]["total_items"], 0)
