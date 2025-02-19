import os
import importlib
import inspect
from typing import Type

import pytest

from sites import SiteWorker
from main import load_site_workers

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

    def test_site_worker_implementation(self):
        """Test that each site directory contains exactly one SiteWorker class, and that the class name matches the directory name."""
        sites_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sites')
        exclude = {'__pycache__', '__init__.py', 'types.py'}
        
        for item in os.listdir(sites_dir):
            if item in exclude or not os.path.isdir(os.path.join(sites_dir, item)):
                continue
                
            # Import the module
            module = importlib.import_module(f'sites.{item}')
            
            # Find all classes that inherit from SiteWorker
            site_worker_classes = []
            for name, obj in inspect.getmembers(module):
                if (inspect.isclass(obj) and 
                    issubclass(obj, SiteWorker) and 
                    obj != SiteWorker):
                    site_worker_classes.append(obj)
            
            # Assert exactly one SiteWorker class exists
            assert len(site_worker_classes) == 1, \
                f"Directory {item} should contain exactly one SiteWorker class"
            
            worker_class = site_worker_classes[0]
            assert hasattr(worker_class, 'name'), \
                f"SiteWorker class in {item} must define a 'name' class attribute"
            assert worker_class.name == item, \
                f"SiteWorker class name '{worker_class.name}' must match directory name '{item}'"

    def test_site_worker_loading(self):
        """Test that the load_site_workers function works correctly."""
        site_workers = load_site_workers()
        
        # Check that we got a dictionary
        assert isinstance(site_workers, dict)
        
        # Check that all values are SiteWorker subclasses
        for site_name, worker_class in site_workers.items():
            assert issubclass(worker_class, SiteWorker), \
                f"Worker for {site_name} is not a SiteWorker subclass"
            assert worker_class != SiteWorker, \
                f"Worker for {site_name} cannot be the abstract SiteWorker class"

    def test_site_worker_initialization(self):
        """Test that all site workers can be initialized."""
        site_workers = load_site_workers()
        
        for site_name, worker_class in site_workers.items():
            try:
                worker = worker_class()
                assert isinstance(worker, SiteWorker), \
                    f"Initialized worker for {site_name} is not a SiteWorker instance"
            except Exception as e:
                pytest.fail(f"Failed to initialize worker for {site_name}: {str(e)}")

    def test_valid_mock_site_worker(self, valid_mock_site_worker):
        """Test that a valid mock site worker is properly recognized."""
        assert issubclass(valid_mock_site_worker, SiteWorker)
        worker = valid_mock_site_worker()
        assert isinstance(worker, SiteWorker)
