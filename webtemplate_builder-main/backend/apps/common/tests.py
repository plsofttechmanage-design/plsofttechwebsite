from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.common.models import SiteSettings

User = get_user_model()


class SiteSettingsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="admin_settings@example.com",
            username="admin_settings",
            password="AdminPassword123!",
            role=User.Role.ADMIN,
        )
        self.customer = User.objects.create_user(
            email="cust_settings@example.com",
            username="cust_settings",
            password="CustPassword123!",
            role=User.Role.CUSTOMER,
        )

    def test_public_user_can_read_settings(self):
        response = self.client.get("/api/settings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("company_name", response.data)
        self.assertIn("hero_title", response.data)

    def test_customer_cannot_update_settings(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.put("/api/settings/", {"company_name": "HackedName"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_settings(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "company_name": "NovaCraft",
            "company_tagline": "Next-Gen Template Marketplace",
            "logo_text": "Pro",
            "hero_title": "Build Faster With",
            "hero_title_highlight": "Stunning Web Assets",
            "hero_badge": "Exclusive 2026 Release",
            "cta_primary_text": "Browse Catalogue Now",
        }
        response = self.client.put("/api/settings/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["company_name"], "NovaCraft")
        self.assertEqual(response.data["logo_text"], "Pro")
        self.assertEqual(response.data["hero_badge"], "Exclusive 2026 Release")

        # Verify persisted
        settings = SiteSettings.get_settings()
        self.assertEqual(settings.company_name, "NovaCraft")

    def test_admin_can_update_logo_and_icon(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "logo_text": "Enterprise",
            "logo_icon": "rocket",
            "logo_url": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==",
        }
        response = self.client.put("/api/settings/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["logo_icon"], "rocket")
        self.assertEqual(response.data["logo_text"], "Enterprise")
        self.assertTrue(response.data["logo_url"].startswith("data:image/svg+xml;base64,"))

        settings = SiteSettings.get_settings()
        self.assertEqual(settings.logo_icon, "rocket")

    def test_admin_can_upload_logo_file(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        self.client.force_authenticate(user=self.admin)

        image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        logo_file = SimpleUploadedFile("brand_logo.png", image_content, content_type="image/png")

        response = self.client.post("/api/settings/upload-logo/", {"file": logo_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("logo_url", response.data)
        self.assertTrue(response.data["logo_url"].endswith(".png"))

        settings = SiteSettings.get_settings()
        self.assertTrue(settings.logo_url.endswith(".png"))

