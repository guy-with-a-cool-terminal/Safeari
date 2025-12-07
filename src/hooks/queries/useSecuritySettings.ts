import { useQuery } from '@tanstack/react-query';
import { getSecuritySettings } from '@/lib/api';
import type { SecuritySettingsData } from '@/lib/api/types';

/**
 * React Query hook for security settings
 *
 * @param profileId - Profile ID to fetch security settings for
 * @returns Query result with security settings
 */
export function useSecuritySettings(profileId: number | undefined) {
  return useQuery({
    queryKey: ['security-settings', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      return getSecuritySettings(profileId);
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
