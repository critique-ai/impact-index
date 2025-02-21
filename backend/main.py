from dotenv import load_dotenv
import os
import importlib
from typing import Dict, Type

from sites import SiteWorker
from sites.types import Entity, SupportedSites

from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware

from redis import Redis
from rq import Queue
from queue import Queue as InMemoryQueue

from utils import load_site_workers

state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    state['site_workers'] = load_site_workers()
    state['priority_queue'] = InMemoryQueue() # TODO: replace with redis implementation
    state['cache'] = {}
    yield

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def hello_world():
    return JSONResponse(content={"response": "Hello World"}, status_code=200)


@app.post("/add-entity")
async def add_entity(entity: Entity):
    if entity.type not in state['site_workers']:
        return JSONResponse(content={"error": "Site not supported"}, status_code=400)
    site_worker = state['site_workers'][entity.type]
    related_entities = site_worker.get_related_entities(entity)
    records = site_worker.records_for_entity(entity)
    return JSONResponse(content={"response": "Entity added to queue"}, status_code=200)

@app.get("/{site}/{identifier}")
async def get_entity(site: SupportedSites, identifier: str):
    if site.value not in state['site_workers'].keys():
        return JSONResponse(content={"error": "Site not supported"}, status_code=400)
    entity = state['site_workers'][site.value].retrieve_entity(identifier)
    if not entity: 
        entity = state['site_workers'][site.value].run(Entity(type=site, identifier=identifier))
    stats = state['site_workers'][site.value].get_entity_stats(identifier)

    return JSONResponse(content={"response": {"entity": entity.to_dict(drop=['id']) if entity else None, "stats": stats.to_dict()}}, status_code=200)
            
@app.get("/{site}/ranking/{page}/{per_page}")
async def top_entities_for_site(site: SupportedSites, page: int, per_page: int):
    if site.value not in state['site_workers'].keys():
        return JSONResponse(content={"error": "Site not supported"}, status_code=400)
    
    entities, total_count = state['site_workers'][site.value].get_top_entities(page, per_page)
    total_pages = (total_count + per_page - 1) // per_page  # Ceiling division
    
    return JSONResponse(content={
        "entities": [entity.to_dict(drop=['id']) for entity in entities],
        "pagination": {
            "current_page": page,
            "per_page": per_page,
            "total_items": total_count,
            "total_pages": total_pages
        }
    }, status_code=200)

@app.get("/supported-sites")
async def supported_sites():
    sites = []
    for site in state['site_workers'].keys():
        sites.append({
            "name": site,
            "description": state['site_workers'][site].description,
            "index_description": state['site_workers'][site].index_description,
            "entity_name": state['site_workers'][site].entity_name,
            "metric_name": state['site_workers'][site].metric_name,
            "primary_color": state['site_workers'][site].primary_color,
            "secondary_color": state['site_workers'][site].secondary_color
        })
    return JSONResponse(content={"response": sites}, status_code=200)

# if __name__ == "__main__":
#     site_workers = load_site_workers()
#     print(f"Loaded site workers: {list(site_workers.keys())}")
    
#     # Example usage
#     reddit_worker = site_workers['reddit']()
#     records = reddit_worker.records_for_entity(
#         Entity(type=SupportedSites.reddit, identifier="critiqueextension")
#     )
#     h_index = calculate_h_index(records)
#     print('Number of records:', len(records))
#     print('H-index:', h_index)
