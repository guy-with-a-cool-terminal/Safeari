import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from '@/lib/api';
import type { OverviewResponse } from '@/lib/api/types';

/**
 * React Query hook for analytics overview data
 *
 * Features:
 * - Automatic caching (5 min stale time)
 * - Retry on failure (3 attempts)
 * - Background refetching
 * - Automatic request cancellation
 *
 * @param profileId - Profile ID to fetch analytics for
 * @param timeRange - Time range filter (1d, 7d, 30d)
 * @returns Query result with overview data
 */
export function useAnalyticsOverview(profileId: string | undefined, timeRange: string) {
  return useQuery({
    queryKey: ['analytics', 'overview', profileId, timeRange],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const profileIdNum = parseInt(profileId, 10);
      if (isNaN(profileIdNum)) {
        throw new Error('Invalid profile ID: must be a number');
      }

      return getAnalyticsOverview(profileIdNum, timeRange);
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
