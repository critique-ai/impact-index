from datetime import datetime
from enum import Enum
from pydantic import BaseModel
import os
import pathlib
from typing import List
from dataclasses import dataclass
def _get_supported_sites():
    # Get the directory where this file is located
    current_dir = pathlib.Path(__file__).parent
    # Get all subdirectories that don't start with '__'
    sites = {d.name: d.name for d in current_dir.iterdir() 
             if d.is_dir() and not d.name.startswith('__')}
    return sites

# Create the enum dynamically
SupportedSites = Enum('SupportedSites', _get_supported_sites())

class RequestEntity(BaseModel):
    type: str
    identifier: str

class Record(BaseModel):
    link: str
    description: str
    created_at: datetime
    metric: int 
    metric_type: str

@dataclass
class EntityMetadata:
    url: str = ""
    identifier: str = ""
    created_at: datetime = None

@dataclass
class EntityInfo:
    records: List[Record]
    metadata: EntityMetadata

    def to_dict(self,drop=[]):
        return {
            "records": [record.to_dict(drop=drop) for record in self.records],
            "metadata": self.metadata.to_dict()
        }