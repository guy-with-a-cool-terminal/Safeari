import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Check, Loader2, Zap, ArrowRight } from "lucide-react";
import { getSubscriptionTiers } from "@/lib/api";
import { formatFeatureName } from "@/lib/utils";
import type { SubscriptionTier } from "@/lib/api/types";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentTier: string;
  requiredTier: string;
  isRateLimit?: boolean; 
}
/**
 * Modal shown when user tries to access a locked feature
 */
const UpgradeModal = ({ open, onOpenChange, feature, currentTier, requiredTier, isRateLimit }: UpgradeModalProps) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTiers();
    }
  }, [open]);

  const fetchTiers = async () => {
    setIsLoading(true);
    try {
      const tierData = await getSubscriptionTiers();
      setTiers(tierData);
    } catch (error) {
      console.error('Failed to load subscription tiers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const current = tiers.find(t => t.id === currentTier) || tiers[0];
  const required = tiers.find(t => t.id === requiredTier) || tiers[1];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <DialogTitle className="text-2xl">
              {isRateLimit ? "Don't Miss a Moment" : "Unlock Premium Feature"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isRateLimit 
                ? `You've hit your ${currentTier === 'free' ? 'free plan' : current?.name} limit. While you're locked out, your child's online activity is going unwatched. Upgrade to ${required?.name} now to keep protecting them 24/7.`
                : `This feature requires ${required?.name} tier or higher`
              }
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feature Being Accessed - Compact */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  {isRateLimit ? "Rate Limit Reached" : "Locked Feature"}
                </p>
                <p className="font-semibold text-sm text-foreground truncate">{formatFeatureName(feature)}</p>
                {isRateLimit && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5 font-medium">
                    ⚠️ Monitoring paused until upgrade
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comparison - Compact Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Current Plan */}
            <Card className="border-border/50 bg-muted/20">
              <CardHeader className="pb-2 pt-3 px-3">
                <Badge variant="outline" className="text-[10px] w-fit mb-1">Current</Badge>
                <CardTitle className="text-sm">{current?.name || "Free"}</CardTitle>
                <p className="text-xl font-bold text-foreground">
                  ${current?.price_monthly || 0}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-2">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {current?.max_profiles === -1 ? "Unlimited" : current?.max_profiles || 1} {current?.max_profiles === 1 ? "profile" : "profiles"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{current?.analytics_retention || 1}d analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Plan */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <CardHeader className="pb-2 pt-3 px-3 relative">
                <Badge className="text-[10px] bg-primary text-primary-foreground w-fit mb-1">Required</Badge>
                <CardTitle className="text-sm">{required?.name || "Basic"}</CardTitle>
                <p className="text-xl font-bold text-primary">
                  ${required?.price_monthly || 5}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="px-3 pb-3 pt-2 relative">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-primary" />
                    </div>
                    <span className="font-medium">
                      {required?.max_profiles === -1 ? "Unlimited" : required?.max_profiles || 3} profiles
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-primary" />
                    </div>
                    <span className="font-medium">{required?.analytics_retention || 7}d analytics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="font-medium text-primary">Access unlocked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 text-sm"
          >
            Not Now
          </Button>
          <Link to="/account/subscription" onClick={() => onOpenChange(false)} className="flex-1">
            <Button className="w-full h-10 text-sm font-semibold">
              {isRateLimit ? "Unlock Protection Now" : "Upgrade Now"}
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;