from typing import List
import requests
from sites.types import RequestEntity, Record, EntityInfo,EntityMetadata
from sites import SiteWorker
from datetime import datetime


class Github(SiteWorker):
    name = "github"
    description = 'Github user H-index based on number of followers'
    index_description = 'A user has an H-index of N if they have exactly N repos with at least N stars'
    entity_name = 'Users'
    metric_name = 'stars'
    primary_color = 'bg-gray-500'
    secondary_color = 'black'
    
    def __init__(self):
        super().__init__()


    def entity_info(self, entity: RequestEntity) -> EntityInfo:
        repos_url = f"https://api.github.com/users/{entity.identifier}/repos"
        repos_response = requests.get(repos_url)
        repos = repos_response.json()
        result =[]
        for repo in repos:
            result.append(Record(link=repo['html_url'], description=repo['description'] if repo['description'] else "", created_at=datetime.strptime(repo['created_at'], '%Y-%m-%dT%H:%M:%SZ'), metric=repo['stargazers_count'], metric_type="stars"))
        user_info_url = f"https://api.github.com/users/{entity.identifier}"
        user_info_response = requests.get(user_info_url)
        user_info = user_info_response.json()
        return EntityInfo(
            records=result, 
            metadata=EntityMetadata(
                identifier=entity.identifier, 
                url=f"https://github.com/{entity.identifier}", 
                created_at = datetime.strptime(user_info['created_at'], '%Y-%m-%dT%H:%M:%SZ')
            )
        )

    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        # get users that have commented on this user's posts and users that this user has commented on
        following_url = f"https://api.github.com/users/{entity.identifier}/following"
        following_response = requests.get(following_url)
        following = following_response.json()
        return [RequestEntity(identifier=user['login'], type=self.name) for user in following]
