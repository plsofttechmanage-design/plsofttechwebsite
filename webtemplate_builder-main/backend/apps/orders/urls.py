from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.orders.views import (
    CheckoutView,
    PaymentVerifyView,
    ApplyCouponView,
    CustomerOrderListView,
    CustomerOrderDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminDashboardSummaryView,
    AdminCouponViewSet,
)

app_name = "orders"

router = DefaultRouter()
router.register(r"admin/coupons", AdminCouponViewSet, basename="admin-coupons")

urlpatterns = [
    # Customer order workflow
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("verify-payment/", PaymentVerifyView.as_view(), name="verify_payment"),
    path("apply-coupon/", ApplyCouponView.as_view(), name="apply_coupon"),
    path("my-orders/", CustomerOrderListView.as_view(), name="my_orders"),
    path("my-orders/<str:order_number>/", CustomerOrderDetailView.as_view(), name="my_order_detail"),

    # Admin order management
    path("admin/orders/", AdminOrderListView.as_view(), name="admin_order_list"),
    path("admin/orders/<str:order_number>/", AdminOrderDetailView.as_view(), name="admin_order_detail"),
    path("admin/dashboard-summary/", AdminDashboardSummaryView.as_view(), name="admin_dashboard_summary"),

    # Admin coupons router
    path("", include(router.urls)),
]
