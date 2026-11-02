from rest_framework import permissions


class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the ADMIN role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, "role", None) == "ADMIN" or request.user.is_staff or request.user.is_superuser)
        )


class IsCustomerUserRole(permissions.BasePermission):
    """
    Allows access to users with the CUSTOMER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, "role", None) == "CUSTOMER" or request.user.is_staff or request.user.is_superuser)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access if the user is the owner of the object or an administrator.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, "role", None) == "ADMIN" or request.user.is_staff or request.user.is_superuser:
            return True

        # Check common owner field names
        owner = getattr(obj, "customer", None) or getattr(obj, "user", None) or getattr(obj, "created_by", None)
        if owner is not None:
            return owner == request.user

        # Direct user object comparison (e.g. User profile)
        return obj == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access for any request, but write access only to administrators.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, "role", None) == "ADMIN" or request.user.is_staff or request.user.is_superuser)
        )

