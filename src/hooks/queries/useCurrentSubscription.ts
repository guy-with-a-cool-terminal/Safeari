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
 * @returns Query result with current subscription
 */
export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: getCurrentSubscription,
    enabled: isAuthenticated(), // Only fetch if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
