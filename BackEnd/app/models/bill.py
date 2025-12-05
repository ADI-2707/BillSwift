from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Numeric,
    DateTime,
    Text,
    func,
)
from sqlalchemy.orm import relationship
from app.db.base import Base

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)

    # For easy reference – could be something like "BILL-2025-0001"
    bill_number = Column(String(100), unique=True, index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    subtotal_amount = Column(Numeric(12, 2), nullable=False, default=0)
    discount_amount = Column(Numeric(12, 2), nullable=False, default=0)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Bill belongs to a User
    user = relationship("User", back_populates="bills", lazy="joined")

    # One bill has many items
    items = relationship(
        "BillItem",
        back_populates="bill",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(Integer, primary_key=True, index=True)

    bill_id = Column(Integer, ForeignKey("bills.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)

    quantity = Column(Integer, nullable=False, default=1)

    unit_price = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    bill = relationship("Bill", back_populates="items", lazy="joined")
    product = relationship("Product", back_populates="bill_items", lazy="joined")