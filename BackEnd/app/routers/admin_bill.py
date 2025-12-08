from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.auth.jwt_handler import get_current_user
from app.models.user import User
from app.models.bill import Bill

router = APIRouter(prefix="/admin/billing", tags=["Admin Billing"])


def ensure_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/all-bills")
def get_all_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all bills in the system for admin dashboard & bills admin page.
    """
    ensure_admin(current_user)

    bills = (
        db.query(Bill)
        .options(joinedload(Bill.user))
        .order_by(Bill.id.desc())
        .all()
    )

    result = []
    for b in bills:
        result.append(
            {
                "id": b.id,
                "bill_number": b.bill_number,
                "user_id": b.user_id,
                "user_email": getattr(b.user, "email", None) if b.user else None,
                "created_at": b.created_at,
                "subtotal_amount": float(b.subtotal_amount),
                "discount_amount": float(b.discount_amount),
                "total_amount": float(b.total_amount),
            }
        )

    return result


@router.delete("/{bill_id}")
def delete_bill_admin(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin can delete any bill.
    """
    ensure_admin(current_user)

    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()

    return {"detail": "Bill deleted"}