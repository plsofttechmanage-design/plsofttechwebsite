from django.urls import path
from apps.audit.views import AdminAuditLogListView

app_name = "audit"

urlpatterns = [
    path("admin/logs/", AdminAuditLogListView.as_view(), name="admin_audit_logs"),
]

