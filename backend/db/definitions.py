from sqlalchemy import create_engine, text, Column, String, DateTime, UUID, ForeignKey, Integer, Float, Boolean, Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.pool import QueuePool

import os 
from datetime import datetime 
import uuid 
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


DATABASE_URL = f"postgresql+psycopg2://{os.getenv('DB_URL')}" #

# Configure engine with proper pooling settings for multi-threaded use
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Adjust based on your expected concurrent threads
    max_overflow=10,  # Allow creating additional connections if pool is full
    pool_timeout=30,  # Timeout when waiting for connection from pool
    pool_pre_ping=True  # Verify connection is still valid before using
)


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
    
    identifier = Column(String, nullable=False,unique=True,primary_key=True)
    index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    last_updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    total_metrics = Column(Integer, default=0)
    url = Column(String, nullable=True)


class Metadata(Base,ToDictMixin):
    __tablename__ = "sites"
    sites = Column(String, primary_key=True, nullable=False)
    current_entities = Column(Integer,default=0)
    index_mean = Column(Float,default=0)
    index_median = Column(Float,default=0)
    index_stddev = Column(Float,default=0)
    index_min = Column(Float,default=0)
    index_max = Column(Float,default=0)
    last_updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    created_at = Column(DateTime, default=datetime.now)
    total_entities = Column(Integer,default=0)
    
