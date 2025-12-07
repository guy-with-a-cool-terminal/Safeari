import { useQuery } from '@tanstack/react-query';
import { getTopDomains } from '@/lib/api';
import type { DomainStat } from '@/lib/api/types';

/**
 * React Query hook for top domains data
 *
 * @param profileId - Profile ID to fetch domains for
 * @param timeRange - Time range filter (1d, 7d, 30d)
 * @param limit - Number of domains to fetch (default: 50)
 * @returns Query result with top domains
 */
export function useTopDomains(
  profileId: string | undefined,
  timeRange: string,
  limit: number = 50
) {
  return useQuery({
    queryKey: ['analytics', 'domains', profileId, timeRange, limit],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const profileIdNum = parseInt(profileId, 10);
      if (isNaN(profileIdNum)) {
        throw new Error('Invalid profile ID: must be a number');
      }

      return getTopDomains(profileIdNum, timeRange, limit);
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
