from django.urls import path
from apps.downloads.views import (
    MyDownloadsListView,
    SecureDownloadFileView,
    AdminDownloadLogsListView,
)

app_name = "downloads"

urlpatterns = [
    path("my-downloads/", MyDownloadsListView.as_view(), name="my_downloads"),
    path("file/<uuid:entitlement_id>/", SecureDownloadFileView.as_view(), name="secure_download_file"),
    path("admin/logs/", AdminDownloadLogsListView.as_view(), name="admin_download_logs"),
]

