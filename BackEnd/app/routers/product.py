from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductOut
from app.auth.jwt_handler import get_current_user, require_admin

router = APIRouter(prefix="/products", tags=["Products"])

# ADD PRODUCT (ADMIN ONLY)
@router.post("/", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

# LIST / FILTER PRODUCTS
@router.get("/", response_model=list[ProductOut])
def list_products(
    device_name: str | None = None,
    brand_name: str | None = None,
    model: str | None = None,
    rating_min: float | None = None,
    rating_max: float | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if device_name:
        query = query.filter(Product.device_name.ilike(f"%{device_name}%"))

    if brand_name:
        query = query.filter(Product.brand_name.ilike(f"%{brand_name}%"))

    if model:
        query = query.filter(Product.model.ilike(f"%{model}%"))

    if rating_min is not None:
        query = query.filter(Product.rating_kw >= rating_min)

    if rating_max is not None:
        query = query.filter(Product.rating_kw <= rating_max)

    if price_min is not None:
        query = query.filter(Product.price >= price_min)

    if price_max is not None:
        query = query.filter(Product.price <= price_max)

    return query.all()

# UPDATE (ADMIN ONLY)
@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(404, "Product not found")

    for key, value in payload.model_dump().items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

# DELETE PRODUCT
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(404, "Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}