from django.contrib import admin
from apps.downloads.models import DownloadEntitlement, DownloadLog


@admin.register(DownloadEntitlement)
class DownloadEntitlementAdmin(admin.ModelAdmin):
    list_display = ("customer", "template", "order", "download_count", "max_downloads", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("customer__email", "template__title", "order__order_number")


@admin.register(DownloadLog)
class DownloadLogAdmin(admin.ModelAdmin):
    list_display = ("customer", "entitlement", "ip_address", "downloaded_at")
    list_filter = ("downloaded_at",)
    search_fields = ("customer__email", "ip_address")
    readonly_fields = ("entitlement", "customer", "ip_address", "user_agent", "downloaded_at")

