from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.bill import Bill
from app.models.user import User
from app.auth.jwt_handler import require_admin

router = APIRouter(prefix="/admin/billing", tags=["Admin Billing"])

@router.get("/all-bills")
def get_all_bills(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    bills = db.query(Bill).order_by(Bill.id.desc()).all()

    result = []
    for b in bills:
        # if relationship exists: b.user.email, else use user_id
        user_email = getattr(getattr(b, "user", None), "email", None)
        result.append(
            {
                "id": b.id,
                "bill_number": b.bill_number,
                "user_email": user_email,
                "created_at": b.created_at,
                "total_amount": float(b.total_amount),
            }
        )
    return result

@router.delete("/{bill_id}")
def delete_bill_admin(
    bill_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(bill)
    db.commit()
    return {"message": "Bill deleted"}