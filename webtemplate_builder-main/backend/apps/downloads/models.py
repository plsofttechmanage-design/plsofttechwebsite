import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.catalog.models import Template
from apps.orders.models import Order


class DownloadEntitlement(models.Model):
    """
    Entitlement record granting an authenticated customer permission to download
    a purchased template package after verified payment.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="download_entitlements"
    )
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name="entitlements"
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="download_entitlements"
    )
    version = models.CharField(max_length=20, default="1.0.0")
    max_downloads = models.PositiveIntegerField(
        default=20,
        help_text="Maximum allowed downloads per purchase (default 20)"
    )
    download_count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Optional expiration date for download access"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("customer", "template", "order")

    def __str__(self):
        return f"{self.customer.email} -> {self.template.title} ({self.download_count}/{self.max_downloads})"

    def can_download(self):
        if not self.is_active:
            return False, "This download entitlement has been deactivated."
        if self.expires_at and timezone.now() > self.expires_at:
            return False, "Download entitlement has expired."
        if self.max_downloads and self.download_count >= self.max_downloads:
            return False, "Maximum download limit reached. Please contact support."
        return True, "Eligible"


class DownloadLog(models.Model):
    """
    Audit log of all successful download attempts for security and compliance.
    """
    entitlement = models.ForeignKey(
        DownloadEntitlement,
        on_delete=models.CASCADE,
        related_name="logs"
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="download_logs"
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-downloaded_at"]

    def __str__(self):
        return f"Download by {self.customer.email} on {self.downloaded_at}"

