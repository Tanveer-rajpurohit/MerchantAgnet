import logging
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.merchant_profile import MerchantProfile
from app.models.order import Order, OrderStatus
from app.repositories import analytics_repository

logger = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30), name="IST")


def parse_timeframe_window(
    timeframe: str,
    now_ist: datetime,
) -> tuple[datetime | None, datetime | None, str]:
    """Parse a timeframe string into (start_time, end_time, display_label) in IST."""
    tf = (timeframe or "today").strip().lower().replace(" ", "_").replace("-", "_")

    if tf in ("today", "day", "daily"):
        start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now_ist
        label = f"Today ({now_ist.strftime('%A, %B %d, %Y')})"
    elif tf in ("yesterday", "prev_day", "last_day"):
        yesterday = now_ist - timedelta(days=1)
        start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
        label = f"Yesterday ({yesterday.strftime('%A, %B %d, %Y')})"
    elif tf in ("this_week", "week", "weekly"):
        days_since_monday = now_ist.weekday()
        start = (now_ist - timedelta(days=days_since_monday)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        end = now_ist
        label = f"This Week (Since Monday, {start.strftime('%B %d, %Y')})"
    elif tf in ("this_month", "month", "monthly"):
        start = now_ist.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now_ist
        label = f"This Month ({now_ist.strftime('%B %Y')})"
    elif tf in ("this_year", "year", "yearly", "annual"):
        start = now_ist.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now_ist
        label = f"This Year ({now_ist.year})"
    elif tf in ("all_time", "all", "overall", "total", "lifetime"):
        start = None
        end = now_ist
        label = "All-Time (Store Lifetime)"
    elif tf in ("summary", "overview", "comprehensive", "dashboard", "full", "all_in_one"):
        start = now_ist.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now_ist
        label = "Comprehensive Summary (Today + Yesterday + Month + Udhaar)"
    else:
        # Fallback to today
        start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now_ist
        label = f"Today ({now_ist.strftime('%A, %B %d, %Y')})"

    return start, end, label


def _as_ist(dt: datetime | None) -> datetime | None:
    """Normalize datetime to timezone-aware IST."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc).astimezone(IST)
    return dt.astimezone(IST)


def _normalize_name(name: str | None) -> str:
    """Standardize customer name to title case for consistent grouping."""
    raw = (name or "Customer").strip()
    return raw.title() if raw.lower() != "customer" else "Customer"


async def calculate_comprehensive_store_summary(
    db: AsyncSession,
    merchant: MerchantProfile,
    customer_name: str | None = None,
) -> str:
    """Consolidated financial summary covering Today, Yesterday, This Month, Udhaar, and Profit in one pass."""
    now_ist = datetime.now(IST)
    today_start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday = now_ist - timedelta(days=1)
    yesterday_start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
    month_start = now_ist.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    query_start = min(yesterday_start, month_start)
    cust_filter = customer_name.strip() if customer_name and customer_name.strip() else None

    # 1. Fetch Paid Links & Paid Orders in the combined window
    paid_links = await analytics_repository.get_paid_payment_links(
        db=db,
        merchant_id=merchant.id,
        start_time=query_start,
        end_time=now_ist,
        customer_filter=cust_filter,
    )
    paid_link_order_ids: set[uuid.UUID] = {
        l.order_id for l in paid_links if l.order_id is not None
    }

    all_paid_orders = await analytics_repository.get_paid_orders(
        db=db,
        merchant_id=merchant.id,
        start_time=query_start,
        end_time=now_ist,
        customer_filter=cust_filter,
    )
    standalone_paid_orders = [
        o for o in all_paid_orders if o.id not in paid_link_order_ids
    ]

    # Metrics buckets
    today_links = Decimal("0.00")
    today_orders = Decimal("0.00")
    today_txns = 0

    yesterday_links = Decimal("0.00")
    yesterday_orders = Decimal("0.00")
    yesterday_txns = 0

    month_links = Decimal("0.00")
    month_orders = Decimal("0.00")
    month_txns = 0

    today_paying_customers: dict[str, dict] = {}

    for l in paid_links:
        ts = _as_ist(l.paid_at or l.created_at)
        amt = Decimal(str(l.amount))
        cname = _normalize_name(l.customer_name)
        cphone = l.customer_phone or ""

        if ts and ts >= month_start:
            month_links += amt
            month_txns += 1
        if ts and yesterday_start <= ts <= yesterday_end:
            yesterday_links += amt
            yesterday_txns += 1
        if ts and ts >= today_start:
            today_links += amt
            today_txns += 1
            if cname not in today_paying_customers:
                today_paying_customers[cname] = {"name": cname, "phone": cphone, "amount": Decimal("0.00")}
            today_paying_customers[cname]["amount"] += amt

    for o in standalone_paid_orders:
        ts = _as_ist(o.updated_at or o.created_at)
        amt = Decimal(str(o.paid_amount)) if o.paid_amount > 0 else (
            Decimal(str(o.total_amount)) if o.status == OrderStatus.paid else Decimal("0.00")
        )
        raw_cust_name = o.customer.full_name if o.customer else "Customer"
        cname = _normalize_name(raw_cust_name)
        cphone = (o.customer.phone_number if o.customer else "") or ""

        if ts and ts >= month_start:
            month_orders += amt
            month_txns += 1
        if ts and yesterday_start <= ts <= yesterday_end:
            yesterday_orders += amt
            yesterday_txns += 1
        if ts and ts >= today_start:
            today_orders += amt
            today_txns += 1
            if cname not in today_paying_customers:
                today_paying_customers[cname] = {"name": cname, "phone": cphone, "amount": Decimal("0.00")}
            today_paying_customers[cname]["amount"] += amt

    today_total = today_links + today_orders
    yesterday_total = yesterday_links + yesterday_orders
    month_total = month_links + month_orders

    # 2. Udhaar (Pending Receivables)
    all_unpaid_orders = await analytics_repository.get_unpaid_orders(
        db=db,
        merchant_id=merchant.id,
        customer_filter=cust_filter,
    )
    standalone_unpaid_links = await analytics_repository.get_unpaid_standalone_links(
        db=db,
        merchant_id=merchant.id,
        customer_filter=cust_filter,
    )

    today_udhaar = Decimal("0.00")
    today_udhaar_count = 0
    total_udhaar = Decimal("0.00")
    pending_by_customer: dict[str, dict] = {}

    for o in all_unpaid_orders:
        due = Decimal(str(o.total_amount)) - Decimal(str(o.paid_amount))
        if due < Decimal("0.00"):
            due = Decimal("0.00")
        total_udhaar += due

        ts = _as_ist(o.created_at)
        if ts and ts >= today_start:
            today_udhaar += due
            today_udhaar_count += 1

        raw_cust_name = o.customer.full_name if o.customer else "Customer"
        cname = _normalize_name(raw_cust_name)
        cphone = (o.customer.phone_number if o.customer else "") or ""
        if cname not in pending_by_customer:
            pending_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "orders_count": 0,
            }
        pending_by_customer[cname]["amount"] += due
        pending_by_customer[cname]["orders_count"] += 1

    for l in standalone_unpaid_links:
        due = Decimal(str(l.amount))
        total_udhaar += due

        ts = _as_ist(l.created_at)
        if ts and ts >= today_start:
            today_udhaar += due
            today_udhaar_count += 1

        cname = _normalize_name(l.customer_name)
        cphone = l.customer_phone or ""
        if cname not in pending_by_customer:
            pending_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "orders_count": 0,
            }
        pending_by_customer[cname]["amount"] += due
        pending_by_customer[cname]["orders_count"] += 1

    sorted_pending = sorted(
        pending_by_customer.values(), key=lambda x: x["amount"], reverse=True
    )

    # 3. Formatted Summary Report
    lines = [
        "STORE_COMPREHENSIVE_FINANCIAL_SUMMARY",
        f"STORE: {merchant.business_name}",
        f"AS_OF: {now_ist.strftime('%A, %B %d, %Y (%I:%M %p IST)')}",
        "",
        "1. COLLECTIONS & EARNINGS BREAKDOWN:",
        f"- TODAY ({now_ist.strftime('%B %d')}): ₹{today_total:.2f} ({today_txns} paid transaction{'s' if today_txns != 1 else ''})",
        f"  * Paid Payment Links: ₹{today_links:.2f} | Store Orders: ₹{today_orders:.2f}",
        f"- YESTERDAY ({yesterday_start.strftime('%B %d')}): ₹{yesterday_total:.2f} ({yesterday_txns} paid transaction{'s' if yesterday_txns != 1 else ''})",
        f"  * Paid Payment Links: ₹{yesterday_links:.2f} | Store Orders: ₹{yesterday_orders:.2f}",
        f"- THIS MONTH ({now_ist.strftime('%B %Y')} MTD): ₹{month_total:.2f} ({month_txns} paid transaction{'s' if month_txns != 1 else ''})",
        f"  * Paid Payment Links: ₹{month_links:.2f} | Store Orders: ₹{month_orders:.2f}",
    ]

    if today_paying_customers:
        lines.append("")
        lines.append(f"CUSTOMERS WHO PAID TODAY ({len(today_paying_customers)}):")
        for c in sorted(today_paying_customers.values(), key=lambda x: x["amount"], reverse=True)[:10]:
            phone_str = f" [Ph: {c['phone']}]" if c['phone'] else ""
            lines.append(f"- {c['name']}: ₹{c['amount']:.2f}{phone_str}")
    else:
        lines.append("")
        lines.append("CUSTOMERS WHO PAID TODAY: No collections logged yet today.")

    lines.extend([
        "",
        "2. PENDING RECEIVABLES / UDHAAR:",
        f"- New Udhaar Created Today: ₹{today_udhaar:.2f} ({today_udhaar_count} unpaid orders)",
        f"- Total Outstanding Store Udhaar (All-Time): ₹{total_udhaar:.2f} across {len(sorted_pending)} customer{'s' if len(sorted_pending) != 1 else ''}",
    ])

    if sorted_pending:
        lines.append("")
        lines.append("CUSTOMERS WITH OUTSTANDING UDHAAR (TOP DEBTORS):")
        for c in sorted_pending[:15]:
            phone_str = f" [Ph: {c['phone']}]" if c['phone'] else ""
            lines.append(
                f"- {c['name']}: ₹{c['amount']:.2f} pending ({c['orders_count']} unpaid order{'s' if c['orders_count'] != 1 else ''}){phone_str}"
            )
    else:
        lines.append("")
        lines.append("CUSTOMERS WITH OUTSTANDING UDHAAR: All customer balances are clear! ₹0.00 udhaar.")

    lines.extend([
        "",
        f"3. OVERALL COLLECTIONS SUMMARY ({now_ist.strftime('%B %Y')} MTD):",
        f"- Total Month Revenue: ₹{month_total:.2f} ({month_txns} paid transactions)",
        f"- Total Store Udhaar Pending: ₹{total_udhaar:.2f}",
    ])

    return "\n".join(lines)


async def calculate_store_earnings_analytics(
    db: AsyncSession,
    merchant: MerchantProfile,
    timeframe: str = "today",
    customer_name: str | None = None,
) -> str:
    """Business service for store earnings analytics, udhaar breakdown, and financial calculations."""
    tf = (timeframe or "today").strip().lower().replace(" ", "_").replace("-", "_")
    if tf in ("summary", "overview", "comprehensive", "dashboard", "full", "all_in_one"):
        return await calculate_comprehensive_store_summary(
            db=db,
            merchant=merchant,
            customer_name=customer_name,
        )

    now_ist = datetime.now(IST)
    start_time, end_time, timeframe_label = parse_timeframe_window(timeframe, now_ist)
    cust_filter = customer_name.strip() if customer_name and customer_name.strip() else None

    # 1. Paid payment links
    paid_links = await analytics_repository.get_paid_payment_links(
        db=db,
        merchant_id=merchant.id,
        start_time=start_time,
        end_time=end_time,
        customer_filter=cust_filter,
    )
    paid_link_order_ids: set[uuid.UUID] = {
        l.order_id for l in paid_links if l.order_id is not None
    }
    link_revenue = sum((Decimal(str(l.amount)) for l in paid_links), Decimal("0.00"))

    # 2. Paid orders (deduplicated against paid links)
    all_paid_orders = await analytics_repository.get_paid_orders(
        db=db,
        merchant_id=merchant.id,
        start_time=start_time,
        end_time=end_time,
        customer_filter=cust_filter,
    )
    standalone_paid_orders = [
        o for o in all_paid_orders if o.id not in paid_link_order_ids
    ]
    order_revenue = Decimal("0.00")
    for o in standalone_paid_orders:
        if o.paid_amount > 0:
            order_revenue += Decimal(str(o.paid_amount))
        elif o.status == OrderStatus.paid:
            order_revenue += Decimal(str(o.total_amount))

    total_collected_revenue = link_revenue + order_revenue
    total_paid_transactions = len(paid_links) + len(standalone_paid_orders)

    # 3. Customer breakdown for paid revenue
    paid_by_customer: dict[str, dict] = {}

    for l in paid_links:
        cname = _normalize_name(l.customer_name)
        if cname not in paid_by_customer:
            paid_by_customer[cname] = {
                "name": cname,
                "phone": l.customer_phone or "",
                "amount": Decimal("0.00"),
                "links_count": 0,
                "orders_count": 0,
            }
        paid_by_customer[cname]["amount"] += Decimal(str(l.amount))
        paid_by_customer[cname]["links_count"] += 1

    for o in standalone_paid_orders:
        raw_cust_name = o.customer.full_name if o.customer else "Customer"
        cname = _normalize_name(raw_cust_name)
        cphone = (o.customer.phone_number if o.customer else "") or ""
        if cname not in paid_by_customer:
            paid_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "links_count": 0,
                "orders_count": 0,
            }
        paid_amt = Decimal(str(o.paid_amount)) if o.paid_amount > 0 else (
            Decimal(str(o.total_amount)) if o.status == OrderStatus.paid else Decimal("0.00")
        )
        paid_by_customer[cname]["amount"] += paid_amt
        paid_by_customer[cname]["orders_count"] += 1

    sorted_paying_customers = sorted(
        paid_by_customer.values(), key=lambda x: x["amount"], reverse=True
    )

    # 4. Pending receivables / Udhaar
    all_unpaid_orders = await analytics_repository.get_unpaid_orders(
        db=db,
        merchant_id=merchant.id,
        customer_filter=cust_filter,
    )
    standalone_unpaid_links = await analytics_repository.get_unpaid_standalone_links(
        db=db,
        merchant_id=merchant.id,
        customer_filter=cust_filter,
    )

    pending_in_period = Decimal("0.00")
    pending_in_period_count = 0
    total_all_time_pending = Decimal("0.00")
    total_all_time_pending_count = len(all_unpaid_orders) + len(standalone_unpaid_links)

    pending_by_customer: dict[str, dict] = {}

    for o in all_unpaid_orders:
        due = Decimal(str(o.total_amount)) - Decimal(str(o.paid_amount))
        if due < Decimal("0.00"):
            due = Decimal("0.00")
        total_all_time_pending += due

        if start_time is None or o.created_at >= start_time:
            if end_time is None or o.created_at <= end_time:
                pending_in_period += due
                pending_in_period_count += 1

        raw_cust_name = o.customer.full_name if o.customer else "Customer"
        cname = _normalize_name(raw_cust_name)
        cphone = (o.customer.phone_number if o.customer else "") or ""
        if cname not in pending_by_customer:
            pending_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "orders_count": 0,
                "largest_order": Decimal("0.00"),
            }
        pending_by_customer[cname]["amount"] += due
        pending_by_customer[cname]["orders_count"] += 1
        if due > pending_by_customer[cname]["largest_order"]:
            pending_by_customer[cname]["largest_order"] = due

    for l in standalone_unpaid_links:
        due = Decimal(str(l.amount))
        total_all_time_pending += due
        if start_time is None or l.created_at >= start_time:
            if end_time is None or l.created_at <= end_time:
                pending_in_period += due
                pending_in_period_count += 1

        cname = _normalize_name(l.customer_name)
        cphone = l.customer_phone or ""
        if cname not in pending_by_customer:
            pending_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "orders_count": 0,
                "largest_order": Decimal("0.00"),
            }
        pending_by_customer[cname]["amount"] += due
        pending_by_customer[cname]["orders_count"] += 1
        if due > pending_by_customer[cname]["largest_order"]:
            pending_by_customer[cname]["largest_order"] = due

    sorted_pending_customers = sorted(
        pending_by_customer.values(), key=lambda x: x["amount"], reverse=True
    )

    # 5. Contextual Fallback for Today's Zero Collections
    yesterday_context = ""
    if timeframe.strip().lower() in ("today", "day") and total_collected_revenue == Decimal("0.00"):
        yesterday = now_ist - timedelta(days=1)
        y_start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        y_end = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)

        y_order_sum, y_link_sum, y_total = await analytics_repository.get_previous_day_collection(
            db=db, merchant_id=merchant.id, y_start=y_start, y_end=y_end
        )
        yesterday_context = (
            f"\nNOTE ON TODAY'S EARNINGS:\n"
            f"- No cash collections or paid orders logged yet today ({now_ist.strftime('%A, %B %d')}).\n"
            f"- Previous Day's Collection ({yesterday.strftime('%b %d')}): ₹{y_total:.2f} "
            f"(Orders: ₹{y_order_sum:.2f}, Payment Links: ₹{y_link_sum:.2f}).\n"
        )

    # 8. Assemble Clean Output
    lines = [
        f"STORE_FINANCIAL_ANALYTICS",
        f"STORE: {merchant.business_name}",
        f"TIMEFRAME: {timeframe_label}",
    ]
    if cust_filter:
        lines.append(f"CUSTOMER_FILTER: {cust_filter}")

    lines.extend([
        "",
        f"1. REVENUE & COLLECTIONS (CASH EARNED):",
        f"- Total Collected: ₹{total_collected_revenue:.2f} ({total_paid_transactions} paid transaction{'s' if total_paid_transactions != 1 else ''})",
        f"  * Paid Payment Links: ₹{link_revenue:.2f} ({len(paid_links)} links)",
        f"  * Paid Store Orders: ₹{order_revenue:.2f} ({len(standalone_paid_orders)} orders)",
    ])

    if sorted_paying_customers:
        lines.append("")
        lines.append(f"CUSTOMERS WHO PAID ({len(sorted_paying_customers)}):")
        for c in sorted_paying_customers[:10]:
            details = []
            if c["orders_count"] > 0:
                details.append(f"{c['orders_count']} order{'s' if c['orders_count'] != 1 else ''}")
            if c["links_count"] > 0:
                details.append(f"{c['links_count']} payment link{'s' if c['links_count'] != 1 else ''}")
            det_str = f" ({', '.join(details)})" if details else ""
            phone_str = f" [Ph: {c['phone']}]" if c['phone'] else ""
            lines.append(f"- {c['name']}: ₹{c['amount']:.2f}{det_str}{phone_str}")
    else:
        lines.append("")
        lines.append(f"CUSTOMERS WHO PAID: None in this timeframe.")

    lines.extend([
        "",
        f"2. PENDING RECEIVABLES / UDHAAR:",
        f"- Unpaid Orders Created in This Timeframe: ₹{pending_in_period:.2f} ({pending_in_period_count} orders)",
        f"- Total Outstanding Store Udhaar (All-Time): ₹{total_all_time_pending:.2f} ({total_all_time_pending_count} pending transactions across {len(sorted_pending_customers)} customer{'s' if len(sorted_pending_customers) != 1 else ''})",
    ])

    if sorted_pending_customers:
        lines.append("")
        lines.append(f"CUSTOMERS WITH OUTSTANDING DUES (TOP UDHAAR):")
        for c in sorted_pending_customers[:10]:
            phone_str = f" [Ph: {c['phone']}]" if c['phone'] else ""
            lines.append(
                f"- {c['name']}: ₹{c['amount']:.2f} pending ({c['orders_count']} unpaid order{'s' if c['orders_count'] != 1 else ''}, highest order: ₹{c['largest_order']:.2f}){phone_str}"
            )

    if cust_filter:
        lines.extend([
            "",
            f"3. CUSTOMER ACCOUNT BALANCE SUMMARY:",
            f"- Total Paid in Timeframe: ₹{total_collected_revenue:.2f}",
            f"- Total Outstanding Udhaar (All-Time): ₹{total_all_time_pending:.2f}",
            f"- Status: {'All dues cleared! No pending balance.' if total_all_time_pending <= Decimal('0.00') else f'Outstanding pending debt of ₹{total_all_time_pending:.2f}'}",
        ])

    if yesterday_context:
        lines.append(yesterday_context)

    return "\n".join(lines)


async def get_daily_collection_service(
    db: AsyncSession,
    merchant: MerchantProfile,
    day: str = "today",
) -> str:
    """Pure daily cash register collection (cash & UPI inflows).

    Strictly no monthly overhead expenses (rent/salary) are deducted here!
    """
    now_ist = datetime.now(IST)
    is_yesterday = (day or "today").strip().lower() in ("yesterday", "prev_day", "last_day", "kal")

    if is_yesterday:
        target_date = now_ist - timedelta(days=1)
        start_time = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_time = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        day_label = f"Yesterday ({target_date.strftime('%A, %B %d, %Y')})"
    else:
        target_date = now_ist
        start_time = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_time = target_date
        day_label = f"Today ({target_date.strftime('%A, %B %d, %Y')})"

    # 1. Fetch Paid Links in day window
    paid_links = await analytics_repository.get_paid_payment_links(
        db=db,
        merchant_id=merchant.id,
        start_time=start_time,
        end_time=end_time,
    )
    paid_link_order_ids = {l.order_id for l in paid_links if l.order_id is not None}
    link_revenue = sum((Decimal(str(l.amount)) for l in paid_links), Decimal("0.00"))

    # 2. Fetch Paid Orders in day window (deduplicated against paid links)
    all_paid_orders = await analytics_repository.get_paid_orders(
        db=db,
        merchant_id=merchant.id,
        start_time=start_time,
        end_time=end_time,
    )
    standalone_paid_orders = [o for o in all_paid_orders if o.id not in paid_link_order_ids]
    order_revenue = Decimal("0.00")
    for o in standalone_paid_orders:
        if o.paid_amount > 0:
            order_revenue += Decimal(str(o.paid_amount))
        elif o.status == OrderStatus.paid:
            order_revenue += Decimal(str(o.total_amount))

    total_collected = link_revenue + order_revenue
    total_txns = len(paid_links) + len(standalone_paid_orders)

    # 3. Customer breakdown of who paid
    paid_customers: dict[str, dict] = {}
    for l in paid_links:
        cname = _normalize_name(l.customer_name)
        if cname not in paid_customers:
            paid_customers[cname] = {"name": cname, "phone": l.customer_phone or "", "amount": Decimal("0.00"), "links": 0, "orders": 0}
        paid_customers[cname]["amount"] += Decimal(str(l.amount))
        paid_customers[cname]["links"] += 1

    for o in standalone_paid_orders:
        raw_cust_name = o.customer.full_name if o.customer else "Customer"
        cname = _normalize_name(raw_cust_name)
        cphone = (o.customer.phone_number if o.customer else "") or ""
        if cname not in paid_customers:
            paid_customers[cname] = {"name": cname, "phone": cphone, "amount": Decimal("0.00"), "links": 0, "orders": 0}
        paid_amt = Decimal(str(o.paid_amount)) if o.paid_amount > 0 else (
            Decimal(str(o.total_amount)) if o.status == OrderStatus.paid else Decimal("0.00")
        )
        paid_customers[cname]["amount"] += paid_amt
        paid_customers[cname]["orders"] += 1

    sorted_customers = sorted(paid_customers.values(), key=lambda x: x["amount"], reverse=True)

    # 4. Context for ₹0 Today
    yesterday_context = ""
    if not is_yesterday and total_collected == Decimal("0.00"):
        yesterday = now_ist - timedelta(days=1)
        y_start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        y_end = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
        y_orders, y_links, y_tot = await analytics_repository.get_previous_day_collection(
            db=db, merchant_id=merchant.id, y_start=y_start, y_end=y_end
        )
        yesterday_context = (
            f"\nNOTE:\n"
            f"- No payments or orders collected yet today ({now_ist.strftime('%A, %B %d')}).\n"
            f"- Yesterday's Total Collection ({yesterday.strftime('%b %d')}): ₹{y_tot:.2f} "
            f"(Orders: ₹{y_orders:.2f}, Payment Links: ₹{y_links:.2f}).\n"
        )

    lines = [
        "DAILY_COLLECTION_AND_PROFIT_REPORT",
        f"STORE: {merchant.business_name}",
        f"PERIOD: {day_label}",
        "",
        f"1. STORE EARNINGS & PROFIT (TOTAL CASH & UPI COLLECTED): ₹{total_collected:.2f} ({total_txns} paid transaction{'s' if total_txns != 1 else ''})",
        f"- Paid Payment Links: ₹{link_revenue:.2f} ({len(paid_links)} links)",
        f"- Paid Store Orders: ₹{order_revenue:.2f} ({len(standalone_paid_orders)} orders)",
        "",
        "NOTE: In retail store operations, daily earnings/profit is the gross collection from sales. Fixed monthly overheads (rent, salaries) are NOT deducted on a daily basis.",
    ]

    if sorted_customers:
        lines.append("")
        lines.append(f"CUSTOMERS WHO PAID ({len(sorted_customers)}):")
        for c in sorted_customers:
            details = []
            if c["orders"] > 0:
                details.append(f"{c['orders']} order{'s' if c['orders'] != 1 else ''}")
            if c["links"] > 0:
                details.append(f"{c['links']} link{'s' if c['links'] != 1 else ''}")
            det_str = f" ({', '.join(details)})" if details else ""
            phone_str = f" [Ph: {c['phone']}]" if c["phone"] else ""
            lines.append(f"- {c['name']}: ₹{c['amount']:.2f}{det_str}{phone_str}")
    else:
        lines.append("")
        lines.append("CUSTOMERS WHO PAID: None in this period.")

    if yesterday_context:
        lines.append(yesterday_context)

    return "\n".join(lines)


async def get_customer_udhaar_ledger_service(
    db: AsyncSession,
    merchant: MerchantProfile,
    customer_name: str | None = None,
) -> str:
    """Customer udhaar (credit ledger), outstanding balances, and customer phone numbers."""
    now_ist = datetime.now(IST)
    today_start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    cust_filter = customer_name.strip() if customer_name and customer_name.strip() else None

    all_unpaid_orders = await analytics_repository.get_unpaid_orders(
        db=db,
        merchant_id=merchant.id,
        customer_filter=cust_filter,
    )
    standalone_unpaid_links = await analytics_repository.get_unpaid_standalone_links(
        db=db,
        merchant_id=merchant.id,
        customer_filter=cust_filter,
    )

    today_udhaar = Decimal("0.00")
    today_udhaar_count = 0
    total_udhaar = Decimal("0.00")
    pending_by_customer: dict[str, dict] = {}

    for o in all_unpaid_orders:
        due = Decimal(str(o.total_amount)) - Decimal(str(o.paid_amount))
        if due < Decimal("0.00"):
            due = Decimal("0.00")
        total_udhaar += due

        ts = _as_ist(o.created_at)
        if ts and ts >= today_start:
            today_udhaar += due
            today_udhaar_count += 1

        raw_cust_name = o.customer.full_name if o.customer else "Customer"
        cname = _normalize_name(raw_cust_name)
        cphone = (o.customer.phone_number if o.customer else "") or ""
        if cname not in pending_by_customer:
            pending_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "orders_count": 0,
                "largest_order": Decimal("0.00"),
            }
        pending_by_customer[cname]["amount"] += due
        pending_by_customer[cname]["orders_count"] += 1
        if due > pending_by_customer[cname]["largest_order"]:
            pending_by_customer[cname]["largest_order"] = due

    for l in standalone_unpaid_links:
        due = Decimal(str(l.amount))
        total_udhaar += due

        ts = _as_ist(l.created_at)
        if ts and ts >= today_start:
            today_udhaar += due
            today_udhaar_count += 1

        cname = _normalize_name(l.customer_name)
        cphone = l.customer_phone or ""
        if cname not in pending_by_customer:
            pending_by_customer[cname] = {
                "name": cname,
                "phone": cphone,
                "amount": Decimal("0.00"),
                "orders_count": 0,
                "largest_order": Decimal("0.00"),
            }
        pending_by_customer[cname]["amount"] += due
        pending_by_customer[cname]["orders_count"] += 1
        if due > pending_by_customer[cname]["largest_order"]:
            pending_by_customer[cname]["largest_order"] = due

    sorted_debtors = sorted(pending_by_customer.values(), key=lambda x: x["amount"], reverse=True)

    lines = [
        "CUSTOMER_UDHAAR_LEDGER",
        f"STORE: {merchant.business_name}",
        f"AS_OF: {now_ist.strftime('%A, %B %d, %Y')}",
    ]
    if cust_filter:
        lines.append(f"FILTER_CUSTOMER: {cust_filter}")

    lines.extend([
        "",
        f"1. SUMMARY:",
        f"- Total Outstanding Store Udhaar (All-Time): ₹{total_udhaar:.2f} ({len(all_unpaid_orders) + len(standalone_unpaid_links)} unpaid transactions across {len(sorted_debtors)} customer{'s' if len(sorted_debtors) != 1 else ''})",
        f"- New Udhaar Given Today ({now_ist.strftime('%b %d')}): ₹{today_udhaar:.2f} ({today_udhaar_count} unpaid orders)",
    ])

    if sorted_debtors:
        lines.append("")
        lines.append(f"2. CUSTOMERS WITH PENDING DUES ({len(sorted_debtors)}):")
        for c in sorted_debtors:
            phone_str = f" [Ph: {c['phone']}]" if c['phone'] else ""
            lines.append(
                f"- {c['name']}: ₹{c['amount']:.2f} pending ({c['orders_count']} unpaid order{'s' if c['orders_count'] != 1 else ''}, highest: ₹{c['largest_order']:.2f}){phone_str}"
            )
    else:
        lines.append("")
        lines.append("2. CUSTOMERS WITH PENDING DUES: All balances are fully cleared! No outstanding udhaar.")

    return "\n".join(lines)


async def get_store_revenue_report_service(
    db: AsyncSession,
    merchant: MerchantProfile,
    timeframe: str = "this_month",
) -> str:
    """Store financial revenue and sales collections report.

    Pure collections & order volume only. Expenses are handled exclusively by get_current_expenses!
    """
    now_ist = datetime.now(IST)
    start_time, end_time, timeframe_label = parse_timeframe_window(timeframe, now_ist)

    # Date range string
    if start_time is not None:
        date_range_str = f"{start_time.strftime('%B %d, %Y')} to {end_time.strftime('%B %d, %Y')}"
    else:
        date_range_str = f"Store Inception to {end_time.strftime('%B %d, %Y')}"

    # 1. Revenue
    paid_links = await analytics_repository.get_paid_payment_links(
        db=db,
        merchant_id=merchant.id,
        start_time=start_time,
        end_time=end_time,
    )
    paid_link_order_ids = {l.order_id for l in paid_links if l.order_id is not None}
    link_rev = sum((Decimal(str(l.amount)) for l in paid_links), Decimal("0.00"))

    all_paid_orders = await analytics_repository.get_paid_orders(
        db=db,
        merchant_id=merchant.id,
        start_time=start_time,
        end_time=end_time,
    )
    standalone_orders = [o for o in all_paid_orders if o.id not in paid_link_order_ids]
    order_rev = Decimal("0.00")
    for o in standalone_orders:
        if o.paid_amount > 0:
            order_rev += Decimal(str(o.paid_amount))
        elif o.status == OrderStatus.paid:
            order_rev += Decimal(str(o.total_amount))

    gross_revenue = link_rev + order_rev
    total_txns = len(paid_links) + len(standalone_orders)

    lines = [
        "STORE_REVENUE_AND_PROFIT_REPORT",
        f"STORE: {merchant.business_name}",
        f"TIMEFRAME: {timeframe_label}",
        f"DATE_RANGE: From {date_range_str}",
        "",
        "1. STORE PROFIT & REVENUE (TOTAL SALES COLLECTIONS):",
        f"- Total Gross Collections: ₹{gross_revenue:.2f} ({total_txns} paid transactions)",
        f"  * Paid Payment Links: ₹{link_rev:.2f} ({len(paid_links)} links)",
        f"  * Paid Store Orders: ₹{order_rev:.2f} ({len(standalone_orders)} orders)",
        "",
        "NOTE: This is the definitive store profit and revenue report. Operating expenses are managed separately via get_current_expenses and must NOT be deducted here.",
    ]

    return "\n".join(lines)


# Alias for backward compatibility
get_store_financial_report_service = get_store_revenue_report_service
