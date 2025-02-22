
import os
import praw 

from typing import List

from sites.types import RequestEntity, Record
from sites import SiteWorker


class Reddit(SiteWorker):
    name = "reddit"
    description = 'Reddit user H-index based on post and comment karma'
    index_description = 'A user has an H-index of N if they have N posts or comments with at least N upvotes each'
    entity_name = 'User'
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


    def records_for_entity(self, entity: RequestEntity) -> List[Record]:
        user = self.reddit_client.redditor(entity.identifier)
        comments = user.comments.new(limit=None)
        posts = user.submissions.top(limit=None)
        comment_records = [Record(link=comment.permalink, description=comment.body, created_at=comment.created_utc, metric=comment.score, metric_type="upvotes") for comment in comments]
        post_records = [Record(link=post.permalink, description=post.title, created_at=post.created_utc, metric=post.score, metric_type="upvotes") for post in posts]
        return comment_records + post_records

    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        # get users that have commented on this user's posts and users that this user has commented on
        entity_set = set()
        related_entities = []
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
        
        for post in posts:
            #get the comments on this post
            comments = post.comments.new(limit=None)
            for comment in comments:
                #get the author of the comment
                comment_author = comment.author
                if comment_author:
                    if comment_author.name not in entity_set:
                        entity_set.add(comment_author.name)
                        related_entities.append(RequestEntity(identifier=comment_author.name,type=self.name))
        return related_entities
    

if __name__ == "__main__":
    reddit = Reddit()
    print(reddit.get_related_entities(RequestEntity(type="reddit", identifier="critiqueextension")))