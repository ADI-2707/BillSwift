from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, LoginRequest, UserOut
from app.auth.security import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.core.email_utils import (
    send_new_user_request_email,
    send_user_signup_ack_email,
)
from app.auth.jwt_handler import get_current_user
from app.schemas.user import UserOut
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserOut)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = hash_password(payload.password)

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        employee_code=payload.employee_code,
        team=payload.team,
        password_hash=hashed,
        role="user",
        is_active=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        send_new_user_request_email(user)   # to admin
        send_user_signup_ack_email(user)    # to user
    except Exception as e:
        print("[EMAIL] Error during signup emails:", e)

    return user

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is waiting approval from admin."
        )

    token = create_access_token(user)
    
    return {"access_token": token, "token_type": "bearer", "role": user.role, "email": user.email}

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user