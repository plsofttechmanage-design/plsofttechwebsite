# Website Template Marketplace & Builder - Backend API

Production-ready backend API built with **Django 5 / 6**, **Django REST Framework (DRF)**, **JWT Authentication (SimpleJWT)**, and **drf-spectacular (OpenAPI 3.0 / Swagger)**.

---

## 🏗️ Architectural Overview

The backend is built around a clean, modular structure aligned with the project proposal:

```
backend/
├── config/                  # Core Django configuration & root URL router
│   ├── settings.py          # Unified settings supporting SQLite (dev) & MySQL (prod)
│   ├── urls.py              # Root API routing & Swagger / ReDoc endpoints
│   ├── wsgi.py / asgi.py    # Production web server interfaces
├── apps/
│   ├── accounts/            # Custom User model, JWT authentication, roles (Admin/Customer), profiles
│   ├── catalog/             # Categories, tags, templates (draft/published), versions, customization drafts, wishlist
│   ├── cart/                # Shopping cart, server-side price validation, availability checks
│   ├── orders/              # Orders, items, payment transactions, idempotent payment fulfillment
│   ├── downloads/           # Secure download entitlements, file streaming (private storage), download audit logs
│   ├── audit/               # Audit trail of administrative and security events
│   └── common/              # Shared pagination, custom error handling, permissions, file validators
├── media/                   # Public media (thumbnails, screenshots, avatars)
├── protected_media/         # Private storage for downloadable template packages (.zip)
├── manage.py
├── requirements.txt
├── openapi_schema.yml       # Exported OpenAPI 3.0 schema
└── .env.example
```

---

## 🚀 Quickstart & Setup

### 1. Activate Virtual Environment
```powershell
# Windows
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Run Database Migrations
```bash
python backend/manage.py migrate
```

### 4. Seed Initial Data (Admin, Customer, Categories, Templates)
```bash
python backend/manage.py seed_data
```

This command pre-seeds:
- **Administrator Account:** `admin@example.com` / `AdminPass123!`
- **Demo Customer Account:** `customer@example.com` / `CustomerPass123!`
- 5 Pre-configured Categories (SaaS, E-Commerce, Portfolio, Corporate, Blog)
- Standard tags (React, Next.js, TailwindCSS, Dark Mode, etc.)
- 5 Realistic Templates (4 Published, 1 Draft) with sample downloadable ZIP packages
- 1 Demo Paid Order with active download entitlement

### 5. Start Development Server
```bash
python backend/manage.py runserver
```

---

## 📖 API Documentation & Endpoints

Interactive Swagger UI and ReDoc are pre-configured:
- **Swagger UI:** `http://127.0.0.1:8000/api/docs/`
- **ReDoc:** `http://127.0.0.1:8000/api/redoc/`
- **OpenAPI 3.0 Schema:** `http://127.0.0.1:8000/api/schema/`
- **Django Admin:** `http://127.0.0.1:8000/admin/`

### Key Endpoints Summary:

| Area | Method | Endpoint | Description |
|------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/register/` | Register new customer account |
| **Auth** | POST | `/api/auth/login/` | Obtain JWT access + refresh tokens |
| **Auth** | POST | `/api/auth/token/refresh/` | Refresh JWT access token |
| **Profile**| GET/PUT| `/api/auth/profile/` | View/update current user profile |
| **Admin Users** | GET | `/api/auth/admin/users/` | Search/filter customer accounts |
| **Catalog** | GET | `/api/catalog/categories/` | List categories with template counts |
| **Catalog** | GET | `/api/catalog/templates/` | Browse published templates (search, filter) |
| **Catalog** | GET | `/api/catalog/templates/<slug>/` | Template details, features, demo preview |
| **Customizer**| GET/POST| `/api/catalog/customizations/` | Save & load customized template drafts |
| **Wishlist** | GET/POST| `/api/catalog/wishlist/toggle/` | Add/remove templates from wishlist |
| **Cart** | GET/POST/DEL | `/api/cart/` | View, add to cart, or clear cart |
| **Orders** | POST | `/api/orders/checkout/` | Server-validated checkout from cart |
| **Orders** | POST | `/api/orders/verify-payment/` | Idempotent payment verification & fulfillment |
| **Orders** | GET | `/api/orders/my-orders/` | Customer order history |
| **Downloads** | GET | `/api/downloads/my-downloads/` | Customer purchased templates |
| **Downloads** | GET | `/api/downloads/file/<id>/` | **Secure file stream** (checks entitlement & logs IP) |
| **Admin** | GET | `/api/orders/admin/dashboard-summary/` | Revenue, orders, and customer analytics |
| **Admin** | POST | `/api/catalog/admin/templates/<id>/publish/` | Publish draft template |
| **Audit** | GET | `/api/audit/admin/logs/` | Administrative audit trail |

---

## 🔒 Security Implementations

1. **Role-Based Access Control (RBAC):** Distinct `ADMIN` and `CUSTOMER` roles enforced across DRF permission classes (`IsAdminUserRole`, `IsCustomerUserRole`, `IsOwnerOrAdmin`).
2. **Private File Storage & Entitlement Verification:** Downloadable `.zip` packages are never accessible directly via static URL. Requests must go through `/api/downloads/file/<entitlement_id>/`, which verifies that the user owns the entitlement, hasn't exceeded the maximum download quota, and logs the client's IP and user agent.
3. **Idempotent Payment Verification:** Payment fulfillment prevents duplicate order processing or duplicate entitlements even with repeated webhook/verification attempts.
4. **Server-Side Price Recalculation:** Prices and availability are re-verified directly against the database at checkout time.

