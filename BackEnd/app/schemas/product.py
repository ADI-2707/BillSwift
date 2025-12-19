from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ProductComponentCreate(BaseModel):
    component_id: int
    quantity: int = Field(gt=0)
    unit_price_override: Optional[float] = Field(default=None, gt=0)

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

class ProductUpdate(BaseModel):
    starter_type: Optional[Literal["DOL", "RDOL", "S/D"]] = None
    rating_kw: Optional[float] = None

class ProductOut(BaseModel):
    id: int
    starter_type: str
    rating_kw: float
    base_price: float
    total_price: float
    components: List[ProductComponentOut]
