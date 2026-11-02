from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from apps.downloads.models import DownloadEntitlement, DownloadLog
from apps.catalog.serializers import TemplateListSerializer


class DownloadEntitlementSerializer(serializers.ModelSerializer):
    template = TemplateListSerializer(read_only=True)
    can_download = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = DownloadEntitlement
        fields = [
            "id",
            "template",
            "order",
            "version",
            "max_downloads",
            "download_count",
            "expires_at",
            "is_active",
            "can_download",
            "download_url",
            "created_at",
        ]
        read_only_fields = ["id", "download_count", "created_at"]

    @extend_schema_field(serializers.DictField)
    def get_can_download(self, obj):
        allowed, reason = obj.can_download()
        return {"allowed": allowed, "reason": reason}

    @extend_schema_field(serializers.CharField)
    def get_download_url(self, obj):
        request = self.context.get("request")
        url = f"/api/downloads/file/{obj.id}/"
        if request:
            return request.build_absolute_uri(url)
        return url


class DownloadLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DownloadLog
        fields = ["id", "entitlement", "customer", "ip_address", "user_agent", "downloaded_at"]
        read_only_fields = fields
