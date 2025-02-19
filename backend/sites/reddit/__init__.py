
import os
import praw 

from typing import List

from sites.types import Entity, Record
from sites import SiteWorker

class Reddit(SiteWorker):
    def __init__(self):
        super().__init__("reddit")
        self.reddit_client = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent="impact-index-bot",
        )
        self.reddit_client.read_only = True


    def records_for_entity(self, entity: Entity) -> List[Record]:
        user = self.reddit_client.redditor(entity.identifier)
        comments = user.comments.new(limit=None)
        posts = user.submissions.top(limit=None)
        comment_records = [Record(link=comment.permalink, description=comment.body, created_at=comment.created_utc, metric=comment.score, metric_type="upvotes") for comment in comments]
        post_records = [Record(link=post.permalink, description=post.title, created_at=post.created_utc, metric=post.score, metric_type="upvotes") for post in posts]
        return comment_records + post_records