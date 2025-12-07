import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/api';
import type { Profile } from '@/lib/api/types';

/**
 * React Query hook for individual profile data
 *
 * Used by ProfileSettings page to load full profile details
 *
 * @param profileId - Profile ID to fetch
 * @returns Query result with profile data
 */
export function useProfileData(profileId: number | undefined) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      return getProfile(profileId);
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
