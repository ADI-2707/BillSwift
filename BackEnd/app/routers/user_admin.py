from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.auth.jwt_handler import require_admin
from app.core.email_utils import send_user_approved_email

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(require_admin)  # Ensure logged-in admin
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already active")

    user.is_active = True
    db.commit()
    db.refresh(user)

    try:
        send_user_approved_email(user)
    except Exception as e:
        print("[EMAIL] Error sending approval email:", e)

    return {"message": f"User '{user.email}' approved successfully"}

@router.get("/pending", tags=["Admin"])
def get_pending_users(
    db: Session = Depends(get_db),
    current_admin = Depends(require_admin)
):
    pending_users = db.query(User).filter(User.is_active == False).all()

    return [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "employee_code": user.employee_code,
            "team": user.team
        }
        for user in pending_users
    ]
