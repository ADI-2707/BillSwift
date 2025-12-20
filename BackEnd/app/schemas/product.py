from pydantic import BaseModel
from typing import List, Optional, Literal


class ProductComponentCreate(BaseModel):
    component_id: int
    quantity: int
    unit_price_override: Optional[float] = None


class ProductComponentOut(BaseModel):
    id: int
    quantity: int
    unit_price: float
    line_total: float
    name: str
    brand_name: str
    model: Optional[str]


class ProductCreate(BaseModel):
    starter_type: Literal["DOL", "RDOL", "S/D"]
    rating_kw: float
    components: List[ProductComponentCreate]


class ProductOut(BaseModel):
    id: int
    starter_type: str
    rating_kw: float
    base_price: float
    total_price: float
    components: List[ProductComponentOut]
