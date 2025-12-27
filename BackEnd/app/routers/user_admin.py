from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.auth.jwt_handler import require_admin
from pydantic import BaseModel

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])



#  GET PENDING USERS
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



#  GET ALL USERS
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


#  APPROVE USER
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



#  ADMIN DASHBOARD STATS
from app.models.product import Product
from app.models.bill import Bill

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    pending_users = (
        db.query(User)
        .filter(User.role == "user", User.is_active == False)  # noqa
        .count()
    )

    total_users = db.query(User).filter(User.role == "user").count()
    total_products = db.query(Product).count()
    total_bills = db.query(Bill).count()

    return {
        "pending_users": pending_users,
        "total_users": total_users,
        "products_count": total_products,
        "bills_count": total_bills,
    }

class UserStatusUpdate(BaseModel):
    is_active: bool


@router.patch("/{user_id}/status")
def toggle_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Toggle a user's active status. 
    Setting is_active to False will prevent them from making further requests.
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admins from deactivating themselves accidentally
    if user.role == "admin":
         raise HTTPException(status_code=400, detail="Cannot toggle status of admin accounts")

    user.is_active = status_data.is_active
    db.commit()
    db.refresh(user)

    return {"detail": f"User {'activated' if user.is_active else 'deactivated'} successfully"}