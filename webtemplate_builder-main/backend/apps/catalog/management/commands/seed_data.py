import os
import zipfile
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from apps.catalog.models import Category, Tag, Template, Review
from apps.cart.models import Cart
from apps.orders.models import Order, OrderItem, PaymentTransaction, Coupon
from apps.downloads.models import DownloadEntitlement
from apps.common.models import SiteSettings

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with initial users, categories, tags, templates, and packages for demonstration."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding database..."))

        # 1. Create Admin User
        admin_user, created = User.objects.get_or_create(
            email="admin@example.com",
            defaults={
                "username": "admin",
                "first_name": "Admin",
                "last_name": "Manager",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_verified": True,
            }
        )
        if created:
            admin_user.set_password("AdminPass123!")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin@example.com / AdminPass123!"))
        else:
            self.stdout.write("Admin user already exists.")

        # 2. Create Sample Customer User
        customer_user, created = User.objects.get_or_create(
            email="customer@example.com",
            defaults={
                "username": "customer_demo",
                "first_name": "Jane",
                "last_name": "Doe",
                "role": User.Role.CUSTOMER,
                "is_verified": True,
            }
        )
        if created:
            customer_user.set_password("CustomerPass123!")
            customer_user.save()
            self.stdout.write(self.style.SUCCESS("Created customer user: customer@example.com / CustomerPass123!"))
        else:
            self.stdout.write("Customer user already exists.")

        # Ensure Cart exists for customer
        Cart.objects.get_or_create(customer=customer_user)

        # 3. Create Categories
        categories_data = [
            {"name": "SaaS & Tech Landing", "slug": "saas-landing", "description": "High-conversion landing pages for SaaS, AI tools, and startups.", "icon": "cpu"},
            {"name": "E-Commerce & Stores", "slug": "ecommerce", "description": "Modern storefronts, product catalogs, and shopping cart flows.", "icon": "shopping-bag"},
            {"name": "Creative Portfolio", "slug": "portfolio", "description": "Showcases for designers, photographers, developers, and studios.", "icon": "palette"},
            {"name": "Corporate & Business", "slug": "corporate", "description": "Professional multi-page templates for consulting, finance, and corporate agencies.", "icon": "briefcase"},
            {"name": "Blog & Editorial", "slug": "blog-editorial", "description": "Clean typography and article layouts for creators and news platforms.", "icon": "book-open"},
        ]

        categories = {}
        for c_data in categories_data:
            cat, _ = Category.objects.get_or_create(slug=c_data["slug"], defaults=c_data)
            categories[cat.slug] = cat

        # 4. Create Tags
        tag_names = ["React", "Next.js", "TailwindCSS", "Responsive", "Minimalist", "Dark Mode", "TypeScript", "E-commerce"]
        tags = {}
        for t_name in tag_names:
            tag_obj, _ = Tag.objects.get_or_create(name=t_name)
            tags[t_name] = tag_obj

        # Helper to create a dummy ZIP file in memory
        def create_dummy_zip_content(template_title):
            import io
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.writestr("README.md", f"# {template_title}\nThank you for purchasing this template package.\nIncludes React components, HTML5, CSS.")
                zf.writestr("index.html", f"<!DOCTYPE html><html><head><title>{template_title}</title></head><body><h1>Welcome to {template_title}</h1></body></html>")
                zf.writestr("package.json", '{"name": "template", "version": "1.0.0", "scripts": {"dev": "vite"}}')
            buf.seek(0)
            return buf.read()

        # 5. Create Templates
        templates_data = [
            {
                "title": "Nova SaaS Landing & Dashboard",
                "slug": "nova-saas-landing",
                "category": categories["saas-landing"],
                "price": Decimal("49.00"),
                "short_description": "Modern dark-mode first landing page and dashboard template for AI and SaaS startups.",
                "description": "Nova is an ultra-fast, responsive SaaS landing page template built with React and TailwindCSS. It includes 15+ pre-styled components, pricing tables, hero sections, and customer testimonial sliders.",
                "status": Template.Status.PUBLISHED,
                "is_featured": True,
                "current_version": "1.2.0",
                "features": ["15+ Customizable React Components", "Dark & Light Mode Switcher", "Framer Motion Animations", "Full Responsive Layout"],
                "compatibility": "React 18+, Next.js 14, TailwindCSS 3",
                "preview_url": "https://preview.example.com/nova-saas",
                "tags": [tags["React"], tags["TailwindCSS"], tags["Dark Mode"], tags["TypeScript"]],
                "default_config": {
                    "primaryColor": "#6366f1",
                    "fontFamily": "Inter, sans-serif",
                    "heroTitle": "Scale Your AI Startup 10x Faster",
                    "heroSubtitle": "The ultimate boilerplate for modern web platforms.",
                    "showPricing": True,
                }
            },
            {
                "title": "Aura Studio Minimalist Portfolio",
                "slug": "aura-studio-portfolio",
                "category": categories["portfolio"],
                "price": Decimal("29.00"),
                "short_description": "Clean, elegant typography and grid portfolio for creative directors and photographers.",
                "description": "Aura Studio lets your visual work shine with distraction-free typography, masonry gallery grids, and project case study layouts.",
                "status": Template.Status.PUBLISHED,
                "is_featured": True,
                "current_version": "1.0.0",
                "features": ["Interactive Masonry Project Grid", "Case Study Details Layout", "Contact Form Integration", "Mobile Touch Gestures"],
                "compatibility": "HTML5, CSS3, Vanilla JS, React ready",
                "preview_url": "https://preview.example.com/aura-studio",
                "tags": [tags["Minimalist"], tags["Responsive"], tags["TailwindCSS"]],
                "default_config": {
                    "primaryColor": "#0f172a",
                    "fontFamily": "Playfair Display, serif",
                    "heroTitle": "Selected Works (2024-2026)",
                    "heroSubtitle": "Design Director & Visual Artist",
                }
            },
            {
                "title": "Apex Digital Commerce Storefront",
                "slug": "apex-digital-commerce",
                "category": categories["ecommerce"],
                "price": Decimal("59.00"),
                "short_description": "High-performance digital products and merchandise storefront template.",
                "description": "Apex is optimized for digital goods, subscriptions, and apparel. Includes product filters, slide-over cart drawer, and responsive checkout page mockups.",
                "status": Template.Status.PUBLISHED,
                "is_featured": False,
                "current_version": "2.0.1",
                "features": ["Slide-out Cart Drawer", "Instant Product Search & Filter", "SEO & OpenGraph Optimized", "Checkout & Order Review Pages"],
                "compatibility": "Next.js, React, TailwindCSS",
                "preview_url": "https://preview.example.com/apex-commerce",
                "tags": [tags["E-commerce"], tags["Next.js"], tags["React"]],
                "default_config": {
                    "primaryColor": "#059669",
                    "fontFamily": "Plus Jakarta Sans, sans-serif",
                    "heroTitle": "Curated Essentials for Makers",
                    "heroSubtitle": "Premium gear and digital templates.",
                }
            },
            {
                "title": "Vanguard Enterprise Corporate Suite",
                "slug": "vanguard-enterprise",
                "category": categories["corporate"],
                "price": Decimal("79.00"),
                "short_description": "Multi-page corporate website for fintech, law firms, and consulting organizations.",
                "description": "Comprehensive corporate template featuring About Us, Service Offerings, Leadership Team, Case Studies, and Investor Relations layouts.",
                "status": Template.Status.PUBLISHED,
                "is_featured": False,
                "current_version": "1.1.0",
                "features": ["20+ Enterprise Page Templates", "Interactive Financial Charts", "Team Roster & Bio Modals", "GDPR Cookie Banner Component"],
                "compatibility": "React 18+, Bootstrap 5 / TailwindCSS",
                "preview_url": "https://preview.example.com/vanguard-corp",
                "tags": [tags["React"], tags["Responsive"]],
                "default_config": {
                    "primaryColor": "#1e3a8a",
                    "fontFamily": "Roboto, sans-serif",
                    "heroTitle": "Strategic Advisory for Global Enterprises",
                    "heroSubtitle": "Trusted by Fortune 500 leaders worldwide.",
                }
            },
            {
                "title": "Chronicle Editorial & Modern Blog",
                "slug": "chronicle-editorial-blog",
                "category": categories["blog-editorial"],
                "price": Decimal("19.00"),
                "short_description": "Thoughtful, reader-focused blogging layout with reading time estimates and newsletter forms.",
                "description": "Designed for writers, journalists, and technical publication teams. Features code highlighting, footnote support, and clean reading typography.",
                "status": Template.Status.DRAFT,  # Kept in Draft to demonstrate Admin publish workflow!
                "is_featured": False,
                "current_version": "0.9.0",
                "features": ["Syntax Code Highlighting", "Estimated Reading Time", "Newsletter Subscription CTA", "Multi-author support"],
                "compatibility": "Markdown, React, HTML5",
                "preview_url": "https://preview.example.com/chronicle-blog",
                "tags": [tags["Minimalist"], tags["TailwindCSS"]],
                "default_config": {
                    "primaryColor": "#ea580c",
                    "fontFamily": "Merriweather, serif",
                    "heroTitle": "Stories, Thoughts & Tech Explorations",
                    "heroSubtitle": "A publication on software, design, and culture.",
                }
            },
        ]

        for t_data in templates_data:
            tag_list = t_data.pop("tags")
            template, created = Template.objects.get_or_create(
                slug=t_data["slug"],
                defaults={
                    **t_data,
                    "created_by": admin_user,
                }
            )
            template.tags.set(tag_list)

            # Attach a downloadable dummy package archive if not present
            if not template.package_file:
                zip_bytes = create_dummy_zip_content(template.title)
                template.package_file.save(
                    f"{template.slug}-v{template.current_version}.zip",
                    ContentFile(zip_bytes),
                    save=True
                )

            self.stdout.write(f"Template ready: {template.title} [{template.status}]")

        # 6. Create a Demo Purchased Order & Download Entitlement for customer_user
        nova_template = Template.objects.get(slug="nova-saas-landing")
        if not Order.objects.filter(customer=customer_user, status=Order.Status.PAID).exists():
            demo_order = Order.objects.create(
                customer=customer_user,
                status=Order.Status.PAID,
                total_amount=nova_template.price,
                currency="USD",
                payment_method="MOCK",
            )
            OrderItem.objects.create(
                order=demo_order,
                template=nova_template,
                template_title=nova_template.title,
                price_snapshot=nova_template.price,
                license_type="Standard Single-Use",
            )
            PaymentTransaction.objects.create(
                order=demo_order,
                transaction_id="TXN-DEMO-SAMPLE-001",
                payment_gateway="MOCK",
                amount=nova_template.price,
                currency="USD",
                status=PaymentTransaction.Status.SUCCESS,
            )
            DownloadEntitlement.objects.create(
                customer=customer_user,
                template=nova_template,
                order=demo_order,
                version=nova_template.current_version,
                max_downloads=20,
                download_count=1,
                is_active=True,
            )
            self.stdout.write(self.style.SUCCESS(f"Created demo paid order ({demo_order.order_number}) with download entitlement."))

        # 7. Create Demo Promotional Coupons
        c1, _ = Coupon.objects.get_or_create(
            code="WELCOME20",
            defaults={
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": Decimal("20.00"),
                "min_order_amount": Decimal("10.00"),
                "is_active": True,
            }
        )
        c2, _ = Coupon.objects.get_or_create(
            code="SAVE10",
            defaults={
                "discount_type": Coupon.DiscountType.FIXED,
                "discount_value": Decimal("10.00"),
                "min_order_amount": Decimal("30.00"),
                "is_active": True,
            }
        )
        self.stdout.write(self.style.SUCCESS("Created demo coupons: WELCOME20 (20% off) & SAVE10 ($10 off)"))

        # 8. Create Demo Reviews
        Review.objects.get_or_create(
            template=nova_template,
            customer=customer_user,
            defaults={
                "rating": 5,
                "title": "Outstanding quality & clean React code!",
                "comment": "The dark mode styling and animations saved our engineering team weeks of work. Truly production-ready.",
                "is_verified_buyer": True,
            }
        )

        aura_template = Template.objects.filter(slug="aura-studio-portfolio").first()
        if aura_template:
            Review.objects.get_or_create(
                template=aura_template,
                customer=admin_user,
                defaults={
                    "rating": 5,
                    "title": "Minimalist perfection for creatives",
                    "comment": "The typography hierarchy and layout spacing is top tier. Highly recommended for studio websites.",
                    "is_verified_buyer": True,
                }
            )

        # 9. Ensure Site Settings exist
        SiteSettings.get_settings()
        self.stdout.write(self.style.SUCCESS("Initialized default website branding and landing page settings."))

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))

