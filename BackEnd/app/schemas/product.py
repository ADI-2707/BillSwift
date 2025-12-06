from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    device_name: str
    brand_name: str
    model: str
    rating_kw: Optional[float] = None
    price: float

class ProductUpdate(BaseModel):
    device_name: Optional[str] = None
    brand_name: Optional[str] = None
    model: Optional[str] = None
    rating_kw: Optional[float] = None
    price: Optional[float] = None

class ProductOut(BaseModel):
    id: int
    device_name: str
    brand_name: str
    model: str
    rating_kw: float | None
    price: float

    model_config = {
        "from_attributes": True
    }