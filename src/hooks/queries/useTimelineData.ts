import { useQuery } from '@tanstack/react-query';
import { getTimelineData } from '@/lib/api';
import type { TimelineData } from '@/lib/api/types';

/**
 * React Query hook for timeline chart data
 *
 * @param profileId - Profile ID to fetch timeline for
 * @param timeRange - Time range filter (1d, 7d, 30d)
 * @returns Query result with timeline data (24 points)
 */
export function useTimelineData(profileId: string | undefined, timeRange: string) {
  return useQuery({
    queryKey: ['analytics', 'timeline', profileId, timeRange],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const profileIdNum = parseInt(profileId, 10);
      if (isNaN(profileIdNum)) {
        throw new Error('Invalid profile ID: must be a number');
      }

      return getTimelineData(profileIdNum, timeRange);
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
