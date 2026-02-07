import { Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFeatureName } from "@/lib/utils";
import type { SubscriptionTier } from "@/lib/api/types";

interface TierCardProps {
  tier: SubscriptionTier;
  isRecommended?: boolean;
  isCurrent?: boolean;
  isLoading?: boolean;
  onSelect: (tier: SubscriptionTier) => void;
  buttonText?: string;
  showAllFeatures?: boolean;
  compact?: boolean;
}

export const TierCard = ({
  tier,
  isRecommended = false,
  isCurrent = false,
  isLoading = false,
  onSelect,
  buttonText,
  showAllFeatures = false,
  compact = false
}: TierCardProps) => {
  const isFree = tier.name.toLowerCase() === 'free';
  const maxFeatures = showAllFeatures ? tier.features.length : (compact ? 4 : 6);

  const defaultButtonText = isFree
    ? 'Get Started'
    : isRecommended
      ? 'Upgrade Now'
      : isCurrent
        ? 'Current Plan'
        : 'Select Plan';

  return (
    <Card
      className={`relative group transition-all duration-300 h-full flex flex-col ${isCurrent
        ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-md'
        : isRecommended
          ? 'border-primary shadow-xl scale-[1.02] bg-card'
          : 'border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1'
        }`}
    >
      {isRecommended && !isCurrent && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <Badge className="text-[10px] px-2 py-0.5 shadow-sm">
            Recommended
          </Badge>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-2 right-2 z-10">
          <Badge className="text-[10px] px-2 py-0.5 bg-primary">Current</Badge>
        </div>
      )}

      <CardHeader className={`space-y-2 ${compact ? 'pb-3 pt-4 px-4' : 'pb-4 px-5 md:px-6'}`}>
        <CardTitle className={compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl font-bold'}>
          {tier.name}
        </CardTitle>
        <div className="flex items-baseline gap-1">
          <span className={compact ? 'text-xl sm:text-2xl font-bold' : 'text-3xl sm:text-4xl font-bold'}>
            ${tier.price_monthly}
          </span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>

        <CardDescription className="text-xs">
          {tier.max_profiles === -1 ? 'Unlimited' : tier.max_profiles} profile{tier.max_profiles !== 1 && 's'} • {tier.analytics_retention}d analytics
        </CardDescription>
      </CardHeader>

      <CardContent className={`space-y-4 ${compact ? 'pb-3 px-4' : 'px-5 md:px-6'}`}>
        {!isCurrent && (
          <Button
            onClick={() => onSelect(tier)}
            className={`w-full font-medium text-sm ${compact ? 'h-8' : 'h-10'}`}
            variant={isRecommended ? 'default' : 'outline'}
            size="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {buttonText || defaultButtonText}
                {!isCurrent && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
              </>
            )}
          </Button>
        )}

        <ul className="space-y-3 md:space-y-2.5">
          {tier.features.slice(0, maxFeatures).map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/90 leading-snug">
                {formatFeatureName(feature)}
              </span>
            </li>
          ))}
          {tier.features.length > maxFeatures && (
            <li className="text-xs text-muted-foreground pl-6">
              +{tier.features.length - maxFeatures} more features
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};