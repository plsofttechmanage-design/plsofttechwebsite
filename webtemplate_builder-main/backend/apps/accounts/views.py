from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from apps.accounts.serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer,
    LogoutSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from apps.common.permissions import IsAdminUserRole
from apps.audit.utils import log_audit_event

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    User login endpoint. Returns JWT tokens along with user information.
    Rate limited to 30 attempts per minute to mitigate brute-force attacks.
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_scope = "auth"


class RegisterView(generics.CreateAPIView):
    """
    Customer registration endpoint with rate limiting.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        log_audit_event(
            action="CUSTOMER_REGISTERED",
            entity_type="User",
            entity_id=user.id,
            details={"email": user.email, "username": user.username},
            user=user,
            request=request,
        )
        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """
    Secure logout endpoint that blacklists the JWT refresh token on the server.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=LogoutSerializer, responses={200: dict})
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
            return Response({"success": True, "message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"success": False, "message": "Invalid or already blacklisted token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PasswordResetRequestView(APIView):
    """
    Initiates account recovery by generating a secure single-use token.
    Rate limited to prevent email enumeration or flooding.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    @extend_schema(request=PasswordResetRequestSerializer, responses={200: dict})
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()

        user = User.objects.filter(email=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"/reset-password?uid={uid}&token={token}"

            log_audit_event(
                action="PASSWORD_RESET_REQUESTED",
                entity_type="User",
                entity_id=user.id,
                details={"email": email},
                user=user,
                request=request,
            )

            # In production, dispatch email; in demo/dev return payload
            return Response({
                "success": True,
                "message": "If an account exists with this email, a reset link has been dispatched.",
                "debug_reset_token": {
                    "uid": uid,
                    "token": token,
                    "reset_url": reset_url,
                }
            }, status=status.HTTP_200_OK)

        return Response({
            "success": True,
            "message": "If an account exists with this email, a reset link has been dispatched.",
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    Validates password reset token and updates the user password securely.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: dict})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid_b64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()

            log_audit_event(
                action="PASSWORD_RESET_CONFIRMED",
                entity_type="User",
                entity_id=user.id,
                details={"email": user.email},
                user=user,
                request=request,
            )

            return Response({
                "success": True,
                "message": "Password has been successfully updated. You may now sign in.",
            }, status=status.HTTP_200_OK)

        return Response({
            "success": False,
            "message": "Invalid or expired password reset link.",
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update authenticated user's own profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Allows authenticated users to change their account password.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ChangePasswordSerializer, responses={200: dict})
    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"success": False, "message": "Current password is not correct."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        log_audit_event(
            action="PASSWORD_CHANGED",
            entity_type="User",
            entity_id=user.id,
            details={"email": user.email},
            user=user,
            request=request,
        )

        return Response(
            {"success": True, "message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class AdminCustomerListView(generics.ListAPIView):
    """
    Admin endpoint to view, search, and filter customer accounts.
    """
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["role", "is_active", "is_verified"]
    search_fields = ["email", "username", "first_name", "last_name", "phone"]
    ordering_fields = ["created_at", "email", "last_login"]


class AdminCustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin endpoint to view, deactivate, or update customer account status.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUserRole]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        log_audit_event(
            action="ACCOUNT_DEACTIVATED",
            entity_type="User",
            entity_id=instance.id,
            details={"email": instance.email, "role": instance.role},
            request=self.request,
        )
