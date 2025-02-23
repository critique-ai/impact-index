
import os
import praw 

from typing import List

from sites.types import RequestEntity, Record, EntityInfo,EntityMetadata
from sites import SiteWorker
from datetime import datetime
class Reddit(SiteWorker):
    name = "reddit"
    description = 'Reddit user H-index based on post and comment karma'
    index_description = 'A user has an H-index of N if they have exactly N posts or comments with at least N upvotes each'
    entity_name = 'Users'
    metric_name = 'upvotes'
    primary_color = 'bg-red-500'
    secondary_color = 'black'
    
    def __init__(self):
        super().__init__()
        self.reddit_client = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent="impact-index-bot",
        )
        self.reddit_client.read_only = True


    def entity_info(self, entity: RequestEntity) -> EntityInfo:
        user = self.reddit_client.redditor(entity.identifier)
        comments = user.comments.new(limit=None)
        posts = user.submissions.top(limit=None)
        comment_records = [Record(link=comment.permalink, description=comment.body, created_at=comment.created_utc, metric=comment.score, metric_type="upvotes") for comment in comments]
        post_records = [Record(link=post.permalink, description=post.title, created_at=post.created_utc, metric=post.score, metric_type="upvotes") for post in posts]
        return EntityInfo(records=comment_records + post_records, metadata=EntityMetadata(identifier=user.name, url=f"https://www.reddit.com/user/{user.name}", created_at = datetime.fromtimestamp(user.created_utc)))

    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        # get users that have commented on this user's posts and users that this user has commented on
        entity_set = set()
        related_entities = []
        try:
            user = self.reddit_client.redditor(entity.identifier)
            comments = user.comments.new(limit=None)
            posts = user.submissions.top(limit=None)
            for comment in comments:
                #get the post that this comment is on 
                post = comment.submission
                #get the author of the post
                post_author = post.author
                if post_author:
                    if post_author.name not in entity_set:
                        entity_set.add(post_author.name)
                        related_entities.append(RequestEntity(identifier=post_author.name,type=self.name))
        except Exception as e:
            print(f"Error getting related entities for {entity.identifier}: {e}")
        return related_entities

if __name__ == "__main__":
    reddit = Reddit()
    print(reddit.get_related_entities(RequestEntity(type="reddit", identifier="critiqueextension")))