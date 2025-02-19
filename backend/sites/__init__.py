from abc import ABC, abstractmethod
from typing import List

from sites.types import Entity, Record


class SiteWorker(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def records_for_entity(self, entity: Entity) -> List[Record]:
        pass

