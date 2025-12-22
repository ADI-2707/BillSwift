# app/models/component.py
from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime, func, UniqueConstraint
from app.db.base import Base

class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    brand_name = Column(String(150), nullable=False)
    model = Column(String(150), nullable=True)
    base_unit_price = Column(Numeric(12, 2), nullable=False)

    # NEW FIELD: This stores the toggle state
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "name", "brand_name", "model",
            name="uq_component_identity"
        ),
    )
