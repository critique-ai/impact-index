from datetime import datetime

from enum import Enum
from pydantic import BaseModel


class SupportedSites(Enum):
    REDDIT = "reddit"
    X = "x"

class Entity(BaseModel):
    type: SupportedSites
    identifier: str


class Record(BaseModel):
    link: str
    description: str
    created_at: datetime
    metric: int 
    metric_type: str

