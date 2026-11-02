import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import permissions, status
from django.db import connection
from django.utils import timezone
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiTypes
from rest_framework import serializers

from apps.common.models import SiteSettings
from apps.common.serializers import SiteSettingsSerializer
from apps.common.permissions import IsAdminOrReadOnly, IsAdminUserRole


class HealthCheckView(APIView):
    """
    Health check endpoint for container probes, load balancers, and deployment verification.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: OpenApiTypes.OBJECT})
    def get(self, request):
        db_status = "ok"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as exc:
            db_status = f"unhealthy: {str(exc)}"

        is_healthy = db_status == "ok"
        data = {
            "status": "healthy" if is_healthy else "degraded",
            "database": db_status,
            "timestamp": timezone.now().isoformat(),
            "environment": "production" if not getattr(request, "_debug", False) else "development",
            "version": "1.0.0",
        }
        return Response(data, status=status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE)


class SiteSettingsView(APIView):
    """
    Retrieve or update global website branding and landing page settings.
    GET: Public (all visitors).
    PUT/PATCH: Administrators only.
    """
    permission_classes = [IsAdminOrReadOnly]

    @extend_schema(responses={200: SiteSettingsSerializer})
    def get(self, request):
        settings_obj = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=SiteSettingsSerializer, responses={200: SiteSettingsSerializer})
    def put(self, request):
        settings_obj = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Audit logging if available
        try:
            from apps.audit.models import AuditLog
            AuditLog.log_action(
                user=request.user,
                action_type=AuditLog.ActionType.TEMPLATE_UPDATE,
                target_entity="SiteSettings",
                target_id=str(settings_obj.id),
                details=f"Updated site settings (Company: {settings_obj.company_name})",
                request=request
            )
        except Exception:
            pass

        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=SiteSettingsSerializer, responses={200: SiteSettingsSerializer})
    def patch(self, request):
        return self.put(request)


class LogoUploadView(APIView):
    """
    Upload a brand logo file (PNG, JPG, SVG, WebP, GIF) to private/public media storage.
    Automatically assigns the resulting URL to SiteSettings.logo_url.
    """
    permission_classes = [IsAdminUserRole]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        request=inline_serializer(name='LogoUploadRequest', fields={'file': serializers.FileField()}),
        responses={200: inline_serializer(name='LogoUploadResponse', fields={'url': serializers.CharField(), 'message': serializers.CharField()})}
    )
    def post(self, request):
        uploaded_file = request.FILES.get("file") or request.FILES.get("logo")
        if not uploaded_file:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 5MB)
        if uploaded_file.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds 5MB limit."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        allowed_extensions = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif", ".ico"]
        if ext not in allowed_extensions:
            return Response(
                {"error": f"Invalid format {ext}. Allowed formats: {', '.join(allowed_extensions)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate unique safe filename
        unique_name = f"brand_logo_{uuid.uuid4().hex[:8]}{ext}"
        save_path = os.path.join("logos", unique_name)

        saved_file = default_storage.save(save_path, ContentFile(uploaded_file.read()))
        logo_url = default_storage.url(saved_file)

        # Update SiteSettings instance
        settings_obj = SiteSettings.get_settings()
        settings_obj.logo_url = logo_url
        settings_obj.save(update_fields=["logo_url", "updated_at"])

        return Response(
            {
                "success": True,
                "message": "Logo uploaded successfully!",
                "logo_url": logo_url,
                "settings": SiteSettingsSerializer(settings_obj).data,
            },
            status=status.HTTP_200_OK,
        )
