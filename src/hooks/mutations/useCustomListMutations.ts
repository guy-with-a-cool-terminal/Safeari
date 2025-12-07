import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addToAllowlist,
  removeFromAllowlist,
  addToDenylist,
  removeFromDenylist,
} from '@/lib/api';

/**
 * Mutation hooks for custom lists (allowlist/denylist)
 *
 * Critical: These MUST invalidate cache so users see their changes!
 * When user adds a domain, they need to see it immediately
 */

export function useAddToAllowlist(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domains: string[]) => addToAllowlist(profileId, domains),

    onSuccess: () => {
      // Invalidate allowlist to show new domains
      queryClient.invalidateQueries({
        queryKey: ['allowlist', profileId],
      });
    },

    // Optimistic update: add domains immediately
    onMutate: async (newDomains) => {
      await queryClient.cancelQueries({ queryKey: ['allowlist', profileId] });
      const previous = queryClient.getQueryData(['allowlist', profileId]);

      queryClient.setQueryData(['allowlist', profileId], (old: any) => ({
        ...old,
        domains: [
          ...(old?.domains || []),
          ...newDomains.map(id => ({ id, active: true })),
        ],
      }));

      return { previous };
    },

    onError: (err, newDomains, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['allowlist', profileId], context.previous);
      }
    },
  });
}

export function useRemoveFromAllowlist(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domains: string[]) => removeFromAllowlist(profileId, domains),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['allowlist', profileId],
      });
    },

    onMutate: async (domainsToRemove) => {
      await queryClient.cancelQueries({ queryKey: ['allowlist', profileId] });
      const previous = queryClient.getQueryData(['allowlist', profileId]);

      queryClient.setQueryData(['allowlist', profileId], (old: any) => ({
        ...old,
        domains: old?.domains?.filter((d: any) => !domainsToRemove.includes(d.id)) || [],
      }));

      return { previous };
    },

    onError: (err, domains, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['allowlist', profileId], context.previous);
      }
    },
  });
}

export function useAddToDenylist(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domains: string[]) => addToDenylist(profileId, domains),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['denylist', profileId],
      });
    },

    onMutate: async (newDomains) => {
      await queryClient.cancelQueries({ queryKey: ['denylist', profileId] });
      const previous = queryClient.getQueryData(['denylist', profileId]);

      queryClient.setQueryData(['denylist', profileId], (old: any) => ({
        ...old,
        domains: [
          ...(old?.domains || []),
          ...newDomains.map(id => ({ id, active: true })),
        ],
      }));

      return { previous };
    },

    onError: (err, newDomains, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['denylist', profileId], context.previous);
      }
    },
  });
}

export function useRemoveFromDenylist(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domains: string[]) => removeFromDenylist(profileId, domains),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['denylist', profileId],
      });
    },

    onMutate: async (domainsToRemove) => {
      await queryClient.cancelQueries({ queryKey: ['denylist', profileId] });
      const previous = queryClient.getQueryData(['denylist', profileId]);

      queryClient.setQueryData(['denylist', profileId], (old: any) => ({
        ...old,
        domains: old?.domains?.filter((d: any) => !domainsToRemove.includes(d.id)) || [],
      }));

      return { previous };
    },

    onError: (err, domains, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['denylist', profileId], context.previous);
      }
    },
  });
}
