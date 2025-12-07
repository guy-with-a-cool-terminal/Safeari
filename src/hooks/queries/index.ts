/**
 * React Query hooks for data fetching
 *
 * All hooks provide:
 * - Automatic caching with configurable stale time
 * - Retry logic (3 attempts with exponential backoff)
 * - Background refetching on window focus/reconnect
 * - Request cancellation on unmount
 * - Loading/error states
 */

// Analytics hooks
export { useAnalyticsOverview } from './useAnalyticsOverview';
export { useTopDomains } from './useTopDomains';
export { useTimelineData } from './useTimelineData';
export { useQueryLogs } from './useQueryLogs';
export { useTrackerStats } from './useTrackerStats';

// Settings hooks
export { useParentalControls } from './useParentalControls';
export { useSecuritySettings } from './useSecuritySettings';
export { usePrivacySettings } from './usePrivacySettings';

// Custom lists hooks
export { useAllowlist, useDenylist } from './useCustomLists';

// Reference data & subscription hooks (long cache times - rarely change)
export { useReferenceData } from './useReferenceData';
export { useSubscriptionTiers } from './useSubscriptionTiers';
export { useCurrentSubscription } from './useCurrentSubscription';

// Profile hooks
export { useProfileData } from './useProfile';
