# app/schemas/bill.py
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class BillItemInput(BaseModel):
    """
    One line in the bill – one starter bundle (Product).
    quantity will usually be 1 for each bundle.

    override_price:
        If provided, backend will use this as the bundle price
        instead of product.total_price (after all discounts).
    """
    product_id: int
    quantity: int = 1
    override_price: float | None = None


class BillCreate(BaseModel):
    items: List[BillItemInput]
    # absolute money value, not percent
    discount_amount: float = 0
    notes: Optional[str] = None


class BillOut(BaseModel):
    id: int
    bill_number: str
    subtotal_amount: float
    discount_amount: float
    total_amount: float
    created_at: datetime

    model_config = {"from_attributes": True}


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
    created_at: datetime
    items: List[BillItemOut]

    model_config = {"from_attributes": True}
