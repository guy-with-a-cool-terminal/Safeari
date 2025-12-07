import { useQuery } from '@tanstack/react-query';
import { getQueryLogs } from '@/lib/api';
import type { LogsResponse } from '@/lib/api/types';

/**
 * React Query hook for query logs
 *
 * @param profileId - Profile ID to fetch logs for
 * @param limit - Number of log entries to fetch
 * @returns Query result with paginated logs
 */
export function useQueryLogs(profileId: string | undefined, limit: number) {
  return useQuery({
    queryKey: ['analytics', 'logs', profileId, limit],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');

      const profileIdNum = parseInt(profileId, 10);
      if (isNaN(profileIdNum)) {
        throw new Error('Invalid profile ID: must be a number');
      }

      return getQueryLogs(profileIdNum, limit);
    },
    enabled: !!profileId,
    staleTime: 2 * 60 * 1000, // 2 minutes (logs change more frequently)
  });
}
