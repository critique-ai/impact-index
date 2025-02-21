from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from datetime import datetime
from db.definitions import engine, EntityBase, ToDictMixin
from sqlalchemy.orm import Session
from sites.types import Entity, Record
from functools import lru_cache
from dataclasses import dataclass

@dataclass
class EntityStats:
    percentile: float

    def to_dict(self,drop=[]):
        return {
            "percentile": self.percentile
        }

class SiteWorker(ABC):
    name: str  # Class attribute that must be defined by subclasses
    
    def __init__(self):
        self.engine = engine
        
        # Create a unique entity table class name for this specific site worker
        class_name = f"{self.name.capitalize()}Entity"
        class_dict = {
            '__tablename__': self.name,
            '__table_args__': {"schema": "sites"}
        }
        
        # Dynamically create the class with a unique name
        self.EntityModel = type(class_name, (EntityBase,), class_dict)
        self.EntityModel.__table__.create(engine, checkfirst=True)
    
    def calculate_h_index(self,records: List[Record]) -> int:
        records.sort(key=lambda x: x.metric, reverse=True)
        for i, record in enumerate(records):
            if record.metric < i + 1:
                return i
        return len(records) 

    @abstractmethod
    def records_for_entity(self, entity: Entity) -> List[Record]:
        """Fetch all records for a given entity."""
        pass
    
    @abstractmethod
    def get_related_entities(self, entity: Entity) -> List[Entity]:
        pass

    # @lru_cache(maxsize=1000)
    def retrieve_entity(self, identifier: str) -> Tuple[Optional[Entity], EntityStats]:
        with Session(engine, expire_on_commit=False) as session: 
            existing_entity = session.query(self.EntityModel).filter(self.EntityModel.identifier == identifier).first()            
            return existing_entity
    
    def get_entity_stats(self, identifier: str) -> EntityStats:
        with Session(engine, expire_on_commit=False) as session: 
            existing_entity = session.query(self.EntityModel).filter(self.EntityModel.identifier == identifier).first()
            stats = EntityStats(percentile=0.0)
            if existing_entity:
                # Calculate total count and number of entities with higher index
                total_count = session.query(self.EntityModel).count()
                higher_count = session.query(self.EntityModel).filter(
                    self.EntityModel.index > existing_entity.index
                ).count()
                
                # Calculate percentile (100 means top, 0 means bottom)
                percentile = ((total_count - higher_count) / total_count) * 100
                stats = EntityStats(percentile=round(percentile, 2))
            return stats

                

    def update_entity(self, entity: Entity):
        with Session(engine, expire_on_commit=False) as session: 
            #check if entity exists
            existing_entity = session.query(self.EntityModel).filter(self.EntityModel.identifier == entity.identifier).first()
            if existing_entity:
                existing_entity.index = entity.index
                existing_entity.last_updated_at = datetime.now()
                session.commit()
            else:
                session.add(self.EntityModel(identifier=entity.identifier, index=entity.index))
                session.commit()
            return entity
    
    def run(self, entity: Entity):
        try:
            records = self.records_for_entity(entity)
            index = self.calculate_h_index(records)
            entity = self.update_entity(self.EntityModel(identifier=entity.identifier, index=index))
        except Exception as e:
            print(f"Error updating entity {entity.identifier}: {e}")
            return None
        return entity
    
    def get_top_entities(self, page: int = 1, per_page: int = 10) -> tuple[List[Entity], int]:
        """
        Retrieve paginated top-ranking entities sorted by index in descending order.
        
        Args:
            page: Page number (1-based indexing)
            per_page: Number of entities per page
            
        Returns:
            Tuple containing:
            - List of entities for the requested page
            - Total count of entities
        """
        with Session(engine, expire_on_commit=False) as session:
            # Get total count
            total_count = session.query(self.EntityModel).count()
            
            # Get paginated results
            offset = (page - 1) * per_page
            entities = (
                session.query(self.EntityModel)
                .order_by(self.EntityModel.index.desc())
                .offset(offset)
                .limit(per_page)
                .all()
            )
            return entities, total_count
    

     