from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    device_name: str
    brand_name: str
    model: str
    rating_kw: Optional[float] = None
    price: float

class ProductOut(BaseModel):
    id: int
    device_name: str
    brand_name: str
    model: str
    rating_kw: float
    price: float

    model_config = {
        "from_attributes": True
    }