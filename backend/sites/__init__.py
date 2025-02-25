from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from datetime import datetime
from db.definitions import engine, EntityBase, ToDictMixin, AggregatedMetrics
from sqlalchemy.orm import Session
from sites.types import RequestEntity, Record, EntityInfo
from sqlalchemy import func
from functools import lru_cache
from dataclasses import dataclass
from queue import Queue
from threading import Thread, Lock
import time
import math
import os 
import requests


@dataclass
class EntityStats:
    percentile: float

    def to_dict(self,drop=[]):
        return {
            "percentile": self.percentile
        }
    


class SiteWorker(ABC):
    name: str  # Class attributes that must be defined by subclasses
    description: str
    index_description: str
    entity_name: str
    metric_name: str
    primary_color: str
    secondary_color: str

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
    def entity_info(self, entity: RequestEntity) -> EntityInfo:
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

                

    def update_entity(self, entity_info: EntityInfo,session: Session,index: int = 0 ,total_metrics: int = 0):
        entity_model = self.EntityModel(
            identifier=entity_info.metadata.identifier,
            index=index,
            total_metrics=total_metrics,
            last_updated_at=datetime.now(),
            url=entity_info.metadata.url,
            created_at=entity_info.metadata.created_at
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
            entity_info = self.entity_info(entity)
            if not entity_info:
                return None 
            index, total = self.calculate_h_index(entity_info.records)
            with Session(engine, expire_on_commit=False) as session:
                updated_entity = self.update_entity(entity_info,session=session,index=index,total_metrics=total)
                metadata = session.query(AggregatedMetrics).filter(AggregatedMetrics.sites == self.name).first()
                if metadata:
                    metadata.current_entities += 1
                    metadata.index_mean = (metadata.index_mean * (metadata.current_entities - 1) + index) / metadata.current_entities
                    metadata.index_median = session.query(
                        func.percentile_cont(0.5)
                        .within_group(self.EntityModel.index.asc())
                    ).scalar()
                    metadata.index_stddev = (((metadata.current_entities-2)*((metadata.index_stddev)**2)/(metadata.current_entities-1)) + ((index - metadata.index_mean)**2)/(metadata.current_entities))**0.5
                    metadata.index_min = min(metadata.index_min, index)
                    metadata.index_max = max(metadata.index_max, index)
                    session.commit()
                else:
                    #metada doesn't exist for the site will have to compute for the existing entries 
                    current_entities = session.query(self.EntityModel).count()
                    mean = session.query(self.EntityModel).with_entities(func.avg(self.EntityModel.index)).scalar()
                    # Calculate median using percentile_cont
                    median = session.query(
                        func.percentile_cont(0.5)
                        .within_group(self.EntityModel.index.asc())
                    ).scalar()
                    stddev = session.query(self.EntityModel).with_entities(func.stddev(self.EntityModel.index)).scalar()
                    metadata_min = session.query(self.EntityModel).with_entities(func.min(self.EntityModel.index)).scalar()
                    metadata_max = session.query(self.EntityModel).with_entities(func.max(self.EntityModel.index)).scalar()
                    metadata = AggregatedMetrics(sites=self.name, current_entities=current_entities, index_mean=mean, index_median=median, index_stddev=stddev, index_min=metadata_min, index_max=metadata_max)
                    session.add(metadata)
                    session.commit()
            
            # Remove the related entities call from here
            # The queue monitor will handle this
            self.queue.put((entity, True))  # True indicates this entity needs related entities fetched
        except Exception as e:
            print(f"Error updating entity {entity.identifier}: {e}")
        return updated_entity
    
    def get_metadata(self):
        with Session(engine, expire_on_commit=False) as session:
            metadata = session.query(AggregatedMetrics).filter(AggregatedMetrics.sites == self.name).first()
            data = metadata
        if not data: return None 
        data = data.to_dict()
        # try:
        #     url = "https://api.critique-labs.ai/v1/published-service/active-entity-count"
        #     request_data = { "site": self.name, "metric": f"total {self.metric_name}" }
        #     headers = {
        #         'Content-Type': 'application/json',
        #         'X-API-Key': os.getenv('CRITIQUE_API_KEY')
        #     }
        #     response = requests.post(url, headers=headers, json=request_data)
        #     values = response.json()
        #     data['target_entities'] = values['response']['result']
        # except Exception as e:
        #     print(f"Error getting metadata for {self.name}: {e}")
        #     data['target_entities'] = -1
        data['target_entities'] = -1
        return data 
    
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

    def search_entities(self, query: str, limit: int = 10):
        with Session(engine) as session:
            # Create a search pattern with wildcards
            search_pattern = f"%{query}%"
            
            # Get top matching results
            entities = session.query(self.EntityModel)\
                .filter(self.EntityModel.identifier.ilike(search_pattern))\
                .order_by(self.EntityModel.index.desc())\
                .limit(limit)\
                .all()
            return entities