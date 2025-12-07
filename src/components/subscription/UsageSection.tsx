import { useEffect, useState } from "react";
import { getUsageSummary, UsageSummary } from "@/lib/api/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, Activity, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const UsageSection = () => {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await getUsageSummary();
        setUsage(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load usage data",
          description: error.response?.data?.error || "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [toast]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Track your current usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const profilesUsed = usage.usage.profiles_created;
  const profilesLimit = usage.limits.profiles;
  const profilesPercent = profilesLimit === -1 ? 0 : (profilesUsed / profilesLimit) * 100;
  const profilesText = profilesLimit === -1 ? `${profilesUsed} / Unlimited` : `${profilesUsed} / ${profilesLimit}`;
  
  // Determine warning states
  const isProfilesWarning = profilesLimit !== -1 && profilesPercent >= 80;
  const isProfilesCritical = profilesLimit !== -1 && profilesPercent >= 95;
  
  const getProgressColor = (percent: number, isUnlimited: boolean) => {
    if (isUnlimited) return "";
    if (percent >= 95) return "bg-destructive";
    if (percent >= 80) return "bg-yellow-500";
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage & Limits</CardTitle>
        <CardDescription>
          Current billing period: {format(new Date(usage.billing_period.start), 'MMM dd')} - {format(new Date(usage.billing_period.end), 'MMM dd, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Alert */}
        {(isProfilesWarning || isProfilesCritical) && (
          <Alert variant={isProfilesCritical ? "destructive" : "default"} className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-sm">
                {isProfilesCritical 
                  ? "You've used most of your profile limit. Upgrade to create more profiles."
                  : "You're approaching your profile limit. Consider upgrading your plan."
                }
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate("/account/subscription")}
                className="shrink-0"
              >
                Upgrade Plan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Profiles Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Profiles Created</span>
            </div>
            <span className="text-sm font-semibold">{profilesText}</span>
          </div>
          {profilesLimit !== -1 && (
            <div className="space-y-1">
              <Progress value={profilesPercent} className="h-2" indicatorClassName={getProgressColor(profilesPercent, false)} />
              {isProfilesWarning && (
                <p className={`text-xs font-medium ${isProfilesCritical ? 'text-destructive' : 'text-yellow-600'}`}>
                  {isProfilesCritical ? 'Critical: ' : 'Warning: '}
                  {Math.round(profilesPercent)}% of limit used
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {profilesLimit === -1 
              ? "You have unlimited profile creation"
              : `${profilesLimit - profilesUsed} profile${profilesLimit - profilesUsed === 1 ? '' : 's'} remaining`
            }
          </p>
        </div>

        {/* API Calls Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">API Requests</span>
            </div>
            <span className="text-sm font-semibold">
              {usage.usage.api_calls.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total API requests this billing period
          </p>
        </div>

        {/* Tier Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Current plan: <span className="font-semibold text-foreground capitalize">{usage.tier}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
