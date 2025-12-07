import { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useCurrentSubscription, useSubscriptionTiers } from '@/hooks/queries';
import type { Subscription, SubscriptionTier } from '@/lib/api/subscriptions';
import { isAuthenticated } from '@/lib/api';

interface SubscriptionContextType {
  subscription: Subscription | null;
  subscriptionTier: SubscriptionTier | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * SubscriptionProvider - Now powered by React Query
 *
 * Uses React Query under the hood with intelligent caching:
 * - Current subscription: 5 min cache
 * - Subscription tiers: 1 hr cache (rarely change)
 *
 * Benefits:
 * - Faster landing page (tiers cached)
 * - Faster subscription pages (tiers cached)
 * - Background updates
 * - Shared cache across components
 */
export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  // Use React Query hooks directly
  const subscriptionQuery = useCurrentSubscription();
  const tiersQuery = useSubscriptionTiers();

  // Cache tier to localStorage for instant access (as before)
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.removeItem('cached_tier');
    } else if (subscriptionQuery.data?.tier) {
      localStorage.setItem('cached_tier', subscriptionQuery.data.tier);
    }
  }, [subscriptionQuery.data?.tier]);

  // Find matching tier details
  const subscriptionTier = useMemo(() => {
    if (!subscriptionQuery.data?.tier || !tiersQuery.data) return null;
    return tiersQuery.data.find(t => t.id === subscriptionQuery.data.tier) || null;
  }, [subscriptionQuery.data?.tier, tiersQuery.data]);

  // Combined refetch function
  const refetch = async (): Promise<void> => {
    await Promise.all([
      subscriptionQuery.refetch(),
      tiersQuery.refetch(),
    ]);
  };

  const value: SubscriptionContextType = {
    subscription: subscriptionQuery.data || null,
    subscriptionTier,
    isLoading: subscriptionQuery.isLoading || tiersQuery.isLoading,
    error: subscriptionQuery.error as Error | null || tiersQuery.error as Error | null,
    refetch,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};