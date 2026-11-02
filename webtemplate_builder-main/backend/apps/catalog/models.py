from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg
from apps.common.validators import validate_package_file, validate_image_file


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Icon identifier or SVG key")
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


def template_package_path(instance, filename):
    return f"packages/template_{instance.id or 'new'}/{filename}"


class Template(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        UNPUBLISHED = "UNPUBLISHED", "Unpublished"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="templates")
    tags = models.ManyToManyField(Tag, blank=True, related_name="templates")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default="USD")

    thumbnail = models.ImageField(
        upload_to="thumbnails/",
        blank=True,
        null=True,
        validators=[validate_image_file]
    )
    preview_url = models.URLField(max_length=500, blank=True, null=True, help_text="Live demo or iframe preview link")

    # Private downloadable package
    package_file = models.FileField(
        upload_to=template_package_path,
        blank=True,
        null=True,
        validators=[validate_package_file],
        help_text="Protected archive file (.zip) unlocked only after verified payment"
    )

    current_version = models.CharField(max_length=20, default="1.0.0")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False)

    features = models.JSONField(default=list, blank=True, help_text="List of feature bullet points")
    compatibility = models.CharField(max_length=255, default="React 18+, HTML5/CSS3, TailwindCSS")
    default_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Default customizable settings schema (colors, typography, section contents)"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_templates"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Template.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.status}) - ${self.price}"

    @property
    def average_rating(self):
        avg = self.reviews.aggregate(Avg("rating"))["rating__avg"]
        return round(avg, 1) if avg else 0.0

    @property
    def review_count(self):
        return self.reviews.count()


class TemplateVersion(models.Model):
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name="versions")
    version_number = models.CharField(max_length=20)
    changelog = models.TextField(blank=True, null=True)
    package_file = models.FileField(
        upload_to="packages/versions/",
        validators=[validate_package_file]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("template", "version_number")

    def __str__(self):
        return f"{self.template.title} v{self.version_number}"


class TemplateCustomization(models.Model):
    """
    Saves a customer's customized draft / configuration of a template.
    Allows editing text, colors, fonts, and layout options as per proposal section 3B.
    """
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customizations"
    )
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name="customizations")
    name = models.CharField(max_length=150, default="Untitled Customization")
    config_data = models.JSONField(
        default=dict,
        help_text="Customized values for colors, typography, texts, and sections"
    )
    preview_watermarked_url = models.URLField(max_length=500, blank=True, null=True)
    is_purchased = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.customer.email} - {self.name} ({self.template.title})"


class SavedTemplate(models.Model):
    """Customer wishlist / saved list."""
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_templates"
    )
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("customer", "template")

    def __str__(self):
        return f"{self.customer.email} saved {self.template.title}"


class Review(models.Model):
    """
    Verified customer ratings and reviews for published templates.
    """
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name="reviews")
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating from 1 to 5"
    )
    title = models.CharField(max_length=150)
    comment = models.TextField()
    is_verified_buyer = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("template", "customer")

    def __str__(self):
        return f"{self.rating}★ by {self.customer.email} on {self.template.title}"


