import { createContext, useContext, ReactNode } from 'react';
import { useReferenceData as useReferenceDataQuery } from '@/hooks/queries';
import type { ReferenceDataResponse } from '@/lib/api/types';

interface ReferenceDataContextType {
  data: ReferenceDataResponse | null;
  isLoading: boolean;
  error: Error | null;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

/**
 * ReferenceDataProvider - Now powered by React Query
 *
 * Uses React Query under the hood with 24-hour cache
 * Reference data updates daily from backend, so we cache for 24 hours
 *
 * Benefits:
 * - Automatic caching (24hr cache aligns with backend refresh)
 * - Background updates
 * - Shared across all components using this context
 * - Landing page, subscription pages, settings all benefit
 */
export const ReferenceDataProvider = ({ children }: { children: ReactNode }) => {
  // Use React Query hook directly
  const query = useReferenceDataQuery();

  const value: ReferenceDataContextType = {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

export const useReferenceData = () => {
  const context = useContext(ReferenceDataContext);
  if (!context) {
    throw new Error('useReferenceData must be used within ReferenceDataProvider');
  }
  return context;
};
