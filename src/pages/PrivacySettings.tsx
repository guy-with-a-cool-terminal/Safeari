import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ToggleCard from "@/components/settings/ToggleCard";
import SettingsSection from "@/components/settings/SettingsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { usePrivacySettings } from "@/hooks/queries";
import { useUpdatePrivacySettings } from "@/hooks/mutations";

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
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          {/* Phase 2: Clear, parent-friendly description */}
          <p className="text-muted-foreground mt-1">
            Block ads, trackers, and data collection
          </p>
        </div>
      </div>

      <SettingsSection
        title="Tracker Protection"
        description="Advanced tracking prevention"
      >
        <ToggleCard
          id="disguised-trackers"
          label="Block Disguised Trackers"
          description="Blocks trackers disguised as first-party requests"
          checked={disguisedTrackers}
          onCheckedChange={setDisguisedTrackers}
        />
        <ToggleCard
          id="affiliate-links"
          label="Allow Affiliate Links"
          description="Permit affiliate tracking links (supports content creators)"
          checked={allowAffiliateLinks}
          onCheckedChange={setAllowAffiliateLinks}
        />
      </SettingsSection>

      <SettingsSection
        title="Ad & Tracker Blocklists"
        description={`${activeBlocklists.length} blocklists active (${totalBlockedDomains.toLocaleString()} domains total)`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocklists.map((blocklist) => {
            const isActive = activeBlocklists.includes(blocklist.id);
            return (
              <Card
                key={blocklist.id}
                className={`cursor-pointer transition-all ${
                  isActive ? "border-primary shadow-sm" : "hover:bg-accent/50"
                }`}
                onClick={() => toggleBlocklist(blocklist.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {blocklist.name}
                        {isActive && <Check className="h-4 w-4 text-primary" />}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {blocklist.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{blocklist.category}</Badge>
                    <span className="text-muted-foreground">
                      {(blocklist.entries || 0).toLocaleString()} entries
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Block Native Trackers"
        description="Block tracking from device manufacturers"
      >
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
      </SettingsSection>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={isLoading || updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

    </div>
  );
};

export default PrivacySettings;