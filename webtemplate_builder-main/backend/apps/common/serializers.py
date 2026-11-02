from rest_framework import serializers
from apps.common.models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "company_name",
            "company_tagline",
            "logo_text",
            "logo_url",
            "logo_icon",
            "contact_email",
            "hero_badge",
            "hero_title",
            "hero_title_highlight",
            "hero_subtitle",
            "cta_primary_text",
            "cta_secondary_text",
            "metric_1_value",
            "metric_1_label",
            "metric_2_value",
            "metric_2_label",
            "metric_3_value",
            "metric_3_label",
            "metric_4_value",
            "metric_4_label",
            "promo_banner_active",
            "promo_banner_title",
            "promo_banner_text",
            "promo_coupon_code",
            "footer_description",
            "footer_copyright",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]

