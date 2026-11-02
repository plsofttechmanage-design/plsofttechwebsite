from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.catalog.views import (
    CategoryViewSet,
    TagViewSet,
    PublicTemplateViewSet,
    AdminTemplateViewSet,
    TemplateVersionViewSet,
    TemplateCustomizationViewSet,
    WishlistViewSet,
)

app_name = "catalog"

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"tags", TagViewSet, basename="tag")
router.register(r"templates", PublicTemplateViewSet, basename="public-template")
router.register(r"admin/templates", AdminTemplateViewSet, basename="admin-template")
router.register(r"admin/versions", TemplateVersionViewSet, basename="admin-template-version")
router.register(r"customizations", TemplateCustomizationViewSet, basename="customization")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("", include(router.urls)),
]

