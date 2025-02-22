from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from datetime import datetime
from db.definitions import engine, EntityBase, ToDictMixin
from sqlalchemy.orm import Session
from sites.types import RequestEntity, Record
from functools import lru_cache
from dataclasses import dataclass
from queue import Queue
from threading import Thread, Lock
import time

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
        # Create a unique entity table class name for this specific site worker
        class_name = f"{self.name.capitalize()}Entity"
        class_dict = {
            '__tablename__': self.name,
            '__table_args__': {"schema": "sites"}
        }
        
        # Use the global engine only for table creation
        self.EntityModel = type(class_name, (EntityBase,), class_dict)
        self.EntityModel.__table__.create(engine, checkfirst=True)
        self.queue = Queue(maxsize=1000)
        self.queued_entities = set()  # Track queued entity identifiers
        self._stop_monitor = False
        self._monitor_thread = None
        self._stop_monitor_lock = Lock()
        
        # Start the queue monitor thread automatically
        self.start_queue_monitor()

    def __del__(self):
        """Ensure the monitor thread is stopped when the worker is destroyed"""
        self.stop_queue_monitor()

    @property
    def stop_monitor(self):
        with self._stop_monitor_lock:
            return self._stop_monitor

    @stop_monitor.setter
    def stop_monitor(self, value):
        with self._stop_monitor_lock:
            self._stop_monitor = value

    def calculate_h_index(self,records: List[Record]) -> int:
        total = sum(record.metric for record in records)
        records.sort(key=lambda x: x.metric, reverse=True)
        for i, record in enumerate(records):
            if record.metric < i + 1:
                return i, total
        return len(records),total

    @abstractmethod
    def records_for_entity(self, entity: RequestEntity) -> List[Record]:
        """Fetch all records for a given entity."""
        pass
    
    @abstractmethod
    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        pass

    # @lru_cache(maxsize=1000)
    def retrieve_entity(self, identifier: str):
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

                

    def update_entity(self, entity,session: Session,index: int = 0 ,total_metrics: int = 0):
        entity_model = self.EntityModel(
            identifier=entity.identifier,
            index=index,
            total_metrics=total_metrics,
            last_updated_at=datetime.now(),
        )
        merged_entity = session.merge(entity_model)
        session.commit()
        return merged_entity
    
    def run(self, entity: RequestEntity):
        """
        Each thread should have its own session
        """
        updated_entity = None
        try:
            # Create a thread-local engine and session
            records = self.records_for_entity(entity)
            index, total = self.calculate_h_index(records)
            with Session(engine, expire_on_commit=False) as session:
                updated_entity = self.update_entity(entity,session=session,index=index,total_metrics=total)
            
            # Remove the related entities call from here
            # The queue monitor will handle this
            self.queue.put((entity, True))  # True indicates this entity needs related entities fetched
        except Exception as e:
            print(f"Error updating entity {entity.identifier}: {e}")
        return updated_entity
    
    def get_top_entities(self, page: int = 1, per_page: int = 10):
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
    
    def queue_entities(self, entities: List[RequestEntity]) -> List[bool]:
        """
        Attempt to queue multiple entities if they haven't been queued before.
        Returns a list of booleans indicating success/failure for each entity.
        """
        results = []
        for entity in entities:
            if entity.identifier not in self.queued_entities:
                try:
                    self.queue.put((entity, False))  # False indicates no need to fetch related entities
                    self.queued_entities.add(entity.identifier)
                    results.append(True)
                except Queue.Full:
                    results.append(False)
            else:
                results.append(False)
        return results
    
    def get_entity_from_queue(self) -> Optional[Tuple[RequestEntity, bool]]:
        """
        Get and remove an entity from the queue.
        Returns a tuple of (entity, needs_related) or None if queue is empty.
        """
        if not self.queue.empty():
            entity, needs_related = self.queue.get()
            if entity.identifier in self.queued_entities:
                self.queued_entities.remove(entity.identifier)
            return entity, needs_related
        return None, False

    def start_queue_monitor(self):
        """
        Start the queue monitoring thread if it's not already running.
        """
        if self._monitor_thread is None or not self._monitor_thread.is_alive():
            self._stop_monitor = False
            self._monitor_thread = Thread(target=self._monitor_queue, daemon=True)
            self._monitor_thread.start()

    def stop_queue_monitor(self):
        """
        Signal the queue monitoring thread to stop and wait for it to finish.
        """
        self._stop_monitor = True
        if self._monitor_thread and self._monitor_thread.is_alive():
            self._monitor_thread.join()
            self._monitor_thread = None

    def _monitor_queue(self):
        """
        Monitor the queue and process entities as they arrive.
        This method runs in a separate thread.
        """
        while not self.stop_monitor:
            try:
                item = self.get_entity_from_queue()
                if item:
                    entity, needs_related = item
                    
                    # Only fetch related entities if needed
                    if needs_related:
                        try:
                            related_entities = self.get_related_entities(entity)
                            #remove current entity from the list
                            related_entities = [e for e in related_entities if e.identifier != entity.identifier]
                            self.queue_entities(related_entities)
                        except Exception as e:
                            print(f"Error fetching related entities for {entity.identifier}: {e}")
                    else:
                        if entity: self.run(entity)
                else:
                    # Sleep briefly when queue is empty to prevent CPU spinning
                    time.sleep(0.1)
            except Exception as e:
                print(f"Error in queue monitor: {e}")
                # Sleep briefly after an error before retrying
                time.sleep(1)

     