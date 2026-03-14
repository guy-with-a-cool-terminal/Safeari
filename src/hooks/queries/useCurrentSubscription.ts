import { useQuery } from '@tanstack/react-query';
import { getCurrentSubscription } from '@/lib/api/subscriptions';
import { isAuthenticated } from '@/lib/api';
import type { Subscription } from '@/lib/api/subscriptions';

/**
 * React Query hook for current user subscription
 *
 * This data is used across:
 * - Dashboard (feature gating)
 * - Subscription pages
 * - Account pages
 * - Navigation (profile limits)
 *
 * Cache settings:
 * - staleTime: 1 minute (reduced from 5min - subscription changes need to be reflected quickly)
 * - cacheTime: 10 minutes (keep in cache for offline support) - v4 uses cacheTime not gcTime
 *
 * @returns Query result with current subscription
 */
export function useCurrentSubscription() {
  return useQuery<Subscription>({
    queryKey: ['subscription', 'current'],
    queryFn: getCurrentSubscription,
    enabled: isAuthenticated(), // Only fetch if user is logged in
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (No subscription found)
      // This prevents backend log spam when users haven't chosen a plan yet
      if (error.response?.status === 404) return false;
      
      // Standard retry for other errors (network issues, 500s)
      return failureCount < 2;
    },
  });
}
