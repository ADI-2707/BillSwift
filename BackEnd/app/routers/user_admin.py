from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.auth.jwt_handler import require_admin

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


# -------------------------
#  GET PENDING USERS
# -------------------------
@router.get("/pending")
def get_pending_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Fetch all users waiting for admin approval.
    A pending user = is_active == False (not allowed to log in yet)
    """
    pending_users = (
        db.query(User)
        .filter(User.role == "user", User.is_active == False)  # noqa: E712
        .all()
    )

    return [
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "employee_code": u.employee_code,
            "team": u.team,
            "created_at": u.created_at,
        }
        for u in pending_users
    ]


# -------------------------
#  GET ALL USERS
# -------------------------
@router.get("/all")
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Fetch all users for admin panel
    """
    users = db.query(User).filter(User.role == "user").all()

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
            "created_at": u.created_at,
        }
        for u in users
    ]


# -------------------------
#  APPROVE USER
# -------------------------
@router.put("/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Admin approves a pending account → user can log in
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already approved")

    user.is_active = True
    db.commit()
    db.refresh(user)

    return {
        "detail": "User approved successfully",
        "user_id": user.id,
        "email": user.email,
    }