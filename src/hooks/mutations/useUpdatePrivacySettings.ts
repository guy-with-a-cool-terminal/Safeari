import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePrivacySettings } from '@/lib/api';
import type { UpdatePrivacySettingsRequest } from '@/lib/api/types';

/**
 * Mutation hook for updating privacy settings
 *
 * Automatically invalidates cache on success
 */
export function useUpdatePrivacySettings(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpdatePrivacySettingsRequest) =>
      updatePrivacySettings(profileId, settings),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['privacy-settings', profileId],
      });
    },

    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['privacy-settings', profileId] });
      const previousSettings = queryClient.getQueryData(['privacy-settings', profileId]);

      queryClient.setQueryData(['privacy-settings', profileId], (old: any) => ({
        ...old,
        ...newSettings,
      }));

      return { previousSettings };
    },

    onError: (err, newSettings, context: any) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(
          ['privacy-settings', profileId],
          context.previousSettings
        );
      }
    },
  });
}
