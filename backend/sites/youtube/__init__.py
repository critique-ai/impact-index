from sites.types import RequestEntity, Record, EntityInfo,EntityMetadata
from sites import SiteWorker
from typing import List
from googleapiclient.discovery import build
import os
from datetime import datetime
import time
class Youtube(SiteWorker):
    name = "youtube"
    description = "Youtube channel H-index based on views"
    index_description = "A channel has an H-index of N if they have exactly N videos with at least N million views each"
    entity_name = "Channels"
    metric_name = "Million views"
    primary_color = "bg-red-500"
    secondary_color = "white"
    def __init__(self):
        super().__init__()
        self.client = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

    
    def entity_info(self, entity: RequestEntity) -> EntityInfo:
        records = []
        metadata = EntityMetadata(identifier=entity.identifier, url=f"https://www.youtube.com/@{entity.identifier}")
        try:
            channel_response = self.client.channels().list(
                forHandle=entity.identifier,
                part='id,contentDetails,snippet'
            ).execute()
        
            if not channel_response['items']:
                raise Exception("Channel not found")
            
            channel_id = channel_response['items'][0]['id']
            metadata.created_at  = datetime.fromisoformat(channel_response['items'][0]['snippet']['publishedAt'])
            
            uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            video_ids = []
            next_page_token = None
            while True:
                playlist_response = self.client.playlistItems().list(
                    playlistId=uploads_playlist_id,
                    part='contentDetails',
                    maxResults=50, #max results per page
                    pageToken=next_page_token
                ).execute()

                for item in playlist_response['items']:
                    video_ids.append(item['contentDetails']['videoId'])

                next_page_token = playlist_response.get('nextPageToken')
                if not next_page_token:
                    break
            for i in range(0, len(video_ids), 50):  # YouTube API allows max 50 IDs per request
                batch_ids = video_ids[i:i+50]
                video_response = self.client.videos().list(
                    id=','.join(batch_ids),
                    part='snippet,statistics'
                ).execute()
                for video in video_response['items']:
                    records.append(Record(link=f"https://www.youtube.com/watch?v={video['id']}", description=video['snippet']['title'], created_at=video['snippet']['publishedAt'], metric=int(int(video['statistics'].get('viewCount', 0))/1000000), metric_type="views(thousands)"))
        except Exception as e:
            print(f"Error fetching channel details: {e}")
            raise Exception(f"Error fetching channel details: {e}")
        return EntityInfo(records=records, metadata=metadata)

    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        # using topic categories to find related channels
        entities = [] 
        try:
            channel_response = self.client.channels().list(
                forHandle=entity.identifier,
                part='topicDetails'
            ).execute()
        
            if not channel_response['items']:
                return entities
            
            topics = channel_response['items'][0]['topicDetails']['topicCategories']
            if len(topics) > 0:
                topic = topics[0]
                # search for channels by topic 
                search_response = self.client.search().list(
                    q=topic,
                    part='id,snippet',
                    type='channel',
                    maxResults=10
                ).execute()

                channel_ids = [item['id']['channelId'] for item in search_response['items']]
                for channel_id in channel_ids:
                    time.sleep(1) # for rate limiting
                    channel_response = self.client.channels().list(
                        id=channel_id,
                        part='id,snippet,contentDetails'
                    ).execute()
                    if channel_response['items']:
                        custom_url = channel_response['items'][0]['snippet'].get('customUrl')
                        if custom_url:
                            handle = custom_url.lstrip('@')
                            entities.append(RequestEntity(type=self.name, identifier=handle))

        except Exception as e:
            print(f"Error fetching channel details: {e}")
        return entities

if __name__ == "__main__":
    youtube = Youtube()
    print(youtube.get_related_entities(RequestEntity(type="youtube", identifier="LowLevelTV")))