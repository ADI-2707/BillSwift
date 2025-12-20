from pydantic import BaseModel

class ComponentOut(BaseModel):
    id: int
    name: str
    brand_name: str
    model: str | None
    base_unit_price: float

    class Config:
        from_attributes = True
