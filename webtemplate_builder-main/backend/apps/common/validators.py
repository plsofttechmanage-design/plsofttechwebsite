import os
from django.core.exceptions import ValidationError
from django.conf import settings


def validate_package_file(file):
    """
    Validates uploaded downloadable template package:
    - Checks file extension (.zip, .tar.gz)
    - Checks file size against MAX_UPLOAD_SIZE_MB
    """
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = [".zip", ".tar.gz", ".tar", ".gz"]

    if ext not in valid_extensions and not file.name.endswith(".tar.gz"):
        raise ValidationError(
            f"Unsupported file format '{ext}'. Downloadable packages must be compressed archives (.zip, .tar.gz)."
        )

    max_size_bytes = getattr(settings, "MAX_UPLOAD_SIZE_MB", 50) * 1024 * 1024
    if file.size > max_size_bytes:
        raise ValidationError(
            f"File size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )


def validate_image_file(file):
    """
    Validates uploaded thumbnail or screenshot:
    - Checks file extension (.jpg, .jpeg, .png, .webp)
    - Checks file size (max 5 MB)
    """
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = [".jpg", ".jpeg", ".png", ".webp"]

    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported image format '{ext}'. Allowed: {', '.join(valid_extensions)}.")

    if file.size > 5 * 1024 * 1024:
        raise ValidationError("Image file size cannot exceed 5 MB.")

