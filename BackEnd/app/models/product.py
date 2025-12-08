# app/models/product.py
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    # DOL / RDOL / S/D
    starter_type = Column(String(50), nullable=False, index=True)
    # Rating value in kW
    rating_kw = Column(Numeric(10, 2), nullable=False, index=True)
    # GST percentage (e.g. 18.0)
    gst_percent = Column(Numeric(5, 2), nullable=False, default=0)
    # Sum of all component (qty * unit_price)
    base_price = Column(Numeric(12, 2), nullable=False, default=0)
    # Final price after GST
    total_price = Column(Numeric(12, 2), nullable=False, default=0)

    # We’ll mirror starter_type + total_price into these
    device_name = Column(String(150), nullable=True, index=True)
    brand_name = Column(String(150), nullable=True, index=True)
    model = Column(String(150), nullable=True, index=True)
    price = Column(Numeric(12, 2), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship: bundle can appear in many bill items
    bill_items = relationship("BillItem", back_populates="product", lazy="selectin")

    # Relationship: bundle has many components
    components = relationship(
        "ProductComponent",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )