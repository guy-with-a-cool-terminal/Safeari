import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ToggleCard from "@/components/settings/ToggleCard";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle2, Loader2, Info } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { usePrivacySettings } from "@/hooks/queries";
import { useUpdatePrivacySettings } from "@/hooks/mutations";
import { cn } from "@/lib/utils";

import SeamlessSection from "@/components/ui/SeamlessSection";

/**
 * Privacy Settings Page - Ad blocking, tracker protection, and blocklists
 */
const PrivacySettings = () => {
  const { currentProfile } = useProfile();
  const { data: referenceData } = useReferenceData();
  const { toast } = useToast();

  // React Query hooks
  const { data: privacyData, isLoading, error } = usePrivacySettings(currentProfile?.id);
  const updateMutation = useUpdatePrivacySettings(currentProfile?.id || 0);

  const [disguisedTrackers, setDisguisedTrackers] = useState(true);
  const [allowAffiliateLinks, setAllowAffiliateLinks] = useState(false);
  const [activeBlocklists, setActiveBlocklists] = useState<string[]>([]);
  const [nativeTrackers, setNativeTrackers] = useState<Record<string, boolean>>({});

  // Initialize local state from React Query data
  useEffect(() => {
    if (privacyData) {
      setDisguisedTrackers(privacyData.disguisedTrackers);
      setAllowAffiliateLinks(privacyData.allowAffiliate);
      setActiveBlocklists(privacyData.blocklists?.map((b: any) => b.id) || []);

      const nativesMap: Record<string, boolean> = {};
      privacyData.natives?.forEach((n: any) => {
        nativesMap[n.id] = true;
      });
      setNativeTrackers(nativesMap);
    }
  }, [privacyData]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to load settings",
        description: error instanceof Error ? error.message : "Please try again"
      });
    }
  }, [error, toast]);

  const blocklists = referenceData?.blocklists || [];
  const nativeTrackersList = referenceData?.native_trackers || [];

  const toggleBlocklist = (id: string) => {
    setActiveBlocklists(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const totalBlockedDomains = blocklists
    .filter(bl => activeBlocklists.includes(bl.id))
    .reduce((sum, bl) => sum + (bl.entries || 0), 0);

  const handleSave = async () => {
    if (!currentProfile) return;

    try {
      await updateMutation.mutateAsync({
        disguised_trackers: disguisedTrackers,
        allow_affiliate: allowAffiliateLinks,
        blocklists: activeBlocklists.map(id => ({ id })),
        natives: Object.entries(nativeTrackers)
          .filter(([_, active]) => active)
          .map(([id]) => ({ id }))
      });

      toast({
        title: "Settings Saved",
        description: "Your privacy settings have been updated",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message
      });
    }
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-medium">Please select a profile to configure privacy</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8">
      {/* Personalized Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Guard {currentProfile.display_name}'s Privacy</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Stop trackers and ads from following <span className="text-primary font-semibold">{currentProfile.display_name}</span> across the web and reclaim their digital footprint.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/10 p-5 shadow-sm shadow-primary/5">
        <div className="flex items-start gap-4">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-medium leading-relaxed pt-1">
            Safeguard {currentProfile.display_name}'s identity by blocking invasive data collection. <span className="text-primary">Always remember to save your adjustments</span> at the bottom.
          </p>
        </div>
      </div>

      <SeamlessSection
        title="Tracking Defense"
        description="Prevent data harvesting from invasive first-party and third-party scripts."
      >
        <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-card/30">
          <ToggleCard
            id="disguised-trackers"
            label="Block Disguised Trackers"
            description="Identifies and stops trackers hiding within legitimate request paths."
            checked={disguisedTrackers}
            onCheckedChange={setDisguisedTrackers}
          />
          <ToggleCard
            id="affiliate-links"
            label="Allow Affiliate Links"
            description="Permit marketing links that support small creators and publishers."
            checked={allowAffiliateLinks}
            onCheckedChange={setAllowAffiliateLinks}
          />
        </div>
      </SeamlessSection>

      <SeamlessSection
        title="Global Blocklists"
        description={`Active filtering across ${totalBlockedDomains.toLocaleString()} unique domains.`}
      >
        <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-card/30">
          {blocklists.map((blocklist) => {
            const isActive = activeBlocklists.includes(blocklist.id);
            return (
              <div
                key={blocklist.id}
                onClick={() => toggleBlocklist(blocklist.id)}
                className={cn(
                  "group relative cursor-pointer flex flex-col p-5 rounded-xl border transition-all hover:shadow-lg active:scale-[0.98]",
                  isActive
                    ? "bg-background border-primary shadow-primary/10 ring-1 ring-primary/20"
                    : "bg-background border-border/40 hover:border-primary/40"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-bold tracking-tight flex items-center gap-2">
                      {blocklist.name}
                      {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {blocklist.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/20">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border-none">
                    {blocklist.category}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground/60">
                    {(blocklist.entries || 0).toLocaleString()} ENTRIES
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SeamlessSection>

      <SeamlessSection
        title="Manufacturer Privacy"
        description="Opt-out of telemetry and data collection baked into your device OS."
      >
        <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-card/30">
          {nativeTrackersList.map((tracker) => (
            <ToggleCard
              key={tracker.id}
              id={tracker.id}
              label={tracker.name}
              description={tracker.description}
              checked={nativeTrackers[tracker.id] || false}
              onCheckedChange={(checked) =>
                setNativeTrackers({ ...nativeTrackers, [tracker.id]: checked })
              }
            />
          ))}
        </div>
      </SeamlessSection>

      <div className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50">
        <Button
          onClick={handleSave}
          size="lg"
          disabled={isLoading || updateMutation.isPending}
          className="h-14 px-10 rounded-full font-bold shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          {updateMutation.isPending ? "Applying Privacy..." : "Secure My Data"}
        </Button>
      </div>
    </div>
  );
};

export default PrivacySettings;