# app/schemas/product.py
from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ProductComponentCreate(BaseModel):
    name: str
    brand_name: str
    model: Optional[str] = None
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)

class ProductComponentUpdate(BaseModel):
    quantity: Optional[int] = Field(default=None, gt=0)
    unit_price: Optional[float] = Field(default=None, gt=0)

class ProductComponentOut(BaseModel):
    id: int
    name: str
    brand_name: str
    model: Optional[str]
    quantity: int
    unit_price: float
    line_total: float

    model_config = {"from_attributes": True}

class ProductCreate(BaseModel):
    starter_type: Literal["DOL", "RDOL", "S/D"]
    rating_kw: float
    gst_percent: float
    components: List[ProductComponentCreate]

class ProductUpdate(BaseModel):
    starter_type: Optional[Literal["DOL", "RDOL", "S/D"]] = None
    rating_kw: Optional[float] = None
    gst_percent: Optional[float] = None

class ProductOut(BaseModel):
    id: int
    starter_type: str
    rating_kw: float
    gst_percent: float
    base_price: float
    total_price: float
    components: List[ProductComponentOut] = []

    model_config = {"from_attributes": True}