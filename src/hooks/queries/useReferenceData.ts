import { useQuery } from '@tanstack/react-query';
import { getReferenceData } from '@/lib/api';
import type { ReferenceDataResponse } from '@/lib/api/types';

/**
 * React Query hook for reference data (categories, blocklists, security features, etc.)
 *
 * IMPORTANT: Backend refreshes reference data every 24 hours
 * We cache for 24 hours to align with backend update cycle
 *
 * This data is used across:
 * - Landing page (features display)
 * - Parental Controls (categories, services)
 * - Security Settings (security features, countries)
 * - Privacy Settings (blocklists, native trackers)
 * - Subscription pages (tier features)
 *
 * @returns Query result with reference data
 */
export function useReferenceData() {
  return useQuery({
    queryKey: ['reference-data'],
    queryFn: getReferenceData,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - aligns with backend refresh cycle
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnWindowFocus: false, // Don't refetch on focus (data changes only daily)
    refetchOnReconnect: false, // Don't refetch on reconnect (data changes only daily)
  });
}
