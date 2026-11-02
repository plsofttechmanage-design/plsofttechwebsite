from django.urls import path
from apps.common.views import HealthCheckView, SiteSettingsView, LogoUploadView

app_name = "common"

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health_check"),
    path("settings/", SiteSettingsView.as_view(), name="site_settings"),
    path("settings/upload-logo/", LogoUploadView.as_view(), name="upload_logo"),
]
