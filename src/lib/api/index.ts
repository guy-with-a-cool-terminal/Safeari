// Main API exports - single import point for all API functions
export {
  login,
  register,
  refreshToken,
  logout,
  isAuthenticated
} from './auth';

export {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  patchProfile,
  deleteProfile
} from './profiles';

export {
  getParentalControls,
  updateParentalControls,
  getRecreationSchedule,
  updateRecreationSchedule,
  getSecuritySettings,
  updateSecuritySettings,
  getPrivacySettings,
  updatePrivacySettings
} from './settings';

export {
  getAllowlist,
  addToAllowlist,
  removeFromAllowlist,
  getDenylist,
  addToDenylist,
  removeFromDenylist
} from './lists';

export {
  getAnalyticsOverview,
  getTopDomains,
  getDeviceStats,
  getTimelineData,
  getTrackerStats,
  getQueryLogs,
  getExportLogs
} from './analytics';

export {
  getNextDNSDetails,
  getReferenceData
} from './utils';

export {
  getSubscriptionTiers,
  getCurrentSubscription,
  createSubscription,
  cancelSubscription,
  cancelPendingSubscription
} from './subscriptions';

export { default as apiClient } from './client';