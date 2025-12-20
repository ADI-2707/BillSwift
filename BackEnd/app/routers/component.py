from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from pydantic import BaseModel

from app.db.session import get_db
from app.models.component import Component
from app.auth.jwt_handler import require_admin
from app.models.user import User
from app.schemas.component import ComponentOut


# ADMIN ROUTER
admin_router = APIRouter(
    prefix="/admin/components",
    tags=["Admin Components"]
)


# SCHEMAS
class ComponentCreate(BaseModel):
    name: str
    brand_name: str
    model: str | None = None
    base_unit_price: float

class ComponentUpdate(ComponentCreate):
    pass


# ADMIN: LIST
@admin_router.get("/", response_model=list[ComponentCreate])
def list_components_admin(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Component).order_by(Component.name).all()


# ADMIN: CREATE
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
        raise HTTPException(400, "Component already exists")

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


# ADMIN: UPDATE
@admin_router.put("/{component_id}")
def update_component(
    component_id: int,
    payload: ComponentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    component = db.query(Component).filter(Component.id == component_id).first()
    if not component:
        raise HTTPException(404, "Component not found")

    component.name = payload.name
    component.brand_name = payload.brand_name
    component.model = payload.model
    component.base_unit_price = Decimal(str(payload.base_unit_price))

    db.commit()
    db.refresh(component)
    return component


# ADMIN: DELETE
@admin_router.delete("/{component_id}")
def delete_component(
    component_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    component = db.query(Component).filter(Component.id == component_id).first()
    if not component:
        raise HTTPException(404, "Component not found")

    if component.product_components:
        raise HTTPException(
            400, "Component is used in products. Remove it first."
        )

    db.delete(component)
    db.commit()
    return {"detail": "Component deleted"}


# ADMIN: SEARCH COMPONENTS (for autocomplete)
@admin_router.get("/search")
def search_components(
    q: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if len(q.strip()) < 3:
        return []

    query = q.strip().lower()

    results = (
        db.query(Component)
        .filter(
            (Component.name.ilike(f"%{query}%")) |
            (Component.brand_name.ilike(f"%{query}%")) |
            (Component.model.ilike(f"%{query}%"))
        )
        .order_by(Component.name)
        .limit(20)
        .all()
    )

    # Return only what frontend needs
    return [
        {
            "id": c.id,
            "name": c.name,
            "brand_name": c.brand_name,
            "model": c.model or "",
        }
        for c in results
    ]