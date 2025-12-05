from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from decimal import Decimal

from app.db.session import get_db
from app.models.bill import Bill, BillItem
from app.models.product import Product
from app.models.user import User
from app.schemas.bill import BillCreate, BillOut, BillDetailOut, BillItemOut
from app.auth.jwt_handler import decode_token

router = APIRouter(prefix="/bill", tags=["Billing"])


# ---------------- Authentication Helper ----------------
def get_current_user(
    Authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    """
    Validate Bearer Token and return User object
    """
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = Authorization.split(" ")[1]
    payload = decode_token(token)
    user_id = int(payload["sub"])

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------------- Create Bill Endpoint ----------------
@router.post("/", response_model=BillOut)
def create_bill(
    payload: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a bill with multiple items
    """

    if len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="Bill must contain at least one item")

    # Subtotal using Decimal
    subtotal = Decimal("0.00")
    bill_items = []

    # Build Bill Items
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        # Convert to Decimal to avoid float issues
        unit_price = Decimal(str(product.price))
        line_total = unit_price * item.quantity
        subtotal += line_total

        bill_items.append(
            BillItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total
            )
        )

    # Convert discount into Decimal
    discount = Decimal(str(payload.discount_amount))
    total = subtotal - discount

    # Simple bill number generation
    bill_number = f"BS-{current_user.id}-{int(subtotal)}"

    bill = Bill(
        user_id=current_user.id,
        bill_number=bill_number,
        subtotal_amount=subtotal,
        discount_amount=discount,
        total_amount=total,
        notes=payload.notes,
        items=bill_items
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)

    return bill

@router.get("/history", response_model=list[BillOut])
def get_bill_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all bills belonging to the logged-in user
    """
    bills = db.query(Bill)\
        .filter(Bill.user_id == current_user.id)\
        .order_by(Bill.id.desc())\
        .all()

    return bills

@router.get("/{bill_id}", response_model=BillDetailOut)
def get_bill_detail(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return full bill details including items
    """
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        Bill.user_id == current_user.id
    ).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    # Build response manually to include product names
    items = []
    for item in bill.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        items.append({
            "product_id": item.product_id,
            "product_name": product.device_name if product else "Unknown",
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "line_total": float(item.line_total)
        })

    return {
        "id": bill.id,
        "bill_number": bill.bill_number,
        "subtotal_amount": float(bill.subtotal_amount),
        "discount_amount": float(bill.discount_amount),
        "total_amount": float(bill.total_amount),
        "notes": bill.notes,
        "items": items
    }