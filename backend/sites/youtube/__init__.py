from sites.types import Entity, Record
from sites import SiteWorker
from typing import List


class Youtube(SiteWorker):
    name = "youtube"
    description = "Youtube channel H-index based on views, likes, and comments"
    index_description = "A channel has an H-index of N if they have N videos with at least N(*1000) views each"
    entity_name = "Channel"
    metric_name = "views"
    primary_color = "bg-red-500"
    secondary_color = "white"
    def __init__(self):
        super().__init__()
    
    def records_for_entity(self, entity: Entity) -> List[Record]:
        return []

    def get_related_entities(self, entity: Entity) -> List[Entity]:
        return []
