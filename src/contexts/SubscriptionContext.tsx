import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentSubscription, useSubscriptionTiers } from '@/hooks/queries';
import type { Subscription, SubscriptionTier } from '@/lib/api/subscriptions';

interface SubscriptionContextType {
  subscription: Subscription | null;
  subscriptionTier: SubscriptionTier | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * SubscriptionProvider - Powered by React Query
 *
 * Uses React Query with intelligent caching:
 * - Current subscription: 1 min stale time, 10 min cache
 * - Subscription tiers: 1 hr cache (rarely change)
 * - Automatic cache invalidation on subscription changes
 *
 * Benefits:
 * - Always shows current subscription tier
 * - Shared cache across components
 * - Background updates
 * - Offline support via React Query persistence
 */
export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use React Query hooks directly
  const subscriptionQuery = useCurrentSubscription();
  const tiersQuery = useSubscriptionTiers();

  // Logic to handle missing subscription: Redirect to selection if not on onboarding/auth pages
  useEffect(() => {
    const isPublicPath = ['/', '/login', '/register', '/terms', '/privacy', '/pitch'].includes(location.pathname);
    const isOnboardingPath = location.pathname.startsWith('/onboarding');
    const isPaymentCallback = location.pathname.startsWith('/payment/callback');

    // If authenticated, finished loading, and no subscription found
    // We also check !subscriptionQuery.isFetching to avoid redirecting while a background refetch 
    // (e.g. after a mutation) is in progress.
    if (!subscriptionQuery.isLoading && 
        !subscriptionQuery.isFetching && 
        subscriptionQuery.data === null && 
        !isPublicPath && 
        !isOnboardingPath && 
        !isPaymentCallback) {
      console.log('[Subscription] No active plan found, redirecting to selection...');
      navigate('/onboarding/subscription', { replace: true });
    }
  }, [subscriptionQuery.data, subscriptionQuery.isLoading, subscriptionQuery.isFetching, location.pathname, navigate]);

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