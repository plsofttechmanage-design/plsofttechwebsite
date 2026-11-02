from django.contrib import admin
from apps.catalog.models import (
    Category,
    Tag,
    Template,
    TemplateVersion,
    TemplateCustomization,
    SavedTemplate,
    Review,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "display_order", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


class TemplateVersionInline(admin.TabularInline):
    model = TemplateVersion
    extra = 1


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "status", "is_featured", "current_version", "created_at")
    list_filter = ("status", "is_featured", "category")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [TemplateVersionInline]


@admin.register(TemplateCustomization)
class TemplateCustomizationAdmin(admin.ModelAdmin):
    list_display = ("customer", "template", "name", "is_purchased", "updated_at")
    list_filter = ("is_purchased", "created_at")
    search_fields = ("customer__email", "template__title", "name")


@admin.register(SavedTemplate)
class SavedTemplateAdmin(admin.ModelAdmin):
    list_display = ("customer", "template", "created_at")
    search_fields = ("customer__email", "template__title")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("template", "customer", "rating", "is_verified_buyer", "created_at")
    list_filter = ("rating", "is_verified_buyer", "created_at")
    search_fields = ("template__title", "customer__email", "title")

