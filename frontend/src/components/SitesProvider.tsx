"use client"
import { createContext, useContext } from 'react';
import type { Site } from '@/types';

type SitesContextType = {
  sites: Site[];
};

const SitesContext = createContext<SitesContextType>({ sites: [] });

export function SitesProvider({ 
  children,
  initialSites 
}: { 
  children: React.ReactNode;
  initialSites: Site[];
}) {
  return (
    <SitesContext.Provider value={{ sites: initialSites }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites() {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error('useSites must be used within a SitesProvider');
  }
  return context;
}