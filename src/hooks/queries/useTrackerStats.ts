import { useQuery } from '@tanstack/react-query';
import { getTrackerStats } from '@/lib/api';
import type { TrackersResponse } from '@/lib/api/types';

/**
 * React Query hook for tracker statistics
 *
 * @param profileId - Profile ID to fetch tracker stats for
 * @param timeRange - Time range filter (1d, 7d, 30d)
 * @returns Query result with tracker insights (allowed/blocked)
 */
export function useTrackerStats(profileId: string | undefined, timeRange: string) {
  return useQuery({
    queryKey: ['analytics', 'trackers', profileId, timeRange],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const profileIdNum = parseInt(profileId, 10);
      if (isNaN(profileIdNum)) {
        throw new Error('Invalid profile ID: must be a number');
      }

      return getTrackerStats(profileIdNum, timeRange);
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
