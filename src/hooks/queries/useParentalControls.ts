import { useQuery } from '@tanstack/react-query';
import { getParentalControls } from '@/lib/api';
import type { ParentalControlsData } from '@/lib/api/types';

/**
 * React Query hook for parental control settings
 *
 * @param profileId - Profile ID to fetch parental controls for
 * @returns Query result with parental control settings
 */
export function useParentalControls(profileId: number | undefined) {
  return useQuery({
    queryKey: ['parental-controls', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      return getParentalControls(profileId);
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes (settings change infrequently)
  });
}
