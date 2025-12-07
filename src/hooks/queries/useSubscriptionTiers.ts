import { useQuery } from '@tanstack/react-query';
import { getSubscriptionTiers } from '@/lib/api/subscriptions';
import type { SubscriptionTier } from '@/lib/api/subscriptions';

/**
 * React Query hook for subscription tier information
 *
 * This data is used on:
 * - Landing page (pricing section)
 * - Subscription selection page
 * - Upgrade modals
 * - Account subscription page
 *
 * Tiers rarely change, so we cache for 1 hour
 *
 * @returns Query result with subscription tiers
 */
export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: getSubscriptionTiers,
    staleTime: 60 * 60 * 1000, // 1 hour (tiers rarely change)
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
  });
}
