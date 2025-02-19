import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Site, TopResponse, ProfileResponse } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



// Dummy data for development
export const dummySites: Site[] = [
  {
    id: 'reddit',
    name: 'Reddit',
    description: 'Reddit user H-index based on post and comment karma',
    hIndexDescription: 'A user has an H-index of N if they have N posts or comments with at least N upvotes each',
    entityName: 'User',
    metricName: 'upvotes'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'YouTube channel H-index based on video views',
    hIndexDescription: 'A channel has an H-index of N if they have N videos with at least N thousand views each',
    entityName: 'Channel',
    metricName: 'thousand views'
  }
];

// Simulated existing accounts for demo purposes
const dummyAccounts = {
  reddit: ['GallowBoob', 'Poem_for_your_sprog', 'shittymorph'],
  youtube: ['3Blue1Brown', 'Veritasium', 'Vsauce']
};

export const dummyTopResponse = (siteId: string): TopResponse => ({
  site: dummySites.find(s => s.id === siteId) || dummySites[0],
  entries: (dummyAccounts[siteId as keyof typeof dummyAccounts] || []).map((name, i) => ({
    id: name.toLowerCase(),
    name,
    hIndex: 100 - i * 5,
    totalMetrics: (100 - i * 5) * 1000,
    profileUrl: `/${siteId}/${name.toLowerCase()}`
  }))
});

export const dummyProfileResponse = (siteId: string, accountId: string): ProfileResponse | null => {
  const site = dummySites.find(s => s.id === siteId);
  if (!site) return null;

  const accounts = dummyAccounts[siteId as keyof typeof dummyAccounts] || [];
  const accountExists = accounts.some(name => name.toLowerCase() === accountId.toLowerCase());
  if (!accountExists) return null;

  return {
    site,
    profile: {
      id: accountId,
      name: accounts.find(name => name.toLowerCase() === accountId.toLowerCase()) || accountId,
      hIndex: 75,
      totalMetrics: 150000,
      topContent: Array.from({ length: 10 }, (_, i) => ({
        id: `content${i}`,
        title: `Amazing ${siteId === 'youtube' ? 'Video' : 'Post'} ${i + 1}`,
        url: `https://example.com/${i}`,
        metrics: 1000 - i * 50,
        date: new Date(Date.now() - i * 86400000).toISOString()
      }))
    }
  };
};