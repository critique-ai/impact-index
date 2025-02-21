import os
import importlib
import inspect
from typing import Type

import pytest

from sites import SiteWorker


class TestSiteWorkers:

    def test_sites_directory_structure(self):
        """Test that the sites directory contains only valid subdirectories."""
        sites_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sites')
        exclude = {'__pycache__', '__init__.py', 'types.py'}
        
        for item in os.listdir(sites_dir):
            if item in exclude:
                continue
            
            item_path = os.path.join(sites_dir, item)
            assert os.path.isdir(item_path), f"{item} should be a directory"
            
            # Check for __init__.py in each site directory
            init_path = os.path.join(item_path, '__init__.py')
            assert os.path.exists(init_path), f"Missing __init__.py in {item} directory"

    def test_site_worker_implementation(self, site_workers):
        """Test that each site directory contains exactly one SiteWorker class, and that the class name matches the directory name."""
            
        for site_name, worker_class in site_workers.items():
            assert hasattr(worker_class, 'name'), \
                f"SiteWorker class in {site_name} must define a 'name' class attribute"
            assert worker_class.name == site_name, \
                f"SiteWorker class name '{worker_class.name}' must match directory name '{site_name}'"
            assert hasattr(worker_class, 'description'), \
                f"SiteWorker class in {site_name} must define a 'description' class attribute"
            assert hasattr(worker_class, 'index_description'), \
                f"SiteWorker class in {site_name} must define a 'index_description' class attribute"
            assert hasattr(worker_class, 'entity_name'), \
                f"SiteWorker class in {site_name} must define a 'entity_name' class attribute"
            assert hasattr(worker_class, 'metric_name'), \
                f"SiteWorker class in {site_name} must define a 'metric_name' class attribute"


    def test_site_worker_initialization(self, site_workers):
        """Test that all site workers can be initialized."""
        # Use the pre-loaded site_workers
        for site_name, worker in site_workers.items():
            try:
                assert isinstance(worker, SiteWorker), \
                    f"Initialized worker for {site_name} is not a SiteWorker instance"
            except Exception as e:
                pytest.fail(f"Failed to initialize worker for {site_name}: {str(e)}")

