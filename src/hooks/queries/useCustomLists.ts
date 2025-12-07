import { useQuery } from '@tanstack/react-query';
import { getAllowlist, getDenylist } from '@/lib/api';
import type { DomainListResponse } from '@/lib/api/types';

/**
 * React Query hook for allowlist (allowed domains)
 *
 * @param profileId - Profile ID to fetch allowlist for
 * @returns Query result with allowlist domains
 */
export function useAllowlist(profileId: number | undefined) {
  return useQuery({
    queryKey: ['allowlist', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      return getAllowlist(profileId);
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook for denylist (blocked domains)
 *
 * @param profileId - Profile ID to fetch denylist for
 * @returns Query result with denylist domains
 */
export function useDenylist(profileId: number | undefined) {
  return useQuery({
    queryKey: ['denylist', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      return getDenylist(profileId);
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
