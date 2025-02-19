from dotenv import load_dotenv

load_dotenv()


from sites.reddit import records_for_entity

from sites.types import Entity, SupportedSites
from utils import calculate_h_index

if __name__ == "__main__":
    records = records_for_entity(Entity(type=SupportedSites.REDDIT, identifier="critiqueextension"))
    h_index = calculate_h_index(records)
    print('the length of the records is', len(records))
    print('the h-index is', h_index)
