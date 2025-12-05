from pydantic import BaseModel
from typing import List, Optional

class BillItemInput(BaseModel):
    product_id: int
    quantity: int

class BillCreate(BaseModel):
    items: List[BillItemInput]
    discount_amount: float = 0
    notes: Optional[str] = None

class BillOut(BaseModel):
    id: int
    bill_number: str
    subtotal_amount: float
    discount_amount: float
    total_amount: float

    model_config = {
        "from_attributes": True
    }

class BillItemOut(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float

class BillDetailOut(BaseModel):
    id: int
    bill_number: str
    subtotal_amount: float
    discount_amount: float
    total_amount: float
    notes: str | None
    items: List[BillItemOut]

    model_config = {
        "from_attributes": True
    }