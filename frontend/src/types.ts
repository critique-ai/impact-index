export interface Site {
  name: string;
  description: string;
  index_description: string;
  entity_name: string; // "User", "Channel", etc.
  metric_name: string; // "upvotes", "views", etc.
  primary_color: string;
  secondary_color: string;
  index_mean?: number;
  index_median?: number;
  index_stddev?: number;
  index_min?: number;
  index_max?: number;
  target_entities?: number;
  current_entities?: number;
  index_1q?: number;
  index_3q?: number;
  histogram?: {
    bucket_start: number;
    bucket_end: number;
    count: number;
    percentage: number;
  }[];
}

export interface Entity {
  identifier: string;
  index: number;
  created_at: string;
  last_updated_at: string;
  total_metrics: number;
  url: string;
}



export interface TopResponse {
  entities: Entity[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  }
}

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  metrics: number;
  date: string;
}

export interface ProfileResponse {
  entity: Entity;
  stats: {
    percentile: number;
  }
}
