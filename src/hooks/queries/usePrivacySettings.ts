import { useQuery } from '@tanstack/react-query';
import { getPrivacySettings } from '@/lib/api';
import type { PrivacySettingsData } from '@/lib/api/types';

/**
 * React Query hook for privacy settings
 *
 * @param profileId - Profile ID to fetch privacy settings for
 * @returns Query result with privacy settings
 */
export function usePrivacySettings(profileId: number | undefined) {
  return useQuery({
    queryKey: ['privacy-settings', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      return getPrivacySettings(profileId);
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
