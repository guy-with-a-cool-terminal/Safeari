import { useState, useEffect } from 'react';
import { getSubscriptionTiers } from '@/lib/api';
import type { SubscriptionTier } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionTiers = () => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const fetchedTiers = await getSubscriptionTiers();
        setTiers(fetchedTiers);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load subscription tiers",
          description: "Please refresh the page to try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiers();
  }, [toast]);

  return { tiers, isLoading };
};