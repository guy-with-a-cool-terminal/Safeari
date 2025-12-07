import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSecuritySettings } from '@/lib/api';
import type { UpdateSecuritySettingsRequest } from '@/lib/api/types';

/**
 * Mutation hook for updating security settings
 *
 * Automatically invalidates cache on success
 */
export function useUpdateSecuritySettings(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdateSecuritySettingsRequest) =>
      updateSecuritySettings(profileId, settings),

    onSuccess: () => {
      // Invalidate to trigger refetch with fresh data
      queryClient.invalidateQueries({
        queryKey: ['security-settings', profileId],
      });
    },

    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['security-settings', profileId] });
      const previousSettings = queryClient.getQueryData(['security-settings', profileId]);

      queryClient.setQueryData(['security-settings', profileId], (old: any) => ({
        ...old,
        ...newSettings,
      }));

      return { previousSettings };
    },

    onError: (err, newSettings, context: any) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(
          ['security-settings', profileId],
          context.previousSettings
        );
      }
    },
  });
}
