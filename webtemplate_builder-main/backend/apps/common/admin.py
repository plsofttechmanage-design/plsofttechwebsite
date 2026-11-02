from django.contrib import admin
from apps.common.models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ["company_name", "company_tagline", "contact_email", "updated_at"]

    def has_add_permission(self, request):
        # Enforce singleton in django admin
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

