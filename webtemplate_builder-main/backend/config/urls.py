"""
URL configuration for website_builder project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.common.views import HealthCheckView, SiteSettingsView, LogoUploadView

urlpatterns = [
    # Django Staff Admin site (kept distinct from React /admin marketplace portal)
    path("django-admin/", admin.site.urls),

    # API Documentation (drf-spectacular)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Health check probe & Global Website Settings
    path("api/health/", HealthCheckView.as_view(), name="health_check"),
    path("api/settings/", SiteSettingsView.as_view(), name="site_settings"),
    path("api/settings/upload-logo/", LogoUploadView.as_view(), name="upload_logo"),

    # Application API routes
    path("api/auth/", include("apps.accounts.urls", namespace="accounts")),
    path("api/catalog/", include("apps.catalog.urls", namespace="catalog")),
    path("api/cart/", include("apps.cart.urls", namespace="cart")),
    path("api/orders/", include("apps.orders.urls", namespace="orders")),
    path("api/downloads/", include("apps.downloads.urls", namespace="downloads")),
    path("api/audit/", include("apps.audit.urls", namespace="audit")),
]

# Public media files in development (thumbnails, avatars, preview assets)
# Note: Private template package downloads are handled via /api/downloads/file/<id>/
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

