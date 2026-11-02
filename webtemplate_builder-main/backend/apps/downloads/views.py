import os
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings

from drf_spectacular.utils import extend_schema

from apps.downloads.models import DownloadEntitlement, DownloadLog
from apps.downloads.serializers import DownloadEntitlementSerializer, DownloadLogSerializer
from apps.common.permissions import IsAdminUserRole


class MyDownloadsListView(generics.ListAPIView):
    """
    List of purchased templates and download entitlements for the logged-in customer.
    """
    serializer_class = DownloadEntitlementSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = DownloadEntitlement.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return DownloadEntitlement.objects.none()
        return DownloadEntitlement.objects.filter(
            customer=self.request.user,
            is_active=True
        ).select_related("template", "order")


class SecureDownloadFileView(APIView):
    """
    Secure file streaming endpoint.
    Verifies that the customer has a valid entitlement before serving the file.
    Does NOT expose public file paths.
    Logs each download event with timestamp and IP address.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: bytes, 403: dict, 404: dict})
    def get(self, request, entitlement_id):
        # Enforce entitlement check
        entitlement = get_object_or_404(
            DownloadEntitlement.objects.select_related("template", "customer"),
            id=entitlement_id
        )

        # Check ownership: customer must own the entitlement or be admin
        if entitlement.customer != request.user and not request.user.is_admin:
            return Response(
                {"error": "You do not have permission to download this template."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if entitlement rules allow download
        can_download, reason = entitlement.can_download()
        if not can_download:
            return Response({"error": reason}, status=status.HTTP_403_FORBIDDEN)

        template = entitlement.template
        if not template.package_file:
            return Response(
                {"error": "Download package is currently unavailable for this template. Please contact support."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            file_path = template.package_file.path
            if not os.path.exists(file_path):
                return Response(
                    {"error": "Template package file not found on server storage."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Record download log
            client_ip = request.META.get("HTTP_X_FORWARDED_FOR")
            if client_ip:
                client_ip = client_ip.split(",")[0].strip()
            else:
                client_ip = request.META.get("REMOTE_ADDR")

            DownloadLog.objects.create(
                entitlement=entitlement,
                customer=request.user,
                ip_address=client_ip,
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )

            # Increment download count
            entitlement.download_count += 1
            entitlement.save(update_fields=["download_count", "updated_at"])

            # Stream the file securely
            filename = os.path.basename(file_path)
            response = FileResponse(open(file_path, "rb"), as_attachment=True, filename=filename)
            return response

        except Exception as exc:
            return Response(
                {"error": f"Failed to retrieve download package: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AdminDownloadLogsListView(generics.ListAPIView):
    """
    Administrator view to inspect download activity and audit history.
    """
    queryset = DownloadLog.objects.all().select_related("customer", "entitlement", "entitlement__template")
    serializer_class = DownloadLogSerializer
    permission_classes = [IsAdminUserRole]
