from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.common.permissions import IsAdminUserRole


class AdminAuditLogListView(generics.ListAPIView):
    """
    Administrative audit trail viewer.
    Filters by action, entity_type, user, and date range.
    """
    queryset = AuditLog.objects.all().select_related("user")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["action", "entity_type", "user"]
    search_fields = ["action", "entity_type", "entity_id", "user__email"]
    ordering_fields = ["created_at", "action"]

