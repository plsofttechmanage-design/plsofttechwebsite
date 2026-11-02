import os
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Category, Template
from apps.orders.models import Order
from apps.downloads.models import DownloadEntitlement

User = get_user_model()


class DownloadSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            email="owner@example.com",
            username="owner",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        self.stranger = User.objects.create_user(
            email="stranger@example.com",
            username="stranger",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        self.category = Category.objects.create(name="Business", slug="business")
        self.template = Template.objects.create(
            title="Business Pro",
            slug="business-pro",
            description="Business theme",
            category=self.category,
            price=Decimal("40.00"),
            status=Template.Status.PUBLISHED,
        )
        # Attach dummy zip package
        self.template.package_file.save("test_package.zip", ContentFile(b"PK0304dummyzipcontent"), save=True)

        self.order = Order.objects.create(
            customer=self.owner,
            status=Order.Status.PAID,
            total_amount=Decimal("40.00"),
        )
        self.entitlement = DownloadEntitlement.objects.create(
            customer=self.owner,
            template=self.template,
            order=self.order,
            version="1.0.0",
            max_downloads=5,
            download_count=0,
            is_active=True,
        )

    def test_stranger_cannot_download_unowned_entitlement(self):
        self.client.force_authenticate(user=self.stranger)
        url = f"/api/downloads/file/{self.entitlement.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_download_and_increments_count(self):
        self.client.force_authenticate(user=self.owner)
        url = f"/api/downloads/file/{self.entitlement.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.entitlement.refresh_from_db()
        self.assertEqual(self.entitlement.download_count, 1)

