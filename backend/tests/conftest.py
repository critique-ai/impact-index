import pytest
import os
import sys
from typing import List
from utils import load_site_workers
# Add the backend directory to Python path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from sites import SiteWorker


# Create a mock SiteWorker for testing
class ValidMockSiteWorker(SiteWorker):
    name = "mock"
    description = "Mock site worker for testing"
    index_description = "Mock index description for testing"
    entity_name = "Mock entity"
    metric_name = "Mock metric"
    primary_color = "bg-blue-500"
    secondary_color = "bg-green-500"
    def __init__(self):
        super().__init__()
    
    def records_for_entity(self, entity): # -> List[Record]: #TODO: fix this
        return []

    def get_related_entities(self, entity): # -> List[RequestEntity]: #TODO: fix this
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
    
@pytest.fixture(scope="session") 
def site_workers():
    """Initialize site_workers once for all tests."""
    return load_site_workers()
