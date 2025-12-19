# app/models/product_component.py
from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ProductComponent(Base):
    __tablename__ = "product_components"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )

    component_id = Column(
        Integer,
        ForeignKey("components.id", ondelete="RESTRICT"),
        nullable=False,
    )

    quantity = Column(Integer, nullable=False, default=1)

    # Optional override (rare case)
    unit_price_override = Column(Numeric(12, 2), nullable=True)

    product = relationship("Product", back_populates="components")
    component = relationship("Component")
