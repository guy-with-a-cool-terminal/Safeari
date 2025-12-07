import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, AlertTriangle, TrendingUp, Calendar, Zap, CreditCard, Sparkles } from "lucide-react";
import { formatFeatureName } from "@/lib/utils";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { UpgradeWarningDialog } from "@/components/subscription/UpgradeWarningDialog";
import { GlobalNav } from "@/components/navigation/GlobalNav";
import { TierCard } from "@/components/subscription/TierCard";
import { useSubscriptionTiers } from "@/hooks/useSubscriptionTiers";
import { usePaystack } from "@/hooks/usePaystack";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCurrentSubscription, cancelSubscription, cancelPendingSubscription } from "@/lib/api";
import type { Subscription, SubscriptionTier } from "@/lib/api/types";

const AccountSubscription = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPendingUpgrade, setIsPendingUpgrade] = useState(false);
  const [isCancellingPending, setIsCancellingPending] = useState(false);
  const { tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTierForUpgrade, setSelectedTierForUpgrade] = useState<string>("");
  const [showUpgradeWarning, setShowUpgradeWarning] = useState(false);
  const [pendingTierChange, setPendingTierChange] = useState<SubscriptionTier | null>(null);

  usePaystack();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
  try {
    const subData = await getCurrentSubscription();
    setSubscription(subData);
    setIsPendingUpgrade(false);
  } catch (error: any) {
    // If 404, check if there's a pending upgrade
    if (error.response?.status === 404) {
      setIsPendingUpgrade(true);
      setSubscription(null);
    } else {
      toast({
        variant: "destructive",
        title: "Failed to load subscription",
        description: "Please refresh the page to try again"
      });
    }
  } finally {
    setIsLoading(false);
  }
};

  const loadData = async () => {
    await loadSubscription();
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      await cancelSubscription(subscription.id);
      toast({
        title: "Subscription Canceled",
        description: `Your subscription will remain active until ${new Date(subscription.current_period_end).toLocaleDateString()}`,
      });
      setCancelDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to cancel",
        description: "Please try again"
      });
    }
  };

  const handleCancelPending = async () => {
  setIsCancellingPending(true);
  try {
    await cancelPendingSubscription();
    toast({
      title: "Upgrade Cancelled",
      description: "You've been restored to your previous subscription.",
    });
    await loadSubscription();
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Failed to cancel",
      description: "Please try again or wait 10-15 minutes for automatic reversion."
    });
  } finally {
    setIsCancellingPending(false);
  }
};

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (subscription?.status !== 'active' && subscription?.tier !== 'free') {
      toast({
        variant: "destructive",
        title: "Subscription Inactive",
        description: "Your current subscription must be active to change plans.",
      });
      return;
    }

    if (tier.name.toLowerCase() === 'free') {
      toast({
        title: "Already on Free Plan",
        description: "You're currently on the free plan.",
      });
      return;
    }

    setPendingTierChange(tier);
    setShowUpgradeWarning(true);
  };

  const confirmTierChange = () => {
    if (!pendingTierChange) return;
    
    setSelectedTierForUpgrade(pendingTierChange.name);
    setShowUpgradeWarning(false);
    setShowPaymentModal(true);
  };

  if (isLoading || tiersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    if (isPendingUpgrade) {
      return (
        <>
          <GlobalNav />
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-500/10">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">Payment Pending</CardTitle>
                    <CardDescription>
                      Complete your payment to activate your new subscription
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border space-y-2">
                  <p className="text-sm font-medium">What's happening?</p>
                  <ul className="text-sm text-muted-foreground space-y-1.5 ml-4">
                    <li>• Your payment window is still open</li>
                    <li>• Your previous subscription is on hold</li>
                    <li>• Complete payment to activate your new plan</li>
                    <li>• Or cancel to return to your previous subscription</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelPending}
                    disabled={isCancellingPending}
                    className="flex-1"
                  >
                    {isCancellingPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Upgrade'
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate('/onboarding/subscription')}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  If you don't complete payment, we'll automatically restore your previous subscription in 10-15 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-6">
        <div className="text-center space-y-3">
          <CreditCard className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">No Active Subscription</h2>
          <p className="text-muted-foreground max-w-md">
            Choose a plan to unlock premium features and protect your family online
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('/onboarding/subscription')}>
          View Plans
        </Button>
      </div>
    );
  }

const tierNames: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  family: "Family",
  premium: "Premium"
};

const currentTierData = tiers.find(t => t.id === subscription.tier);
const tierOrder = ['free', 'basic', 'family', 'premium'];
const currentTierIndex = tierOrder.indexOf(subscription.tier);

const isDowngrade = (tier: SubscriptionTier) => {
  const tierIndex = tierOrder.indexOf(tier.id);
  return tierIndex < currentTierIndex;
};

  return (
    <>
      <GlobalNav />
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Subscription</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Manage your protection plan and billing</p>
        </div>

        <Card className="border-primary/30 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl sm:text-2xl">{tierNames[subscription.tier]}</CardTitle>
                  <Badge className="text-xs px-2 py-0.5" variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status === 'active' ? 'Active' : subscription.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm">Your current protection plan</CardDescription>
              </div>
              {subscription.tier !== 'free' && (
                <div className="flex flex-col items-start sm:items-end gap-0.5">
                  <span className="text-xl sm:text-2xl font-bold">${currentTierData?.price_monthly || 0}</span>
                  <span className="text-xs text-muted-foreground">per month</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pb-4">
            {currentTierData?.features && (
              <div className="grid gap-2 sm:gap-2.5 grid-cols-1 sm:grid-cols-2">
                {currentTierData.features.slice(0, 6).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium">{formatFeatureName(feature)}</span>
                  </div>
                ))}
                {currentTierData.features.length > 6 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">+{currentTierData.features.length - 6} more features</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-3 p-3 rounded-lg bg-background/80 border border-border/40">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Billing Period</p>
                  <p className="text-xs font-semibold truncate">
                    {new Date(subscription.current_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Next Billing</p>
                  <p className="text-xs font-semibold">
                    {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="text-xs font-semibold capitalize">{subscription.status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Other Plans</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding/subscription')} className="text-xs h-8">
              View All Details
            </Button>
          </div>
          
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const isCurrent = tier.id === subscription.tier;
              const isRecommended = tier.name === 'Family' && !isCurrent;
              
              return (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isRecommended={isRecommended}
                  isCurrent={isCurrent}
                  onSelect={handleUpgrade}
                  buttonText={tier.price_monthly > (currentTierData?.price_monthly || 0) ? 'Upgrade Now' : 'Switch Plan'}
                  compact={true}
                />
              );
            })}
          </div>
        </div>

        {subscription.status === 'active' && subscription.tier !== 'free' && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
                <AlertTriangle className="h-5 w-5" />
                Cancel Subscription
              </CardTitle>
              <CardDescription className="text-sm">
                End your subscription - you'll lose access to premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
                size="default"
                className="w-full sm:w-auto"
              >
                Cancel My Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Your subscription will remain active until {new Date(subscription.current_period_end).toLocaleDateString()}. 
                After that, you'll be downgraded to the Free tier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-4">
              <p className="text-sm font-medium">You will lose:</p>
              <ul className="text-sm text-muted-foreground space-y-1.5 ml-4">
                <li>• Additional profiles beyond 1</li>
                <li>• Extended analytics history</li>
                <li>• Advanced parental controls</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Keep Subscription</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelSubscription} 
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTierForUpgrade("");
          }}
          tierName={selectedTierForUpgrade}
          onSuccess={() => {
            loadData();
            toast({
              title: "Subscription Updated",
              description: "Your subscription has been updated successfully.",
            });
          }}
        />

        {pendingTierChange && (
          <UpgradeWarningDialog
            open={showUpgradeWarning}
            onOpenChange={setShowUpgradeWarning}
            onConfirm={confirmTierChange}
            currentTier={currentTierData}
            newTier={pendingTierChange}
            isDowngrade={isDowngrade(pendingTierChange)}
          />
        )}
      </div>
    </>
  );
};

export default AccountSubscription;