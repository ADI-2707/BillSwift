from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from pydantic import BaseModel

from app.db.session import get_db
from app.models.component import Component
from app.auth.jwt_handler import require_admin
from app.models.user import User

# ============================
# ADMIN ROUTER
# ============================
admin_router = APIRouter(
    prefix="/admin/components",
    tags=["Admin Components"]
)

# ============================
# PUBLIC / INTERNAL ROUTER
# ============================
public_router = APIRouter(
    prefix="/components",
    tags=["Components"]
)

# -----------------------------
# Schemas
# -----------------------------
class ComponentCreate(BaseModel):
    name: str
    brand_name: str
    model: str | None = None
    base_unit_price: float


class ComponentUpdate(BaseModel):
    name: str
    brand_name: str
    model: str | None = None
    base_unit_price: float


# =====================================================
# PUBLIC READ (USED BY PRODUCT PAGE DROPDOWN)
# =====================================================
@public_router.get("/")
def list_components_public(
    db: Session = Depends(get_db),
):
    return (
        db.query(Component)
        .order_by(Component.name)
        .all()
    )


# =====================================================
# ADMIN: LIST
# =====================================================
@admin_router.get("/")
def list_components_admin(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(Component)
        .order_by(Component.name)
        .all()
    )


# =====================================================
# ADMIN: CREATE
# =====================================================
@admin_router.post("/")
def create_component(
    payload: ComponentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    existing = (
        db.query(Component)
        .filter(
            Component.name == payload.name,
            Component.brand_name == payload.brand_name,
            Component.model == payload.model,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Component already exists")

    component = Component(
        name=payload.name,
        brand_name=payload.brand_name,
        model=payload.model,
        base_unit_price=Decimal(str(payload.base_unit_price)),
    )

    db.add(component)
    db.commit()
    db.refresh(component)

    return component


# =====================================================
# ADMIN: UPDATE
# =====================================================
@admin_router.put("/{component_id}")
def update_component(
    component_id: int,
    payload: ComponentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    component = db.query(Component).filter(Component.id == component_id).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    component.name = payload.name
    component.brand_name = payload.brand_name
    component.model = payload.model
    component.base_unit_price = Decimal(str(payload.base_unit_price))

    db.commit()
    db.refresh(component)

    return component


# =====================================================
# ADMIN: DELETE (SAFE)
# =====================================================
@admin_router.delete("/{component_id}")
def delete_component(
    component_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    component = db.query(Component).filter(Component.id == component_id).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    if component.product_components:
        raise HTTPException(
            status_code=400,
            detail="Component is used in products. Remove it from products first."
        )

    db.delete(component)
    db.commit()

    return {"detail": "Component deleted successfully"}
