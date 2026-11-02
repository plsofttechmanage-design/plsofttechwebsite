from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """General representation of a User object."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "phone",
            "bio",
            "avatar",
            "is_verified",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "role", "is_verified", "is_active", "created_at", "updated_at"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Customer registration serializer."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Role.CUSTOMER,
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that embeds user profile info in response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "username": self.user.username,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,
            "is_admin": self.user.is_admin,
        }
        return data


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for customers updating their own profile."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone", "bio", "avatar"]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change requests."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for administrator viewing and managing user accounts."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "phone",
            "bio",
            "avatar",
            "is_verified",
            "is_active",
            "date_joined",
            "last_login",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "date_joined", "last_login", "created_at", "updated_at"]


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password": "New passwords do not match."})
        return attrs


