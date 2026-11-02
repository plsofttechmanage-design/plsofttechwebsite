from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Template
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order, Coupon
from apps.downloads.models import DownloadEntitlement

User = get_user_model()


class CheckoutAndOrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        self.category = Category.objects.create(name="Portfolio", slug="portfolio")
        self.template = Template.objects.create(
            title="Portfolio Pro",
            slug="portfolio-pro",
            description="Portfolio theme",
            category=self.category,
            price=Decimal("100.00"),
            status=Template.Status.PUBLISHED,
        )

    def test_full_checkout_and_payment_flow(self):
        self.client.force_authenticate(user=self.customer)

        # 1. Add to cart
        add_res = self.client.post("/api/cart/", {"template_id": self.template.id}, format="json")
        self.assertEqual(add_res.status_code, status.HTTP_201_CREATED)

        # 2. Checkout
        checkout_res = self.client.post("/api/orders/checkout/", {"payment_method": "MOCK"}, format="json")
        self.assertEqual(checkout_res.status_code, status.HTTP_201_CREATED)
        order_number = checkout_res.data["payment_details"]["order_number"]
        transaction_id = checkout_res.data["payment_details"]["transaction_id"]

        order = Order.objects.get(order_number=order_number)
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.total_amount, Decimal("100.00"))

        # 3. Verify Payment
        verify_payload = {
            "order_number": order_number,
            "transaction_id": transaction_id,
            "provider": "MOCK",
            "status": "SUCCESS",
            "payload": {"simulated": True}
        }
        verify_res = self.client.post("/api/orders/verify-payment/", verify_payload, format="json")
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)

        # 4. Check Order is Paid and DownloadEntitlement is generated
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PAID)
        self.assertTrue(
            DownloadEntitlement.objects.filter(
                customer=self.customer,
                template=self.template,
                order=order,
                is_active=True
            ).exists()
        )

        # 5. Check customer's cart was cleared
        cart = Cart.objects.get(customer=self.customer)
        self.assertEqual(cart.items.count(), 0)

    def test_coupon_validation_and_checkout_discount(self):
        self.client.force_authenticate(user=self.customer)

        # Create 20% coupon
        Coupon.objects.create(
            code="SALE20",
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal("20.00"),
            is_active=True
        )

        # 1. Add item to cart
        self.client.post("/api/cart/", {"template_id": self.template.id}, format="json")

        # 2. Test apply-coupon endpoint
        coupon_res = self.client.post("/api/orders/apply-coupon/", {"code": "SALE20"}, format="json")
        self.assertEqual(coupon_res.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon_res.data["valid"], True)
        self.assertEqual(coupon_res.data["discount_amount"], "20.00")
        self.assertEqual(coupon_res.data["final_total"], "80.00")

        # 3. Checkout with coupon
        checkout_res = self.client.post(
            "/api/orders/checkout/",
            {"payment_method": "MOCK", "coupon_code": "SALE20"},
            format="json"
        )
        self.assertEqual(checkout_res.status_code, status.HTTP_201_CREATED)
        order_number = checkout_res.data["payment_details"]["order_number"]
        order = Order.objects.get(order_number=order_number)

        # Verify discount applied: 100 - 20 = 80
        self.assertEqual(order.discount_amount, Decimal("20.00"))
        self.assertEqual(order.total_amount, Decimal("80.00"))
        self.assertEqual(order.coupon.code, "SALE20")
