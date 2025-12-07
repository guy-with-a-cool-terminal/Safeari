/**
 * React Query mutation hooks for write operations
 *
 * CRITICAL: These hooks invalidate cache after successful mutations
 * Without these, users would see stale cached data after making changes!
 *
 * All mutation hooks provide:
 * - Automatic cache invalidation on success
 * - Optimistic updates (instant UI feedback)
 * - Error rollback (undo optimistic updates on failure)
 * - Loading/error states
 */

// Settings mutations
export { useUpdateParentalControls } from './useUpdateParentalControls';
export { useUpdateSecuritySettings } from './useUpdateSecuritySettings';
export { useUpdatePrivacySettings } from './useUpdatePrivacySettings';

// Custom lists mutations
export {
  useAddToAllowlist,
  useRemoveFromAllowlist,
  useAddToDenylist,
  useRemoveFromDenylist,
} from './useCustomListMutations';

// Profile mutations
export {
  useUpdateProfile,
  useDeleteProfile,
  useCreateProfile,
} from './useProfileMutations';
