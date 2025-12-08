# app/routers/bill.py
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.bill import Bill, BillItem
from app.models.product import Product
from app.models.user import User
from app.schemas.bill import BillCreate, BillOut, BillDetailOut
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.post("/", response_model=BillOut)
def create_bill(
    payload: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="Bill must contain at least one item")

    subtotal = Decimal("0.00")
    bill_items: list[BillItem] = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        base_price = product.total_price or product.price
        unit_price = Decimal(str(base_price))
        line_total = unit_price * item.quantity
        subtotal += line_total

        bill_items.append(
            BillItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    discount = Decimal(str(payload.discount_amount or 0))
    total = subtotal - discount

    bill_number = f"BS-{current_user.id}-{int(subtotal)}"

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
        "items": items,
    }
