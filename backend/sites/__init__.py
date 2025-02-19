from abc import ABC, abstractmethod
from typing import List
from datetime import datetime
from db.definitions import engine, EntityBase
from sites.types import Entity, Record
from utils import calculate_h_index

class SiteWorker(ABC):
    name: str  # Class attribute that must be defined by subclasses
    
    def __init__(self):
        self.engine = engine
        
        # Create the entity table class for this specific site worker
        class SiteEntity(EntityBase):
            __tablename__ = self.name
            __table_args__ = {"schema": "sites"}
        
        self.EntityModel = SiteEntity
        self.EntityModel.__table__.create(engine, checkfirst=True)

    @abstractmethod
    def records_for_entity(self, entity: Entity) -> List[Record]:
        """Fetch all records for a given entity."""
        pass
    
    @abstractmethod
    def get_related_entities(self, entity: Entity) -> List[Entity]:
        pass

    def update_entity(self, entity: Entity):
        with self.engine.connect() as session:
            #check if entity exists
            existing_entity = session.query(self.EntityModel).filter(self.EntityModel.identifier == entity.identifier).first()
            if existing_entity:
                existing_entity.index = entity.index
                existing_entity.last_updated_at = datetime.now()
                session.commit()
            else:
                session.add(self.EntityModel(identifier=entity.identifier, index=entity.index))
                session.commit()
    
    def run(self, entity: Entity):
        try:
            records = self.records_for_entity(entity)
            index = calculate_h_index(records)
            self.update_entity(Entity(identifier=entity.identifier, index=index))
        except Exception as e:
            print(f"Error updating entity {entity.identifier}: {e}")
            return 500
        return 200 
     