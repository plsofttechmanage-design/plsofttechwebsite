from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from apps.catalog.models import (
    Category,
    Tag,
    Template,
    TemplateVersion,
    TemplateCustomization,
    SavedTemplate,
    Review,
)
from apps.catalog.serializers import (
    CategorySerializer,
    TagSerializer,
    TemplateListSerializer,
    TemplateDetailSerializer,
    AdminTemplateSerializer,
    TemplateVersionSerializer,
    TemplateCustomizationSerializer,
    SavedTemplateSerializer,
    ReviewSerializer,
)
from apps.common.permissions import IsAdminUserRole, IsAdminOrReadOnly, IsOwnerOrAdmin
from apps.downloads.models import DownloadEntitlement


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD categories. Public read access; write operations restricted to Admins.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        if self.request.user and getattr(self.request.user, "is_admin", False):
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"


class PublicTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public catalogue of templates.
    Displays only PUBLISHED templates.
    Supports filtering by category, price, tags, and searching by keyword.
    """
    queryset = Template.objects.filter(status=Template.Status.PUBLISHED).select_related("category").prefetch_related("tags")
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "category__slug": ["exact"],
        "category__id": ["exact"],
        "price": ["gte", "lte", "exact"],
        "is_featured": ["exact"],
    }
    search_fields = ["title", "short_description", "description", "compatibility"]
    ordering_fields = ["price", "created_at", "title", "is_featured"]
    ordering = ["-is_featured", "-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TemplateDetailSerializer
        return TemplateListSerializer

    @extend_schema(
        methods=["POST"],
        request=ReviewSerializer,
        responses={201: ReviewSerializer, 400: dict, 403: dict}
    )
    @action(
        detail=True,
        methods=["get", "post"],
        permission_classes=[permissions.IsAuthenticatedOrReadOnly],
        url_path="reviews"
    )
    def reviews(self, request, slug=None):
        template = self.get_object()

        if request.method == "GET":
            reviews = template.reviews.all().select_related("customer")
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)

        # POST review
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required to review."}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if user already reviewed
        existing = Review.objects.filter(template=template, customer=request.user).first()
        if existing:
            return Response({"error": "You have already reviewed this template."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify entitlement for buyer status
        has_purchased = DownloadEntitlement.objects.filter(
            customer=request.user,
            template=template,
            is_active=True
        ).exists()

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(
            template=template,
            customer=request.user,
            is_verified_buyer=has_purchased
        )

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class AdminTemplateViewSet(viewsets.ModelViewSet):
    """
    Administrative management for all templates (draft, published, unpublished, archived).
    """
    queryset = Template.objects.all().select_related("category", "created_by").prefetch_related("tags").order_by("-created_at")
    serializer_class = AdminTemplateSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "category", "is_featured"]
    search_fields = ["title", "description", "compatibility"]
    ordering_fields = ["created_at", "price", "title"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        template = self.get_object()
        template.status = Template.Status.PUBLISHED
        template.save()
        return Response({"status": "Template published successfully."})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        template = self.get_object()
        template.status = Template.Status.UNPUBLISHED
        template.save()
        return Response({"status": "Template unpublished successfully."})

    @action(detail=True, methods=["post"])
    def toggle_featured(self, request, pk=None):
        template = self.get_object()
        template.is_featured = not template.is_featured
        template.save()
        return Response({"status": f"Template featured status set to {template.is_featured}."})


class TemplateVersionViewSet(viewsets.ModelViewSet):
    """Admin management for template release versions."""
    queryset = TemplateVersion.objects.all().order_by("-created_at")
    serializer_class = TemplateVersionSerializer
    permission_classes = [IsAdminUserRole]
    filterset_fields = ["template", "is_active"]


class TemplateCustomizationViewSet(viewsets.ModelViewSet):
    """
    Template customization draft editor workflow for registered customers.
    Allows customers to save and preview custom configurations (colors, typography, content).
    """
    serializer_class = TemplateCustomizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TemplateCustomization.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return TemplateCustomization.objects.none()
        return TemplateCustomization.objects.filter(customer=self.request.user).select_related("template")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class WishlistViewSet(viewsets.ModelViewSet):
    """
    Customer saved list / wishlist.
    """
    serializer_class = SavedTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete"]
    queryset = SavedTemplate.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return SavedTemplate.objects.none()
        return SavedTemplate.objects.filter(customer=self.request.user).select_related("template", "template__category")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=False, methods=["post"], url_path="toggle")
    def toggle(self, request):
        template_id = request.data.get("template_id")
        if not template_id:
            return Response({"error": "template_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        template = get_object_or_404(Template, id=template_id)
        saved_item = SavedTemplate.objects.filter(customer=request.user, template=template).first()

        if saved_item:
            saved_item.delete()
            return Response({"saved": False, "message": "Removed from wishlist."})
        else:
            SavedTemplate.objects.create(customer=request.user, template=template)
            return Response({"saved": True, "message": "Added to wishlist."}, status=status.HTTP_201_CREATED)
