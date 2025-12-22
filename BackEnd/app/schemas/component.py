from pydantic import BaseModel
from typing import Optional

class ComponentBase(BaseModel):
    name: str
    brand_name: str
    model: Optional[str] = None
    base_unit_price: float
    is_active: bool = True # Added for visibility toggle

class ComponentCreate(ComponentBase):
    pass

class ComponentUpdate(ComponentBase):
    pass

class ComponentOut(ComponentBase):
    id: int

    class Config:
        from_attributes = True