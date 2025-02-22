from sites.types import RequestEntity, Record
from sites import SiteWorker
from typing import List
from googleapiclient.discovery import build
import os


class Youtube(SiteWorker):
    name = "youtube"
    description = "Youtube channel H-index based on views"
    index_description = "A channel has an H-index of N if they have N videos with at least N million views each"
    entity_name = "Channel"
    metric_name = "Million views"
    primary_color = "bg-red-500"
    secondary_color = "white"
    def __init__(self):
        super().__init__()
        self.client = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

    
    def records_for_entity(self, entity: RequestEntity) -> List[Record]:
        records = []
        try:
            channel_response = self.client.channels().list(
                forHandle=entity.identifier,
                part='id,contentDetails'
            ).execute()
        
            if not channel_response['items']:
                return records
            
            channel_id = channel_response['items'][0]['id']
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
        return records

    def get_related_entities(self, entity: RequestEntity) -> List[RequestEntity]:
        #using featured channels for a given channel
        entities = [] 
        try:
            channel_response = self.client.channels().list(
                forHandle=entity.identifier,
                part='id,contentDetails'
            ).execute()
        
            if not channel_response['items']:
                return entities
            
            channel_id = channel_response['items'][0]['id']
            playlists_response = self.client.playlists().list(
                part='id',
                channelId=channel_id,
                maxResults=50
            ).execute()

            for playlist in playlists_response.get('items', []):
                playlist_items = self.client.playlistItems().list(
                    part='snippet,contentDetails',
                    playlistId=playlist['id'],
                    maxResults=50
                ).execute()

                for item in playlist_items.get('items', []):
                    channel_details = self.client.channels().list(
                        id=item['snippet']['channelId'],
                        part='snippet'
                    ).execute()
                    if channel_details['items']:
                        custom_url = channel_details['items'][0]['snippet'].get('customUrl')
                        if custom_url:
                            # Remove '@' prefix if present
                            handle = custom_url.lstrip('@')
                            entities.append(RequestEntity(type=self.name, identifier=handle))

        except Exception as e:
            print(f"Error fetching channel details: {e}")
        return entities

