from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    device_name = Column(String(150), nullable=False, index=True)   # Drives, Motors, etc.
    brand_name = Column(String(150), nullable=False, index=True)
    model = Column(String(150), nullable=False, index=True)

    # Rating in kW
    rating_kw = Column(Numeric(10, 2), nullable=True)

    # Price at current catalog listing
    price = Column(Numeric(12, 2), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship: product can appear in many bill items
    bill_items = relationship("BillItem", back_populates="product", lazy="selectin")