from typing import List, Dict, Type
import os
import importlib

from sites import SiteWorker


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
                    site_workers[item] = attr()
                    break
        except ImportError as e:
            print(f"Failed to load site worker {item}: {e}")
    
    return site_workers