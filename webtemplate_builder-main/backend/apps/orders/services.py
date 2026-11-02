import uuid
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.orders.models import Order, OrderItem, PaymentTransaction, Coupon
from apps.cart.models import Cart
from apps.catalog.models import Template
from apps.downloads.models import DownloadEntitlement
from apps.audit.utils import log_audit_event


def create_order_from_cart(customer, payment_method="MOCK", coupon_code=None):
    """
    Creates a new pending order from the customer's shopping cart.
    Recalculates current prices on the server and applies valid coupons.
    """
    cart, _ = Cart.objects.get_or_create(customer=customer)
    cart_items = cart.items.select_related("template").all()

    if not cart_items.exists():
        raise ValidationError("Shopping cart is empty.")

    # Validate that all templates are published and available
    unavailable_items = [item.template.title for item in cart_items if item.template.status != Template.Status.PUBLISHED]
    if unavailable_items:
        raise ValidationError(f"The following templates are no longer published: {', '.join(unavailable_items)}")

    # Recalculate subtotal directly from database
    subtotal = sum(item.template.price for item in cart_items)
    discount_amount = Decimal("0.00")
    coupon_obj = None

    if coupon_code:
        coupon_obj = Coupon.objects.filter(code__iexact=coupon_code.strip()).first()
        if coupon_obj:
            valid, reason = coupon_obj.is_valid_for_amount(subtotal)
            if not valid:
                raise ValidationError(f"Coupon error: {reason}")
            discount_amount = coupon_obj.calculate_discount(subtotal)
        else:
            raise ValidationError("Invalid coupon code.")

    total_amount = max(Decimal("0.00"), subtotal - discount_amount)

    with transaction.atomic():
        order = Order.objects.create(
            customer=customer,
            status=Order.Status.PENDING,
            total_amount=total_amount,
            discount_amount=discount_amount,
            coupon=coupon_obj,
            currency="USD",
            payment_method=payment_method,
        )

        if coupon_obj:
            coupon_obj.times_used += 1
            coupon_obj.save(update_fields=["times_used"])

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                template=item.template,
                template_title=item.template.title,
                price_snapshot=item.template.price,
                license_type="Standard Single-Use",
            )

        # Create initial pending payment transaction
        txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        PaymentTransaction.objects.create(
            order=order,
            transaction_id=txn_id,
            payment_gateway=payment_method,
            amount=total_amount,
            currency="USD",
            status=PaymentTransaction.Status.PENDING,
        )

    return order


def verify_and_fulfill_payment(order, transaction_id, is_success, provider="MOCK", payload=None, request=None):
    """
    Idempotent payment verification and order fulfillment.
    Unlocks DownloadEntitlements only upon verified success.
    """
    if payload is None:
        payload = {}

    with transaction.atomic():
        # Lock order row for update
        order = Order.objects.select_for_update().get(id=order.id)

        # Find or create transaction record
        txn, created = PaymentTransaction.objects.get_or_create(
            transaction_id=transaction_id,
            defaults={
                "order": order,
                "payment_gateway": provider,
                "amount": order.total_amount,
                "currency": order.currency,
                "status": PaymentTransaction.Status.PENDING,
                "raw_response": payload,
            }
        )

        if not is_success:
            txn.status = PaymentTransaction.Status.FAILED
            txn.raw_response = payload
            txn.save()
            order.status = Order.Status.FAILED
            order.save()
            return order, False, "Payment verification indicated failure."

        # If order was already paid, return safely (Idempotency)
        if order.status == Order.Status.PAID:
            return order, True, "Payment already verified and fulfilled."

        # Mark transaction and order as paid
        txn.status = PaymentTransaction.Status.SUCCESS
        txn.verified_at = timezone.now()
        txn.raw_response = payload
        txn.save()

        order.status = Order.Status.PAID
        order.save()

        # Unlock Download Entitlements for each purchased item
        for item in order.items.select_related("template").all():
            if item.template:
                DownloadEntitlement.objects.get_or_create(
                    customer=order.customer,
                    template=item.template,
                    order=order,
                    defaults={
                        "version": item.template.current_version,
                        "max_downloads": 20,
                        "download_count": 0,
                        "is_active": True,
                    }
                )

        # Clear customer's shopping cart
        Cart.objects.filter(customer=order.customer).update(updated_at=timezone.now())
        cart = Cart.objects.filter(customer=order.customer).first()
        if cart:
            cart.items.all().delete()

        # Audit log entry
        log_audit_event(
            request=request,
            user=order.customer,
            action="ORDER_PAID_FULFILLED",
            entity_type="Order",
            entity_id=order.order_number,
            details={
                "total_amount": str(order.total_amount),
                "items_count": order.items.count(),
                "transaction_id": transaction_id,
                "provider": provider,
            }
        )

    return order, True, "Payment verified successfully. Downloads unlocked."

