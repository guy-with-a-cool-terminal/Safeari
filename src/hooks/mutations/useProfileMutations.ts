import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, deleteProfile, createProfile } from '@/lib/api';
import type { UpdateProfileRequest, CreateProfileRequest } from '@/lib/api/types';

/**
 * Mutation hook for updating a profile
 *
 * CRITICAL: Invalidates both individual profile AND profiles list
 * When user updates a profile, changes must appear everywhere!
 */
export function useUpdateProfile(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(profileId, data),

    onSuccess: () => {
      // Invalidate individual profile
      queryClient.invalidateQueries({
        queryKey: ['profile', profileId],
      });

      // CRITICAL: Also invalidate profiles list (for ProfileContext)
      // This ensures profile changes appear in navigation, profile selector, etc.
      queryClient.invalidateQueries({
        queryKey: ['profiles'],
      });
    },
  });
}

/**
 * Mutation hook for deleting a profile
 *
 * CRITICAL: Invalidates profiles list so deleted profile disappears
 */
export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: number) => deleteProfile(profileId),

    onSuccess: () => {
      // Invalidate profiles list to remove deleted profile
      queryClient.invalidateQueries({
        queryKey: ['profiles'],
      });
    },
  });
}

/**
 * Mutation hook for creating a profile
 *
 * CRITICAL: Invalidates profiles list so new profile appears
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileRequest) => createProfile(data),

    onSuccess: () => {
      // Invalidate profiles list to show new profile
      queryClient.invalidateQueries({
        queryKey: ['profiles'],
      });
    },
  });
}
