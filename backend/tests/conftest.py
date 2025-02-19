import pytest
import os
import sys
from typing import List

# Add the backend directory to Python path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from sites import SiteWorker
from sites.types import Entity, Record

# Create a mock SiteWorker for testing
class ValidMockSiteWorker(SiteWorker):
    name = "mock"
    def __init__(self):
        super().__init__()
    
    def records_for_entity(self, entity: Entity) -> List[Record]:
        return []

    def get_related_entities(self, entity: Entity) -> List[Entity]:
        return []

# Create an invalid worker (doesn't inherit from SiteWorker)
class InvalidWorker:
    pass

@pytest.fixture
def valid_mock_site_worker():
    return ValidMockSiteWorker

@pytest.fixture
def invalid_worker():
    return InvalidWorker 