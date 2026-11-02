from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.catalog.models import (
    Category,
    Tag,
    Template,
    TemplateVersion,
    TemplateCustomization,
    SavedTemplate,
    Review,
)


class CategorySerializer(serializers.ModelSerializer):
    template_count = serializers.IntegerField(source="templates.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "icon", "is_active", "display_order", "template_count"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class ReviewSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "rating",
            "title",
            "comment",
            "is_verified_buyer",
            "customer_email",
            "customer_name",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified_buyer", "created_at"]

    @extend_schema_field(serializers.CharField)
    def get_customer_name(self, obj):
        name = f"{obj.customer.first_name} {obj.customer.last_name}".strip()
        return name if name else obj.customer.username


class TemplateListSerializer(serializers.ModelSerializer):
    """Public template list view for the customer marketplace."""

    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Template
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "category",
            "tags",
            "price",
            "currency",
            "thumbnail",
            "preview_url",
            "current_version",
            "status",
            "is_featured",
            "average_rating",
            "review_count",
            "is_saved",
            "created_at",
        ]

    @extend_schema_field(serializers.BooleanField)
    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SavedTemplate.objects.filter(customer=request.user, template=obj).exists()
        return False


class TemplateDetailSerializer(serializers.ModelSerializer):
    """Detailed view for visitors and customers. Note: package_file is hidden!"""

    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    has_purchased = serializers.SerializerMethodField()
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Template
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "description",
            "category",
            "tags",
            "price",
            "currency",
            "thumbnail",
            "preview_url",
            "current_version",
            "status",
            "is_featured",
            "features",
            "compatibility",
            "default_config",
            "average_rating",
            "review_count",
            "reviews",
            "is_saved",
            "has_purchased",
            "created_at",
            "updated_at",
        ]

    @extend_schema_field(serializers.BooleanField)
    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SavedTemplate.objects.filter(customer=request.user, template=obj).exists()
        return False

    @extend_schema_field(serializers.BooleanField)
    def get_has_purchased(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from apps.downloads.models import DownloadEntitlement
            return DownloadEntitlement.objects.filter(customer=request.user, template=obj, is_active=True).exists()
        return False


class AdminTemplateSerializer(serializers.ModelSerializer):
    """Full template management serializer for administrators."""
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Template
        fields = "__all__"
        read_only_fields = ["id", "slug", "created_by", "created_at", "updated_at"]

    def to_internal_value(self, data):
        if hasattr(data, "_mutable") and not data._mutable:
            data = data.copy()
        elif isinstance(data, dict) and not hasattr(data, "_mutable"):
            data = dict(data)

        if "preview_url" in data:
            raw_url = data.get("preview_url")
            if raw_url:
                raw_url = str(raw_url).strip()
                if raw_url and not raw_url.startswith(("http://", "https://", "/")):
                    raw_url = f"https://{raw_url}"
                data["preview_url"] = raw_url
            else:
                data["preview_url"] = ""

        return super().to_internal_value(data)


class TemplateVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateVersion
        fields = ["id", "template", "version_number", "changelog", "package_file", "is_active", "created_at"]


class TemplateCustomizationSerializer(serializers.ModelSerializer):
    """Allows customers to edit and save template configurations/drafts."""

    template_title = serializers.CharField(source="template.title", read_only=True)
    template_thumbnail = serializers.ImageField(source="template.thumbnail", read_only=True)

    class Meta:
        model = TemplateCustomization
        fields = [
            "id",
            "template",
            "template_title",
            "template_thumbnail",
            "name",
            "config_data",
            "preview_watermarked_url",
            "is_purchased",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_purchased", "created_at", "updated_at"]


class SavedTemplateSerializer(serializers.ModelSerializer):
    template = TemplateListSerializer(read_only=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=Template.objects.filter(status=Template.Status.PUBLISHED),
        write_only=True,
        source="template"
    )

    class Meta:
        model = SavedTemplate
        fields = ["id", "template", "template_id", "created_at"]
        read_only_fields = ["id", "created_at"]
