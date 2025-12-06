from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.auth.jwt_handler import require_admin

router = APIRouter(prefix="/admin/users", tags=["Admin Users"]) 

@router.get("/pending")
def get_pending_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """All users waiting for approval"""
    pending_users = db.query(User).filter(User.is_active == False).all()
    return [
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "employee_code": u.employee_code,
            "team": u.team,
        }
        for u in pending_users
    ]

@router.get("/all")
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """All users in the system"""
    return [
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "employee_code": u.employee_code,
            "team": u.team,
            "role": u.role,
            "is_active": u.is_active,
        }
        for u in db.query(User).all()
    ]

@router.put("/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already active")

    user.is_active = True
    db.commit()
    db.refresh(user)

    return {"message": f"User '{user.email}' approved successfully"}