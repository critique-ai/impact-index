
from sites import SiteWorker
from huggingface_hub import HfApi
import requests
from sites.types import RequestEntity, Record, EntityInfo,EntityMetadata
from typing import List
import os

class HuggingFace(SiteWorker):
    name = "huggingface"
    description = 'Hugging Face user H-index based on number of models and likes for models'
    index_description = 'A user has an H-index of N if they have N models with at least N downloads each'
    entity_name = 'Accounts'
    metric_name = 'downloads'
    primary_color = 'gold'
    secondary_color = 'white'

    def __init__(self):
        super().__init__()
        self.client = HfApi(token=os.getenv("HF_API_TOKEN"))
    

    def entity_info(self, entity: RequestEntity) -> EntityInfo:
        models = self.client.list_models(author=entity.identifier)
        return EntityInfo(records=[Record(link=model.modelId, description=model.modelId, created_at=model.created_at, metric=model.downloads, metric_type="downloads") for model in models], metadata=EntityMetadata(identifier=entity.identifier, url=f"https://huggingface.co/{entity.identifier}"))
    
    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        try:
            url = f"https://huggingface.co/api/users/{entity.identifier}/following"
            response = requests.get(url)
            return [RequestEntity(identifier=user['user'], type=self.name) for user in response.json()]
        except Exception as e:
            print(f"Error getting related entities for {entity.identifier} in {self.name}: {e}")
            return []
    