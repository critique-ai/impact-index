from typing import List
import requests
import os
from sites.types import RequestEntity, Record, EntityInfo,EntityMetadata
from sites import SiteWorker
from datetime import datetime
import time


class Github(SiteWorker):
    name = "github"
    description = 'Github user H-index based on number of followers'
    index_description = 'A user has an H-index of N if they have exactly N repos with at least N stars'
    entity_name = 'Accounts'
    metric_name = 'stars'
    primary_color = 'gray'
    secondary_color = 'black'
    
    def __init__(self):
        super().__init__()
        self.headers = {
            'Authorization': f'token {os.getenv("GITHUB_API_KEY")}',
            'Accept': 'application/vnd.github.v3+json'
        }

    def check_rate_limit(self):
        """Check remaining rate limit and wait if necessary"""
        rate_limit_url = "https://api.github.com/rate_limit"
        response = requests.get(rate_limit_url, headers=self.headers)
        data = response.json()
        
        remaining = data['rate']['remaining']
        reset_time = datetime.fromtimestamp(data['rate']['reset'])
        
        if remaining <= 1:
            wait_time = (reset_time - datetime.now()).total_seconds()
            if wait_time > 0:
                print(f"Rate limit reached. Waiting {wait_time:.0f} seconds...")
                time.sleep(wait_time + 1)  # Add 1 second buffer

    def entity_info(self, entity: RequestEntity) -> EntityInfo:
        repos_url = f"https://api.github.com/users/{entity.identifier}/repos"
        repos_response = requests.get(repos_url, headers=self.headers)
        repos = repos_response.json()
        result =[]
        for repo in repos:
            result.append(Record(link=repo['html_url'], description=repo['description'] if repo['description'] else "", created_at=datetime.strptime(repo['created_at'], '%Y-%m-%dT%H:%M:%SZ'), metric=repo['stargazers_count'], metric_type="stars"))
        user_info_url = f"https://api.github.com/users/{entity.identifier}"
        user_info_response = requests.get(user_info_url, headers=self.headers)
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
        related = [] 
        try:
            self.check_rate_limit()
            starred_url = f"https://api.github.com/users/{entity.identifier}/starred"
            starred_response = requests.get(starred_url, headers=self.headers)
            starred = starred_response.json()
            related.extend([RequestEntity(identifier=user['owner']['login'], type=self.name) for user in starred])
        except Exception as e:
            print(f"Error fetching starred users: {e}")
        return related