from django.db import models


class SiteSettings(models.Model):
    """
    Singleton model storing global website configuration, company branding,
    and customizable landing page content.
    """
    # Branding & Identity
    company_name = models.CharField(max_length=100, default="Craftr")
    company_tagline = models.CharField(max_length=200, default="WordPress & Modern Templates")
    logo_text = models.CharField(max_length=50, default="Studio")
    logo_url = models.TextField(
        blank=True,
        default="",
        help_text="Custom logo image URL or Base64 data URL"
    )
    logo_icon = models.CharField(
        max_length=50,
        default="layers",
        help_text="Preset icon key when no image logo is uploaded"
    )
    contact_email = models.EmailField(default="support@craftr.studio")

    # Landing Page Hero Section
    hero_badge = models.CharField(
        max_length=150,
        default="WordPress-Inspired Template Marketplace & Live Studio"
    )
    hero_title = models.CharField(
        max_length=200,
        default="Discover, Customize & Launch"
    )
    hero_title_highlight = models.CharField(
        max_length=200,
        default="High-Converting Templates"
    )
    hero_subtitle = models.TextField(
        default="Browse our curated catalogue of responsive website templates. Tune color palettes, typography, and content in our live browser studio before downloading clean, verified packages."
    )
    cta_primary_text = models.CharField(max_length=80, default="Explore Catalogue")
    cta_secondary_text = models.CharField(max_length=80, default="Open Live Theme Studio")

    # Metrics / Trust Strip
    metric_1_value = models.CharField(max_length=50, default="500+")
    metric_1_label = models.CharField(max_length=100, default="Production Components")
    metric_2_value = models.CharField(max_length=50, default="100%")
    metric_2_label = models.CharField(max_length=100, default="Clean Verified Code")
    metric_3_value = models.CharField(max_length=50, default="Real-Time")
    metric_3_label = models.CharField(max_length=100, default="Theme Studio Editor")
    metric_4_value = models.CharField(max_length=50, default="4.9 / 5.0")
    metric_4_label = models.CharField(max_length=100, default="Customer Rating Score")

    # Promo Callout Banner
    promo_banner_active = models.BooleanField(default=True)
    promo_banner_title = models.CharField(max_length=200, default="Get 20% Off Any Template Today")
    promo_banner_text = models.TextField(
        default="Apply promo code at checkout to unlock immediate savings across our entire catalogue."
    )
    promo_coupon_code = models.CharField(max_length=50, default="WELCOME20")

    # Footer & Legal
    footer_description = models.TextField(
        default="The premier digital template marketplace inspired by WordPress. Discover curated themes, tweak settings in our live visual theme studio, and download production packages with verified licenses."
    )
    footer_copyright = models.CharField(
        max_length=200,
        default="© 2026 Craftr Studio & Marketplace. All rights reserved."
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website & Landing Settings"
        verbose_name_plural = "Website & Landing Settings"

    def __str__(self):
        return f"{self.company_name} Settings (ID: {self.id})"

    @classmethod
    def get_settings(cls):
        instance, _ = cls.objects.get_or_create(id=1)
        return instance

