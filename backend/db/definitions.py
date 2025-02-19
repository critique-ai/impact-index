from sqlalchemy import create_engine, text, Column, String, DateTime, UUID, ForeignKey, Integer, Float, Boolean, Enum
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import os 
from datetime import datetime 
import uuid 
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

ASYNC_DATABASE_URL = f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT','5432')}/{os.getenv('POSTGRES_DB')}" #?sslmode=require

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT','5432')}/{os.getenv('POSTGRES_DB')}" #?sslmode=require
# Set up the async database engine and session
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True, pool_size=10, max_overflow=20, pool_timeout=5, pool_recycle=1800,pool_pre_ping=True)
engine = create_engine(DATABASE_URL, echo=True, pool_size=10, max_overflow=20, pool_timeout=5, pool_recycle=1800,pool_pre_ping=True)



class ToDictMixin:
    def to_dict(self,drop=[]):
        """Convert SQLAlchemy model instance to dictionary."""
        result = {}
        for column in self.__table__.columns:
            if column.name in drop:
                continue
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                result[column.name] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                result[column.name] = str(value)
            else:
                result[column.name] = value
        return result

# Create a base class for all site tables with common fields
class EntityBase(Base,ToDictMixin):
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    identifier = Column(String, nullable=False)
    index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    last_updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


#create a table in the sites schema for each site in backend/sites/__init__.py
