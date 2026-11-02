from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Template, TemplateCustomization, Review
from apps.downloads.models import DownloadEntitlement
from apps.orders.models import Order

User = get_user_model()


class CatalogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="SaaS", slug="saas")
        self.published_template = Template.objects.create(
            title="SaaS Hero",
            slug="saas-hero",
            description="Awesome SaaS template",
            category=self.category,
            price=Decimal("49.00"),
            status=Template.Status.PUBLISHED,
        )
        self.draft_template = Template.objects.create(
            title="Draft Template",
            slug="draft-template",
            description="Work in progress",
            category=self.category,
            price=Decimal("29.00"),
            status=Template.Status.DRAFT,
        )
        self.customer = User.objects.create_user(
            email="cust@example.com",
            username="cust",
            password="Password123!",
            role=User.Role.CUSTOMER
        )

    def test_public_catalog_shows_only_published(self):
        response = self.client.get("/api/catalog/templates/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [item["slug"] for item in response.data["results"]]
        self.assertIn("saas-hero", slugs)
        self.assertNotIn("draft-template", slugs)

    def test_customer_can_save_customization_draft(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            "template": self.published_template.id,
            "name": "My Customized SaaS Page",
            "config_data": {
                "primaryColor": "#10b981",
                "heroTitle": "My Custom AI Tool"
            }
        }
        response = self.client.post("/api/catalog/customizations/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TemplateCustomization.objects.filter(customer=self.customer).count(), 1)

    def test_customer_can_post_review_and_calculates_average(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            "rating": 5,
            "title": "Super clean template",
            "comment": "Loved the responsive grids and clean styling.",
        }
        url = f"/api/catalog/templates/{self.published_template.slug}/reviews/"
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.filter(template=self.published_template).count(), 1)
        self.published_template.refresh_from_db()
        self.assertEqual(self.published_template.average_rating, 5.0)

    def test_admin_can_patch_template_with_preview_url(self):
        admin = User.objects.create_user(
            email="admin_cat@example.com",
            username="admin_cat",
            password="Password123!",
            role=User.Role.ADMIN
        )
        self.client.force_authenticate(user=admin)
        payload = {
            "title": "SaaS Hero Updated",
            "preview_url": "preview.example.com/live-demo",
            "price": "59.00"
        }
        res = self.client.patch(f"/api/catalog/admin/templates/{self.published_template.id}/", payload, format="multipart")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.published_template.refresh_from_db()
        self.assertEqual(self.published_template.title, "SaaS Hero Updated")
        self.assertEqual(self.published_template.preview_url, "https://preview.example.com/live-demo")

    def test_admin_can_delete_template(self):
        admin = User.objects.create_user(
            email="admin_del@example.com",
            username="admin_del",
            password="Password123!",
            role=User.Role.ADMIN
        )
        self.client.force_authenticate(user=admin)
        res = self.client.delete(f"/api/catalog/admin/templates/{self.draft_template.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Template.objects.filter(id=self.draft_template.id).exists())

    def test_customer_can_toggle_wishlist(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.post("/api/catalog/wishlist/toggle/", {"template_id": self.published_template.id}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data.get("saved"))

        # Toggle again should remove
        res2 = self.client.post("/api/catalog/wishlist/toggle/", {"template_id": self.published_template.id}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data.get("saved"))
