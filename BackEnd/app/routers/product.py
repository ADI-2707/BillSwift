# app/routers/product.py
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.product_component import ProductComponent
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductComponentUpdate,
)
from app.auth.jwt_handler import require_admin
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


def _recalculate_prices(product: Product) -> None:
    """
    Recalculate base_price and total_price from components.
    GST has been removed, so total_price = base_price.
    """
    base = Decimal("0.00")

    for comp in product.components:
        comp.line_total = Decimal(str(comp.unit_price)) * comp.quantity
        base += comp.line_total

    product.base_price = base
    product.total_price = base  # no GST now
    # Keep legacy price in sync so old code doesn't explode
    product.price = product.total_price


@router.post("/", response_model=ProductOut)
def create_product_bundle(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Create a new starter bundle (DOL / RDOL / S/D) with many components.
    """
    if not payload.components:
        raise HTTPException(
            status_code=400,
            detail="Bundle must contain at least one component",
        )

    product = Product(
        starter_type=payload.starter_type,
        rating_kw=Decimal(str(payload.rating_kw)),
        device_name=payload.starter_type,  # legacy alias
    )

    for c in payload.components:
        comp = ProductComponent(
            name=c.name,
            brand_name=c.brand_name,
            model=c.model,
            quantity=c.quantity,
            unit_price=Decimal(str(c.unit_price)),
            line_total=Decimal(str(c.unit_price)) * c.quantity,
        )
        product.components.append(comp)

    _recalculate_prices(product)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/", response_model=list[ProductOut])
def list_product_bundles(
    starter_type: str | None = None,
    rating_kw: float | None = None,
    db: Session = Depends(get_db),
):
    """
    List active starter bundles. Can be filtered by starter_type and rating_kw.
    """
    q = db.query(Product).filter(Product.is_active == True)

    if starter_type:
        q = q.filter(Product.starter_type == starter_type)

    if rating_kw is not None:
        q = q.filter(Product.rating_kw == Decimal(str(rating_kw)))

    products = q.order_by(Product.starter_type, Product.rating_kw).all()
    return products


@router.delete("/{product_id}")
def delete_product_bundle(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Delete a starter bundle (and its components).
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Bundle not found")

    db.delete(product)
    db.commit()
    return {"message": "Bundle deleted successfully"}


@router.put("/{product_id}", response_model=ProductOut)
def update_product_bundle(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Update basic bundle info (starter_type / rating_kw).
    Components are managed via the component endpoints.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Bundle not found")

    if payload.starter_type is not None:
        product.starter_type = payload.starter_type
        product.device_name = payload.starter_type  # legacy mapping

    if payload.rating_kw is not None:
        product.rating_kw = Decimal(str(payload.rating_kw))

    _recalculate_prices(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/components/{component_id}", response_model=ProductOut)
def update_component(
    component_id: int,
    payload: ProductComponentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Update quantity / unit_price for a component inside a bundle.
    """
    comp = (
        db.query(ProductComponent)
        .filter(ProductComponent.id == component_id)
        .first()
    )
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")

    if payload.quantity is not None:
        comp.quantity = payload.quantity

    if payload.unit_price is not None:
        comp.unit_price = Decimal(str(payload.unit_price))

    parent = comp.product
    _recalculate_prices(parent)
    db.commit()
    db.refresh(parent)
    return parent


@router.delete("/components/{component_id}", response_model=ProductOut)
def delete_component(
    component_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Remove a component from a bundle and recalc prices.
    """
    comp = (
        db.query(ProductComponent)
        .filter(ProductComponent.id == component_id)
        .first()
    )
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")

    parent = comp.product
    db.delete(comp)
    _recalculate_prices(parent)
    db.commit()
    db.refresh(parent)
    return parent