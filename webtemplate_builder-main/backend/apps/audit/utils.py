from apps.audit.models import AuditLog


def log_audit_event(action, entity_type, entity_id, details=None, user=None, request=None):
    """
    Utility helper to log important administrative or security actions across apps.
    """
    if details is None:
        details = {}

    client_ip = None
    if request:
        if not user and request.user.is_authenticated:
            user = request.user
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.META.get("REMOTE_ADDR")

    try:
        return AuditLog.objects.create(
            user=user,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            details=details,
            ip_address=client_ip,
        )
    except Exception:
        # Logging failure should not disrupt main transaction
        return None

