from dotenv import load_dotenv
import os
import importlib
from typing import Dict, Type

from sites import SiteWorker
from sites.types import Entity, SupportedSites
from utils import calculate_h_index

load_dotenv()

def load_site_workers() -> Dict[str, Type[SiteWorker]]:
    site_workers = {}
    sites_dir = os.path.join(os.path.dirname(__file__), 'sites')
    
    # Skip these directories/files when scanning for site workers
    exclude = {'__pycache__', '__init__.py', 'types.py'}
    
    for item in os.listdir(sites_dir):
        if item in exclude or not os.path.isdir(os.path.join(sites_dir, item)):
            continue
            
        try:
            # Import the module (e.g., 'sites.reddit')
            module = importlib.import_module(f'sites.{item}')
            
            # Look for a class that inherits from SiteWorker
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (isinstance(attr, type) and 
                    issubclass(attr, SiteWorker) and 
                    attr != SiteWorker):
                    site_workers[item] = attr
                    break
        except ImportError as e:
            print(f"Failed to load site worker {item}: {e}")
    
    return site_workers

if __name__ == "__main__":
    site_workers = load_site_workers()
    print(f"Loaded site workers: {list(site_workers.keys())}")
    
    # Example usage
    reddit_worker = site_workers['reddit']()
    records = reddit_worker.records_for_entity(
        Entity(type=SupportedSites.reddit, identifier="critiqueextension")
    )
    h_index = calculate_h_index(records)
    print('Number of records:', len(records))
    print('H-index:', h_index)
