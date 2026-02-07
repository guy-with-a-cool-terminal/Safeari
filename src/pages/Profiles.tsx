import { useState, useEffect, useMemo } from "react";
import { Plus, Shield, Router, Users, Settings, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import CreateProfileDialog from "@/components/profile/CreateProfileDialog";
import UpgradeModal from "@/components/modals/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { Profile } from "@/lib/api/types";
import { GlobalNav } from "@/components/navigation/GlobalNav";
import { OnboardingTooltip } from "@/components/onboarding/OnboardingTooltip";
import { useOnboardingTour, TOUR_PRIORITIES } from "@/components/onboarding/useOnboardingTour";
import SafeariLogo from "@/assets/favicon.svg";

const Profiles = () => {
  const { profiles, refreshProfiles, setCurrentProfile } = useProfile();
  const { data: referenceData, isLoading: referenceLoading } = useReferenceData();
  const { subscription, subscriptionTier, isLoading: subscriptionLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Onboarding tour - simplified to 1 essential step
  const profilesTour = useOnboardingTour({
    tourId: 'profiles-page',
    totalSteps: 1,
    autoStart: true,
    priority: TOUR_PRIORITIES.FIRST_VISIT,
  });

  const tourSteps = [
    {
      title: "Family Profiles",
      message: "Create profiles for each family member with age-appropriate protection settings."
    },
  ];

  // Get age preset labels from reference data
  const getAgePresetLabel = (presetKey: string) => {
    if (!referenceData?.age_presets) return "Custom Settings";

    const preset = referenceData.age_presets[presetKey as keyof typeof referenceData.age_presets];
    return preset?.name || "Custom Settings";
  };

  // Computed values using real subscription tier data
  const profileStats = useMemo(() => {
    // Get max_profiles from actual subscription tier data, not hardcoded limits
    const maxProfiles = subscriptionTier?.max_profiles ?? 1;
    const used = profiles?.length || 0;
    const canCreate = maxProfiles === -1 || used < maxProfiles;
    const displayText = maxProfiles === -1 ? 'Unlimited' : `${used}/${maxProfiles}`;
    const usagePercent = maxProfiles === -1 ? 0 : (used / maxProfiles) * 100;
    const available = maxProfiles === -1 ? Infinity : maxProfiles - used;

    return { used, canCreate, displayText, usagePercent, available, maxProfiles };
  }, [profiles?.length, subscriptionTier?.max_profiles]);

  // Optimistic profile creation
  const handleProfileCreated = async (profile: Profile) => {
    // Optimistic UI: Show DNS setup immediately
    setCreateDialogOpen(false);

    toast({
      title: "🎉 Profile Created!",
      description: `Preparing setup instructions for ${profile.display_name}'s Device.`,
    });

    // Refresh profiles in background
    try {
      await refreshProfiles();
    } catch (error) {
      console.error('Background refresh failed:', error);
      // Don't show error toast - optimistic UI already succeeded
    }
  };

  const handleViewDashboard = (profile: Profile) => {
    setCurrentProfile(profile);
  };

  // Show loading state
  if (subscriptionLoading || referenceLoading) {
    return (
      <>
        <GlobalNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-muted/50 rounded-full blur-xl animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-card flex items-center justify-center mx-auto p-3 border border-border/50">
                <img src={SafeariLogo} alt="Safeari" className="w-full h-full" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xl font-semibold text-foreground">Loading your profiles</p>
              <p className="text-muted-foreground">Setting up your family protection dashboard...</p>
              <div className="flex justify-center gap-1 pt-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const hasProfiles = profiles && profiles.length > 0;

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-background p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with Upgrade Link */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                <div className="relative h-16 w-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Family Profiles
                </h1>
                {subscription?.tier === 'free' && (
                  <Link to="/account/subscription">
                  </Link>
                )}
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Create and manage protection settings for each family member
              </p>
            </div>
          </div>

          {/* Usage Stats with Upgrade Prompt */}
          <Card className={`bg-card border shadow-sm relative ${!profileStats.canCreate ? 'border-amber-500/30 bg-amber-500/5' : ''}`} id="profile-stats">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Profile Usage</span>
                    <Badge variant="outline" className="text-xs">
                      {subscription?.tier
                        ? `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}`
                        : 'Free'}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{profileStats.displayText}</p>
                  {!profileStats.canCreate && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-600 font-medium">Profile limit reached</p>
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <Progress value={profileStats.usagePercent} className="w-32 h-2" />
                  <p className="text-xs text-muted-foreground">
                    {profileStats.canCreate
                      ? `${profileStats.available === Infinity ? 'Unlimited' : `${profileStats.available} available`}`
                      : 'Limit reached'}
                  </p>
                  {!profileStats.canCreate && (
                    <Link to="/account/subscription">
                      <Button variant="outline" size="sm" className="h-7 text-xs mt-2">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {!hasProfiles && (
            <>
              {/* Welcome tooltip for empty state */}
              {profilesTour.isActive && profilesTour.currentStep === 1 && (
                <div className="fixed top-16 left-4 right-4 md:top-20 md:left-1/2 md:-translate-x-1/2 md:right-auto z-50 w-auto md:w-80">
                  <OnboardingTooltip
                    title={tourSteps[0].title}
                    message={tourSteps[0].message}
                    step={profilesTour.currentStep}
                    totalSteps={profilesTour.totalSteps}
                    position="bottom"
                    onNext={profilesTour.nextStep}
                    onSkip={profilesTour.skipTour}
                    onClose={profilesTour.skipTour}
                  />
                </div>
              )}

              <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent relative" id="create-profile-card">
                <CardContent className="pt-16 pb-16 text-center">
                  <div className="max-w-md mx-auto space-y-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-muted/30 rounded-full blur-2xl" />
                      <div className="relative h-28 w-28 mx-auto bg-card rounded-full flex items-center justify-center p-4 border-2 border-border/50">
                        <img src={SafeariLogo} alt="Safeari" className="w-full h-full" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-foreground">Start Protecting Your Family</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Create your first profile to begin blocking harmful content, tracking screen time, and keeping your family safe online.
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                      <Button
                        onClick={() => setCreateDialogOpen(true)}
                        size="lg"
                        className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="h-6 w-6 mr-2" />
                        Create First Profile
                      </Button>
                      <Link to="/account/subscription" className="inline-block">
                        <p className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {subscription?.tier ? `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} tier` : 'Free tier'} • <span className="underline">Upgrade for more profiles</span>
                        </p>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Profiles Grid */}
          {hasProfiles && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Your Profiles ({profiles.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {profiles.map((profile, index) => {
                  const presetLabel = getAgePresetLabel(profile.age_preset);
                  const isFirstProfile = index === 0;
                  /* Phase 1: Each profile gets a distinct color */
                  const profileColorIndex = (index % 5) + 1;
                  const profileColorVar = `--profile-${profileColorIndex}`;

                  return (
                    <Card
                      key={profile.id}
                      className="group hover:shadow-lg transition-all duration-300 border bg-card relative border-l-4"
                      style={{ borderLeftColor: `hsl(var(${profileColorVar}))` }}
                      id={isFirstProfile ? "first-profile-card" : undefined}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Phase 1: Profile avatar with assigned color */}
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: `hsl(var(${profileColorVar}) / 0.15)`,
                              }}
                            >
                              <Users
                                className="h-5 w-5"
                                style={{ color: `hsl(var(${profileColorVar}))` }}
                              />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-lg truncate text-foreground" title={profile.display_name}>
                                {profile.display_name}
                              </CardTitle>
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {presetLabel}
                                </Badge>
                                {profile.is_router_level && (
                                  <Badge variant="outline" className="text-xs">
                                    <Router className="h-3 w-3 mr-1" />
                                    Router
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pb-4">
                        <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">Profile ID</span>
                          <code className="font-mono text-xs bg-background px-2 py-1 rounded border">
                            {profile.nextdns_profile_id}
                          </code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge
                            variant={profile.is_active ? "default" : "secondary"}
                            className={profile.is_active ? "bg-green-500/10 text-green-700 hover:bg-green-500/10" : ""}
                          >
                            {profile.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Link
                          to={`/dashboard?profile=${profile.id}`}
                          className="w-full"
                          onClick={() => handleViewDashboard(profile)}
                        >
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Protection
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}

                {/* Add Profile Card */}
                {profileStats.canCreate && (
                  <Card
                    className="border-2 border-dashed border-primary/40 cursor-pointer hover:border-primary hover:bg-primary/5 hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-primary/5 to-transparent"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] space-y-6 p-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative h-20 w-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                          <Plus className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="font-bold text-xl text-foreground">Add Family Member</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Create customized protection for another family member or device
                        </p>
                      </div>
                      <Button variant="outline" size="lg" className="mt-4 border-2 group-hover:border-primary group-hover:bg-primary/10 transition-all">
                        <Plus className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Upgrade Prompt */}
          {!profileStats.canCreate && profileStats.maxProfiles !== -1 && (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-amber-700">Ready for More?</h4>
                    <p className="text-amber-600 text-sm">
                      You've reached the profile limit on your {subscription?.tier || 'current'} plan.
                      Upgrade to protect more family members and devices.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10 flex-shrink-0"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialogs */}
        <CreateProfileDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onProfileCreated={handleProfileCreated}
        />

        {/* Upgrade Modal */}
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          feature="Additional Profiles"
          currentTier={subscription?.tier || 'free'}
          requiredTier={subscription?.tier === "free" ? "basic" : subscription?.tier === "basic" ? "family" : "premium"}
        />
      </div>
    </>
  );
};

export default Profiles;