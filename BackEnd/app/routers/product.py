from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.product_component import ProductComponent
from app.models.component import Component
from app.schemas.product import ProductCreate, ProductOut, ProductComponentOut
from app.auth.jwt_handler import require_admin
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


def serialize_product(product: Product) -> ProductOut:
    components = []
    base = Decimal("0.00")

    for pc in product.components:
        unit_price = (
            pc.unit_price_override
            if pc.unit_price_override is not None
            else pc.component.base_unit_price
        )
        line_total = unit_price * pc.quantity
        base += line_total

        components.append(
            ProductComponentOut(
                id=pc.id,
                quantity=pc.quantity,
                unit_price=float(unit_price),
                line_total=float(line_total),
                name=pc.component.name,
                brand_name=pc.component.brand_name,
                model=pc.component.model,
            )
        )

    return ProductOut(
        id=product.id,
        starter_type=product.starter_type,
        rating_kw=float(product.rating_kw),
        base_price=float(base),
        total_price=float(base),
        components=components,
    )


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
        component = db.query(Component).get(item.component_id)
        if not component:
            raise HTTPException(404, "Component not found")

        product.components.append(
            ProductComponent(
                component=component,
                quantity=item.quantity,
                unit_price_override=(
                    Decimal(str(item.unit_price_override))
                    if item.unit_price_override
                    else None
                ),
            )
        )

    db.add(product)
    db.commit()
    db.refresh(product)

    return serialize_product(product)


@router.get("/", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    products = db.query(Product).all()
    return [serialize_product(p) for p in products]


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    # Check if product is used in any bill items
    if product.bill_items:
        raise HTTPException(400, "Cannot delete product used in bills")

    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}