import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { Profile } from "@/lib/api/types";
import DNSSetupDialog from "./DNSSetupDialog";
import UpgradeModal from "@/components/modals/UpgradeModal";
import { AlertCircle, Shield, Router, Smartphone, Tablet, Monitor, Gamepad2, CheckCircle2, ArrowRight, ArrowLeft, Info } from "lucide-react";
import SafeariLogo from "@/assets/favicon.svg";

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreated: (profile: Profile) => void;
}

// Age ranges for preset recommendations - single source of truth
const AGE_PRESET_RANGES = {
  young_kids: { min: 0, max: 7 },
  tweens: { min: 8, max: 12 },
  teens: { min: 13, max: 17 },
} as const;

const CreateProfileDialog = ({ open, onOpenChange, onProfileCreated }: CreateProfileDialogProps) => {
  /* Phase 2: Multi-step wizard state */
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [agePreset, setAgePreset] = useState<string>("");
  const [devices, setDevices] = useState<string[]>([]);
  const [routerLevel, setRouterLevel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDNSSetup, setShowDNSSetup] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<Profile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  const { data: referenceData, isLoading: referenceLoading } = useReferenceData();
  const { profiles, addProfileOptimistically } = useProfile();
  const { subscription, subscriptionTier } = useSubscription();

  const profileLimit = subscriptionTier?.max_profiles ?? 1;
  const profileCount = profiles?.length || 0;
  const currentTier = subscription?.tier || 'free';
  const isLimitReached = profileLimit !== -1 && profileCount >= profileLimit;

  useEffect(() => {
    if (!open) {
      setStep(1);
      setName("");
      setAge("");
      setAgePreset("");
      setDevices([]);
      setRouterLevel(false);
    }
  }, [open]);

  const agePresetOptions = useMemo(() => {
    if (!referenceData?.age_presets) return [];
    
    return Object.entries(referenceData.age_presets).map(([key, config]) => ({
      value: key,
      label: config.name,
      description: config.description,
    }));
  }, [referenceData]);

  const selectedPresetConfig = useMemo(() => {
    if (!agePreset || !referenceData?.age_presets) return null;
    return referenceData.age_presets[agePreset as keyof typeof referenceData.age_presets];
  }, [agePreset, referenceData]);

  const suggestedPreset = useMemo(() => {
    try {
      if (!age || isNaN(Number(age))) return null;
      const ageNum = Number(age);
      if (ageNum <= 0) return null;

      // Find matching preset based on age ranges
      for (const [preset, range] of Object.entries(AGE_PRESET_RANGES)) {
        if (ageNum >= range.min && ageNum <= range.max) {
          return preset as 'young_kids' | 'tweens' | 'teens';
        }
      }

      // If age is above all defined ranges, suggest custom
      return 'custom';
    } catch {
      return null;
    }
  }, [age]);

  const protectionSummary = useMemo(() => {
    if (!selectedPresetConfig) return null;

    if (agePreset === 'custom'){
      return {isCustom: true};
    }

    const securityCount = Object.values(selectedPresetConfig.security).filter(Boolean).length;
    const servicesBlocked = selectedPresetConfig.parental_control?.services?.length || 0;
    const categoriesBlocked = selectedPresetConfig.parental_control?.categories?.length || 0;
    const blocklistsActive = selectedPresetConfig.privacy?.blocklists?.length || 0;

    return {
      isCustom: false,
      security: securityCount,
      safeSearch: selectedPresetConfig.parental_control?.safeSearch,
      youtubeRestricted: selectedPresetConfig.parental_control?.youtubeRestrictedMode,
      services: servicesBlocked,
      categories: categoriesBlocked,
      blocklists: blocklistsActive,
    };
  }, [agePreset, selectedPresetConfig]);

  /* Phase 2: Wizard navigation */
  const toggleDevice = (device: string) => {
    setDevices(prev =>
      prev.includes(device)
        ? prev.filter(d => d !== device)
        : [...prev, device]
    );
  };

  const canProceedToStep2 = name.trim().length > 0;
  const canProceedToStep3 = agePreset.length > 0;
  const canProceedToStep4 = true; // Devices are optional

  const nextStep = () => {
    if (step === 1 && !canProceedToStep2) {
      toast({
        title: "Just need a name",
        description: "Please enter a name to continue",
      });
      return;
    }
    if (step === 2 && !canProceedToStep3) {
      toast({
        title: "Almost there",
        description: "Please pick a protection level to continue",
      });
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
      onOpenChange(false);
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Just need a name",
        description: "Please enter a name for this profile",
      });
      return;
    }

    if (!agePreset) {
      toast({
        title: "Almost there",
        description: "Please select a protection level",
      });
      return;
    }

    setIsLoading(true);

    const profileData = {
      display_name: name.trim(),
      age_preset: agePreset as "young_kids" | "tweens" | "teens" | "custom",
      is_router_level: routerLevel,
    };

    try {
      const realProfile = await addProfileOptimistically(profileData);

      toast({
        title: "✅ Profile created successfully",
        description: `${name.trim()}'s protection is ready! Let's set up their devices.`,
      });

      setCreatedProfile(realProfile);
      onOpenChange(false);
      setShowDNSSetup(true);
      onProfileCreated(realProfile);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "Something went wrong. Please try again.";

      // If it's a profile limit error, show upgrade modal
      if (errorMessage.toLowerCase().includes('tier limit') || errorMessage.toLowerCase().includes('profile limit')) {
        setShowUpgradeModal(true);
      }

      toast({
        variant: "destructive",
        title: "Couldn't create profile",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* Phase 2: Wizard step titles - gentle, conversational tone */
  const stepTitles = [
    "Who are you protecting?",
    "Pick a protection level",
    "Which devices do they use?",
    "Ready to get started!"
  ];

  const deviceOptions = [
    { id: 'phone', name: 'Phone', icon: Smartphone },
    { id: 'tablet', name: 'Tablet', icon: Tablet },
    { id: 'computer', name: 'Computer', icon: Monitor },
    { id: 'gaming', name: 'Gaming Console', icon: Gamepad2 },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center flex-shrink-0 p-2 border border-border/50">
                <img src={SafeariLogo} alt="Safeari" className="w-full h-full" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">{stepTitles[step - 1]}</DialogTitle>
                <DialogDescription className="text-sm">
                  Step {step} of 4 — No rush, you can change anything later
                </DialogDescription>
              </div>
            </div>
            {/* Phase 2: Progress indicator */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </DialogHeader>

          {isLimitReached && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-900 text-sm">Profile Limit Reached</p>
                    <p className="text-sm text-amber-700">
                      You're on the <strong>{currentTier}</strong> plan ({profileLimit} {profileLimit === 1 ? 'profile' : 'profiles'}).
                      Upgrade to protect more family members.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 2: Multi-step wizard content */}
          <div className="space-y-6 py-4">
            {/* Step 1: Name + Age - conversational and inclusive */}
            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  This could be your child, partner, parent, or anyone else you want to protect online.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-sm font-medium">What's their name?</Label>
                  <Input
                    id="profile-name"
                    placeholder="e.g., Emma, Jake, Mom, Dad..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading || isLimitReached}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    className="py-5"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-age" className="text-sm font-medium">How old are they? (optional)</Label>
                  <Input
                    id="profile-age"
                    type="number"
                    placeholder="e.g., 7, 14, 42..."
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isLoading || isLimitReached}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    className="py-5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps us suggest age-appropriate settings in the next step
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Protection Presets - Visual Cards */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {suggestedPreset ? `Based on the age you entered, we recommend starting with the preset below — but feel free to choose any that fits best` : `Pick a starting point — you can customize everything later`}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {agePresetOptions?.map((preset) => {
                    const isRecommended = suggestedPreset === preset.value;
                    return (
                      <Card
                        key={preset.value}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          agePreset === preset.value
                            ? 'border-primary border-2 bg-primary/5'
                            : isRecommended
                            ? 'border-primary/60 border-2 bg-primary/5'
                            : 'border hover:border-primary/50'
                        }`}
                        onClick={() => setAgePreset(preset.value)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-base">{preset.label}</div>
                                {isRecommended && age && (
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                    Recommended for age {age}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{preset.description}</p>
                            </div>
                            {agePreset === preset.value && (
                              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Device Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which devices they use, or skip this step if you're not sure
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {deviceOptions.map((device) => {
                    const Icon = device.icon;
                    const isSelected = devices.includes(device.id);
                    return (
                      <Card
                        key={device.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-primary border-2 bg-primary/5'
                            : 'border hover:border-primary/50'
                        }`}
                        onClick={() => toggleDevice(device.id)}
                      >
                        <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3">
                          <Icon className={`h-10 w-10 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{device.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary absolute top-2 right-2" />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Router className="h-4 w-4 text-primary" />
                          <Label htmlFor="router-level" className="cursor-pointer font-medium">
                            Router-Level Protection (optional)
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Apply these settings to all devices on your home WiFi — great if you're not sure which devices to track
                        </p>
                      </div>
                      <Switch
                        id="router-level"
                        checked={routerLevel}
                        onCheckedChange={setRouterLevel}
                        disabled={isLoading || isLimitReached}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Review & Confirm - gentle, reassuring tone */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {name.trim() ? `Here's what we've set up for ${name.trim()}` : "Here's what we've set up"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Don't worry, nothing is set in stone — you can adjust everything whenever you like
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  {name.trim() && (
                    <div className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="font-medium text-sm">Name</div>
                        <div className="text-sm text-muted-foreground">
                          {name.trim()}{age && `, ${age} years old`}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
                    <div>
                      <div className="font-medium text-sm">Protection Level</div>
                      <div className="text-sm text-muted-foreground">
                        {agePresetOptions.find(p => p.value === agePreset)?.label}
                      </div>
                    </div>
                  </div>
                  {devices.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="font-medium text-sm">Devices</div>
                        <div className="text-sm text-muted-foreground">
                          {devices.map(d => deviceOptions.find(opt => opt.id === d)?.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                  {routerLevel && (
                    <div className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="font-medium text-sm">Router-Level Protection</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically works on all home devices
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-2">What happens when you click Create?</p>
                      <ul className="space-y-1 text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>We'll set up the profile with these initial settings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>You'll get simple setup instructions for their devices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>You can fine-tune everything in the dashboard</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Phase 2: Wizard navigation buttons */}
          <DialogFooter className="gap-2 mt-6">
            {step > 1 && step < 4 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={nextStep}
                disabled={isLoading || isLimitReached || (step === 1 && !canProceedToStep2)}
                className="ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={nextStep}
                disabled={isLoading || isLimitReached || !canProceedToStep3}
                className="ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 4 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isLimitReached}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : isLimitReached ? (
                    "Upgrade Required"
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Create Profile
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {createdProfile && (
        <DNSSetupDialog
          open={showDNSSetup}
          onOpenChange={(open) => {
            setShowDNSSetup(open);
            if (!open) setCreatedProfile(null);
          }}
          profileId={createdProfile.id}
          profileName={createdProfile.display_name}
        />
      )}

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="Additional Profiles"
        currentTier={currentTier}
        requiredTier={currentTier === "free" ? "basic" : currentTier === "basic" ? "family" : "premium"}
      />
    </>
  );
};

export default CreateProfileDialog;