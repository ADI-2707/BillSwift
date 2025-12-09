# app/routers/bill.py
from decimal import Decimal
from datetime import datetime
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.bill import Bill, BillItem
from app.models.product import Product
from app.models.user import User
from app.schemas.bill import BillCreate, BillOut, BillDetailOut
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/billing", tags=["Billing"])


def _generate_bill_number(db: Session, user: User) -> str:
    """
    Generate bill id in format:
        BS-YYYY-{employee_code}{abc}

    - YYYY: current year
    - employee_code: from user.employee_code (sanitized)
    - abc: random 3-digit number (unique globally; retries if collision)
    """
    year = datetime.now().year
    emp_code = user.employee_code or "0000"
    emp_code_clean = "".join(ch for ch in emp_code if ch.isalnum())

    for _ in range(25):
        suffix = f"{random.randint(0, 999):03d}"
        candidate = f"BS-{year}-{emp_code_clean}{suffix}"
        exists = db.query(Bill).filter(Bill.bill_number == candidate).first()
        if not exists:
            return candidate

    # Very unlikely fallback – use timestamp to guarantee uniqueness
    ts = int(datetime.now().timestamp())
    return f"BS-{year}-{emp_code_clean}{ts}"


@router.post("/", response_model=BillOut)
def create_bill(
    payload: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(payload.items) == 0:
        raise HTTPException(
            status_code=400,
            detail="Bill must contain at least one item",
        )

    subtotal = Decimal("0.00")
    bill_items: list[BillItem] = []

    for item in payload.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id, Product.is_active == True)
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )

        # If override_price is sent from UI, use that (bundle price after
        # component + bundle discounts). Otherwise fall back to product.total_price.
        if item.override_price is not None:
            unit_price = Decimal(str(item.override_price))
        else:
            base_price = product.total_price or product.price
            unit_price = Decimal(str(base_price))

        quantity = item.quantity or 1
        line_total = unit_price * quantity
        subtotal += line_total

        bill_items.append(
            BillItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    discount = Decimal(str(payload.discount_amount or 0))
    total = subtotal - discount
    if total < 0:
        total = Decimal("0.00")

    bill_number = _generate_bill_number(db, current_user)

    bill = Bill(
        user_id=current_user.id,
        bill_number=bill_number,
        subtotal_amount=subtotal,
        discount_amount=discount,
        total_amount=total,
        notes=payload.notes,
        items=bill_items,
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.get("/my-bills", response_model=list[BillOut])
def get_my_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bills = (
        db.query(Bill)
        .filter(Bill.user_id == current_user.id)
        .order_by(Bill.created_at.desc())
        .all()
    )
    return bills


@router.get("/{bill_id}", response_model=BillDetailOut)
def get_bill_detail(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill = (
        db.query(Bill)
        .filter(Bill.id == bill_id, Bill.user_id == current_user.id)
        .first()
    )

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    items = []
    for item in bill.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if product and product.starter_type:
            product_name = f"{product.starter_type} {product.rating_kw} kW"
        elif product and product.device_name:
            product_name = product.device_name
        else:
            product_name = "Unknown"

        items.append(
            {
                "product_id": item.product_id,
                "product_name": product_name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": float(item.line_total),
            }
        )

    return {
        "id": bill.id,
        "bill_number": bill.bill_number,
        "subtotal_amount": float(bill.subtotal_amount),
        "discount_amount": float(bill.discount_amount),
        "total_amount": float(bill.total_amount),
        "notes": bill.notes,
        "created_at": bill.created_at,
        "items": items,
    }
