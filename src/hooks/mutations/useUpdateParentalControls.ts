import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateParentalControls } from '@/lib/api';
import type { UpdateParentalControlsRequest } from '@/lib/api/types';

/**
 * Mutation hook for updating parental control settings
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Optimistic updates (instant UI feedback)
 * - Error rollback
 *
 * @returns Mutation object with mutate function
 */
export function useUpdateParentalControls(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdateParentalControlsRequest) =>
      updateParentalControls(profileId, settings),

    // On success: invalidate cache to trigger refetch
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['parental-controls', profileId],
      });
    },

    // Optional: Optimistic update (UI updates immediately)
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['parental-controls', profileId] });

      // Snapshot current value
      const previousSettings = queryClient.getQueryData(['parental-controls', profileId]);

      // Optimistically update cache
      queryClient.setQueryData(['parental-controls', profileId], (old: any) => ({
        ...old,
        ...newSettings,
      }));

      // Return context for rollback
      return { previousSettings };
    },

    // On error: rollback to previous value
    onError: (err, newSettings, context: any) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(
          ['parental-controls', profileId],
          context.previousSettings
        );
      }
    },
  });
}
