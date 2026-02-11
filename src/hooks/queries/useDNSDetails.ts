import { useQuery } from '@tanstack/react-query';
import { getNextDNSDetails } from '@/lib/api';

/**
 * React Query hook for profile DNS configuration details
 * 
 * @param profileId - Profile ID to fetch DNS details for
 * @returns Query result with DNS details
 */
export function useDNSDetails(profileId: number | undefined) {
    return useQuery({
        queryKey: ['dns-details', profileId],
        queryFn: async () => {
            if (!profileId) throw new Error('Profile ID is required');
            const response = await getNextDNSDetails(profileId);
            return response.data;
        },
        enabled: !!profileId,
        staleTime: 60 * 60 * 1000, // 1 hour (DNS details rarely change)
    });
}
