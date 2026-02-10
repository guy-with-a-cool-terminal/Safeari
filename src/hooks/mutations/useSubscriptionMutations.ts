import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createSubscription,
    cancelSubscription,
    cancelPendingSubscription,
    type CreateSubscriptionRequest,
    type CreateSubscriptionResponse,
    type Subscription
} from '@/lib/api/subscriptions';

/**
 * Mutation hook for creating a new subscription
 * 
 * Automatically invalidates:
 * - Current subscription query
 * - Profiles query (max_profiles may change)
 */
export function useCreateSubscription() {
    const queryClient = useQueryClient();

    return useMutation<CreateSubscriptionResponse, Error, CreateSubscriptionRequest>({
        mutationFn: createSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['subscription', 'current'],
            });
            queryClient.invalidateQueries({
                queryKey: ['profiles'],
            });
        },
    });
}

/**
 * Mutation hook for canceling an active subscription
 * 
 * Automatically invalidates:
 * - Current subscription query
 * - Profiles query (max_profiles will change after period ends)
 */
export function useCancelSubscription() {
    const queryClient = useQueryClient();

    return useMutation<Subscription, Error, string>({
        mutationFn: (subscriptionId: string) => cancelSubscription(subscriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['subscription', 'current'],
            });
            queryClient.invalidateQueries({
                queryKey: ['profiles'],
            });
        },
    });
}

/**
 * Mutation hook for canceling a pending subscription upgrade
 * 
 * Automatically invalidates:
 * - Current subscription query (restores previous subscription)
 */
export function useCancelPendingSubscription() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean; message: string }, Error, void>({
        mutationFn: cancelPendingSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['subscription', 'current'],
            });
        },
    });
}
