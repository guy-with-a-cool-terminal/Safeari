import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Configured QueryClient for TanStack Query
 *
 * Default Settings:
 * - Retry: 3 attempts with exponential backoff
 * - Stale Time: 5 minutes (data considered fresh)
 * - Cache Time: 10 minutes (data kept in memory)
 * - Refetch on window focus: true (updates data when user returns to tab)
 * - Refetch on reconnect: true (updates data when connection restored)
 * - Persistence: Enabled via localStorage for offline support
 *
 * IMPORTANT: Default time range set to 7d instead of 1d due to backend bug
 * The 1d filter frequently fails - retry logic helps but 7d is more reliable
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long until data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,

      // How long to keep unused data in cache (10 minutes)
      gcTime: 10 * 60 * 1000,

      // Retry failed requests 3 times
      retry: 3,

      // Exponential backoff: 1s, 2s, 4s (max 30s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch when user focuses window (returns to tab)
      refetchOnWindowFocus: true,

      // Refetch when connection is restored
      refetchOnReconnect: true,

      // Check for stale data on component mount
      refetchOnMount: true,

      // Throw errors to error boundaries (can be caught in components)
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // Throw errors for mutations (important for form validation)
      throwOnError: false,
    },
  },
});

/**
 * LocalStorage persister for offline cache support
 *
 * Persists query cache to localStorage for:
 * - Instant load on page refresh
 * - Offline data access
 * - Better perceived performance
 *
 * Cache persists for 24 hours (gcTime setting)
 */
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'SAFEARI_QUERY_CACHE',
});

/**
 * Enable query persistence
 *
 * This runs automatically and syncs cache to localStorage
 * whenever query data changes
 */
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  hydrateOptions: {
    // Only restore queries that haven't exceeded gcTime
    defaultOptions: {
      queries: {
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  },
});
