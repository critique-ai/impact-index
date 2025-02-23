import { twMerge } from 'tailwind-merge';
import type { Site, TopResponse, ProfileResponse } from '@/types';
import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const getSites = async (): Promise<Site[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/supported-sites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('Failed to fetch sites:', response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    return data.response ?? [];
  } catch (error) {
    console.error('Error fetching sites:', error);
    return [];
  }
};


export const getTopResponse = (siteId: string, page: number, per_page: number): Promise<TopResponse | null> => {
  const response = fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${siteId}/ranking/${page}/${per_page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(data => {
    return data.json();
  });
  return response.then(data => {
    return data;
  });
};

export const getProfileResponse = (siteId: string, accountId: string): Promise<ProfileResponse | null> => {
  const response =  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${siteId}/${accountId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(data => {
    return data.json();
  });
  return response.then(data => {
    return data.response ?? {entity: null, stats: null};
  });
};
