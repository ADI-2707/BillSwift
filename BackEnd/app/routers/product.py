from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.product_component import ProductComponent
from app.models.component import Component
from app.schemas.product import ProductCreate, ProductOut
from app.auth.jwt_handler import require_admin
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])

def _recalculate_prices(product: Product):
    base = Decimal("0.00")

    for pc in product.components:
        unit_price = (
            pc.unit_price_override
            if pc.unit_price_override is not None
            else pc.component.base_unit_price
        )
        base += unit_price * pc.quantity

    product.base_price = base
    product.total_price = base
    product.price = base

@router.post("/", response_model=ProductOut)
def create_product_bundle(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    product = Product(
        starter_type=payload.starter_type,
        rating_kw=Decimal(str(payload.rating_kw)),
        device_name=payload.starter_type,
    )

    for item in payload.components:
        component = db.query(Component).filter(Component.id == item.component_id).first()
        if not component:
            raise HTTPException(404, "Component not found")

        pc = ProductComponent(
            component=component,
            quantity=item.quantity,
            unit_price_override=(
                Decimal(str(item.unit_price_override))
                if item.unit_price_override
                else None
            ),
        )
        product.components.append(pc)

    _recalculate_prices(product)

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

@router.get("/", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Product).all()
