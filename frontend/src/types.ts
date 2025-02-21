export interface Site {
  id: string;
  name: string;
  description: string;
  hIndexDescription: string;
  entityName: string; // "User", "Channel", etc.
  metricName: string; // "upvotes", "views", etc.
  primaryColor: string;
  secondaryColor: string;
}

export interface TableEntry {
  id: string;
  name: string;
  hIndex: number;
  totalMetrics: number;
  profileUrl: string;
}

export interface TopEntry {
  id: string;
  name: string;
  hIndex: number;
  totalMetrics: number;
  profileUrl: string;
}

export interface TopResponse {
  site: Site;
  entries: TopEntry[];
}

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  metrics: number;
  date: string;
}

export interface ProfileResponse {
  site: Site;
  profile: {
    id: string;
    name: string;
    hIndex: number;
    totalMetrics: number;
    topContent: ContentItem[];
  };
}