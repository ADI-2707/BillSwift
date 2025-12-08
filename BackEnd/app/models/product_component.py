# app/models/product_component.py
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ProductComponent(Base):
    __tablename__ = "product_components"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    # e.g. "MPCB", "Contactor"
    name = Column(String(150), nullable=False)
    brand_name = Column(String(150), nullable=False)
    model = Column(String(150), nullable=True)

    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    product = relationship("Product", back_populates="components")