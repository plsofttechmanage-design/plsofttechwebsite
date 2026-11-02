# Website Template Marketplace & Builder - React Frontend

Modern, high-performance React frontend built with **Vite**, **Tailwind CSS v4**, **React Router v7**, and **Lucide Icons**.

---

## 🎨 Implemented Features & Modules

### 1. Customer & Public Marketplace
- **Home / Marketplace (`/`):** Hero headline, live template search, category filter pills with template counts, sorting (Featured, Price, Alphabetical), and responsive template grid.
- **Template Details (`/templates/:slug`):** High-res previews, compatibility notes, bulleted features list, live demo links, "Add to Cart", and "Customize in Studio".
- **Template Customizer Studio (`/studio`):**
  - WordPress-inspired live template editor.
  - Left panel: interactive brand accent color picker + presets, font selector, hero headline & subtitle editors, CTA button label, and section visibility toggles (features, pricing table, testimonials).
  - Right canvas: real-time reactive preview with responsive device emulation (Desktop, Tablet, Mobile) and watermarked preview mode.
  - Ability to save customization drafts to customer account.
- **Shopping Cart & Checkout (`/cart`):** Live server-validated subtotal recalculation, item removal, and interactive checkout modal.
- **Payment Simulation Modal:** Choose mock gateway (Instant Mock, Stripe, Razorpay), review total, and execute verified payment fulfillment.
- **My Downloads / Purchases (`/downloads`):** Unlocked automatically after verified payment; shows remaining download quota (e.g. 1 / 20) and 1-click package file stream download.
- **Wishlist / Saved Templates (`/wishlist`):** Bookmark templates with instantaneous state sync.
- **User Profile (`/profile`):** Update personal details and change account password.

### 2. Admin Management Console (`/admin`)
- **Dashboard Overview (`/admin/dashboard`):** Real-time metrics on total revenue ($), total orders, paid orders, active templates, and registered customers, plus recent transactions.
- **Template Management (`/admin/templates`):** Full template catalogue view, 1-click Publish / Unpublish toggle, 1-click Feature toggle, and "Create New Template" modal with zip package upload.
- **Customer Management (`/admin/customers`):** List accounts, search by name/email, and toggle active status.
- **Orders & Payments (`/admin/orders`):** Order references, transaction amounts, payment methods, and status filters.
- **Audit Logs (`/admin/audit`):** Immutable log of administrative and security events with timestamps and IP tracking.

### 3. Authentication
- **Login (`/login`):** JWT token authentication with **1-click Quick Demo buttons** for Demo Admin (`admin@example.com`) and Demo Customer (`customer@example.com`).
- **Registration (`/register`):** Customer sign-up with password confirmation.

---

## 🚀 How to Run the Frontend

```bash
# 1. From the frontend directory
cd frontend

# 2. Start the development server
npm run dev
```

The app will start at `http://localhost:5173/`. All API calls to `/api/*` are automatically proxied to the Django backend at `http://127.0.0.1:8000`.

### Production Build
```bash
npm run build
```
This generates an optimized static build in `frontend/dist/`.
