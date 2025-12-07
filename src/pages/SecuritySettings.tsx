import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import ToggleCard from "@/components/settings/ToggleCard";
import SettingsSection from "@/components/settings/SettingsSection";
import { Badge } from "@/components/ui/badge";
import { X, Info } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useSecuritySettings } from "@/hooks/queries";
import { useUpdateSecuritySettings } from "@/hooks/mutations";

const SecuritySettings = () => {
  const { currentProfile } = useProfile();
  const { data: referenceData } = useReferenceData();
  const { toast } = useToast();

  // React Query hooks
  const { data: securityData, isLoading, error } = useSecuritySettings(currentProfile?.id);
  const updateMutation = useUpdateSecuritySettings(currentProfile?.id || 0);

  const [security, setSecurity] = useState({
    threatIntelligenceFeeds: true,
    aiThreatDetection: true,
    googleSafeBrowsing: true,
    cryptojacking: true,
    dnsRebinding: true,
    idnHomographs: true,
    typosquatting: true,
    dga: true,
    nrd: false,
    ddns: true,
    parking: false,
    csam: true,
  });

  const [blockedCountries, setBlockedCountries] = useState<string[]>([]);

  // Initialize local state from React Query data
  useEffect(() => {
    if (securityData) {
      setSecurity({
        threatIntelligenceFeeds: securityData.threatIntelligenceFeeds,
        aiThreatDetection: securityData.aiThreatDetection,
        googleSafeBrowsing: securityData.googleSafeBrowsing,
        cryptojacking: securityData.cryptojacking,
        dnsRebinding: securityData.dnsRebinding,
        idnHomographs: securityData.idnHomographs,
        typosquatting: securityData.typosquatting,
        dga: securityData.dga,
        nrd: securityData.nrd,
        ddns: securityData.ddns,
        parking: securityData.parking,
        csam: securityData.csam,
      });

      setBlockedCountries(securityData.tlds?.map((t: any) => t.id) || []);
    }
  }, [securityData]);

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

  const securityFeatures = referenceData?.security_features || [];
  const countries = referenceData?.country_tlds || [];

  const getFeatureMeta = (id: string) => {
    return securityFeatures.find((f: any) => f.id === id) || { name: id, description: '' };
  };

  const toggleCountry = (code: string) => {
    setBlockedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    if (!currentProfile) return;

    try {
      await updateMutation.mutateAsync({
        threat_intelligence_feeds: security.threatIntelligenceFeeds,
        ai_threat_detection: security.aiThreatDetection,
        google_safe_browsing: security.googleSafeBrowsing,
        cryptojacking: security.cryptojacking,
        dns_rebinding: security.dnsRebinding,
        idn_homographs: security.idnHomographs,
        typosquatting: security.typosquatting,
        dga: security.dga,
        nrd: security.nrd,
        ddns: security.ddns,
        parking: security.parking,
        csam: security.csam,
        tlds: blockedCountries.map(id => ({ id }))
      });

      toast({
        title: "✓ Settings Saved",
        description: "Security settings updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message
      });
    }
  };

  const handleResetToRecommended = () => {
    const defaults: any = {};
    securityFeatures.forEach((feature: any) => {
      defaults[feature.id] = feature.default;
    });
    
    setSecurity({
      threatIntelligenceFeeds: defaults.threatIntelligenceFeeds ?? true,
      aiThreatDetection: defaults.aiThreatDetection ?? true,
      googleSafeBrowsing: defaults.googleSafeBrowsing ?? true,
      cryptojacking: defaults.cryptojacking ?? true,
      dnsRebinding: defaults.dnsRebinding ?? true,
      idnHomographs: defaults.idnHomographs ?? true,
      typosquatting: defaults.typosquatting ?? true,
      dga: defaults.dga ?? true,
      nrd: defaults.nrd ?? false,
      ddns: defaults.ddns ?? true,
      parking: defaults.parking ?? false,
      csam: defaults.csam ?? true,
    });
    
    setBlockedCountries([]);
    
    toast({
      title: "Reset Complete",
      description: "Security settings restored to recommended defaults",
    });
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
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertDescription>
          💡 <strong>Remember:</strong> Click "Save Changes" at the bottom after adjusting security settings.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          {/* Phase 2: Clear, parent-friendly description */}
          <p className="text-muted-foreground mt-1">
            Block viruses, scams, and dangerous websites
          </p>
        </div>
        <Button variant="outline" onClick={handleResetToRecommended}>
          Reset to Recommended
        </Button>
      </div>

      <SettingsSection
        title="Threat Protection"
        description="Block known malicious websites and content"
      >
        <ToggleCard
          id="threat-intelligence"
          label={getFeatureMeta('threatIntelligenceFeeds').name}
          description={getFeatureMeta('threatIntelligenceFeeds').description}
          checked={security.threatIntelligenceFeeds}
          onCheckedChange={(checked) => setSecurity({ ...security, threatIntelligenceFeeds: checked })}
        />
        <ToggleCard
          id="ai-threat"
          label={getFeatureMeta('aiThreatDetection').name}
          description={getFeatureMeta('aiThreatDetection').description}
          checked={security.aiThreatDetection}
          onCheckedChange={(checked) => setSecurity({ ...security, aiThreatDetection: checked })}
        />
        <ToggleCard
          id="google-safe-browsing"
          label={getFeatureMeta('googleSafeBrowsing').name}
          description={getFeatureMeta('googleSafeBrowsing').description}
          checked={security.googleSafeBrowsing}
          onCheckedChange={(checked) => setSecurity({ ...security, googleSafeBrowsing: checked })}
        />
        <ToggleCard
          id="cryptojacking"
          label={getFeatureMeta('cryptojacking').name}
          description={getFeatureMeta('cryptojacking').description}
          checked={security.cryptojacking}
          onCheckedChange={(checked) => setSecurity({ ...security, cryptojacking: checked })}
        />
      </SettingsSection>

      <SettingsSection
        title="DNS Protections"
        description="Prevent DNS-based attacks and spoofing"
      >
        <ToggleCard
          id="dns-rebinding"
          label={getFeatureMeta('dnsRebinding').name}
          description={getFeatureMeta('dnsRebinding').description}
          checked={security.dnsRebinding}
          onCheckedChange={(checked) => setSecurity({ ...security, dnsRebinding: checked })}
        />
        <ToggleCard
          id="idn-homographs"
          label={getFeatureMeta('idnHomographs').name}
          description={getFeatureMeta('idnHomographs').description}
          checked={security.idnHomographs}
          onCheckedChange={(checked) => setSecurity({ ...security, idnHomographs: checked })}
        />
        <ToggleCard
          id="typosquatting"
          label={getFeatureMeta('typosquatting').name}
          description={getFeatureMeta('typosquatting').description}
          checked={security.typosquatting}
          onCheckedChange={(checked) => setSecurity({ ...security, typosquatting: checked })}
        />
        <ToggleCard
          id="dga"
          label={getFeatureMeta('dga').name}
          description={getFeatureMeta('dga').description}
          checked={security.dga}
          onCheckedChange={(checked) => setSecurity({ ...security, dga: checked })}
        />
      </SettingsSection>

      <SettingsSection
        title="Domain Filters"
        description="Filter suspicious domain types"
      >
        <ToggleCard
          id="nrd"
          label={getFeatureMeta('nrd').name}
          description={getFeatureMeta('nrd').description}
          tooltip="May occasionally block legitimate new websites"
          checked={security.nrd}
          onCheckedChange={(checked) => setSecurity({ ...security, nrd: checked })}
        />
        <ToggleCard
          id="ddns"
          label={getFeatureMeta('ddns').name}
          description={getFeatureMeta('ddns').description}
          checked={security.ddns}
          onCheckedChange={(checked) => setSecurity({ ...security, ddns: checked })}
        />
        <ToggleCard
          id="parking"
          label={getFeatureMeta('parking').name}
          description={getFeatureMeta('parking').description}
          checked={security.parking}
          onCheckedChange={(checked) => setSecurity({ ...security, parking: checked })}
        />
      </SettingsSection>

      <SettingsSection
        title="Critical Protection"
        description="Protect against the most harmful content"
      >
        <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/20">
          <ToggleCard
            id="csam"
            label={getFeatureMeta('csam').name}
            description={getFeatureMeta('csam').description}
            checked={security.csam}
            onCheckedChange={(checked) => setSecurity({ ...security, csam: checked })}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Block Country-Specific Domains"
        description={`${blockedCountries.length} countries blocked`}
      >
        <div className="flex flex-wrap gap-2">
          {countries.map((country: any) => {
            const isBlocked = blockedCountries.includes(country.id);
            return (
              <Badge
                key={country.id}
                variant={isBlocked ? "default" : "outline"}
                className="cursor-pointer px-3 py-2 text-sm"
                onClick={() => toggleCountry(country.id)}
              >
                <span className="mr-2">{country.flag || country.id.toUpperCase()}</span>
                {country.name}
                {isBlocked && <X className="ml-2 h-3 w-3" />}
              </Badge>
            );
          })}
        </div>
      </SettingsSection>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={isLoading || updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

    </div>
  );
};

export default SecuritySettings;