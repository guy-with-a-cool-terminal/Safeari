import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import ToggleCard from "@/components/settings/ToggleCard";
import { Badge } from "@/components/ui/badge";
import { X, Info, Check, Loader2 } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useSecuritySettings } from "@/hooks/queries";
import { useUpdateSecuritySettings } from "@/hooks/mutations";
import { cn } from "@/lib/utils";

import SeamlessSection from "@/components/ui/SeamlessSection";

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
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground font-medium">Please select a profile to configure security</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8">
      {/* Personalized Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Protect {currentProfile.display_name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Configure advanced security shields to keep <span className="text-primary font-semibold">{currentProfile.display_name} safe</span> from malware, phishing, and online scams.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleResetToRecommended}
          className="rounded-full px-6 border-border/40 hover:bg-accent/50 text-xs font-bold uppercase tracking-widest transition-all h-10"
        >
          Reset to Safe Defaults
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/10 p-5 shadow-sm shadow-primary/5">
        <div className="flex items-start gap-4">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-medium leading-relaxed pt-1">
            {currentProfile.display_name} is protected by Safeari's real-time threat database. <span className="text-primary">Always remember to save your manual adjustments</span> at the bottom of the page.
          </p>
        </div>
      </div>

      <SeamlessSection
        title="Threat Intel"
        description="Block known malicious websites and content in real-time."
      >
        <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/30">
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
        </div>
      </SeamlessSection>

      <SeamlessSection
        title="System Integrity"
        description="Prevent sophisticated DNS-based attacks and domain spoofing."
      >
        <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/30">
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
        </div>
      </SeamlessSection>

      <SeamlessSection
        title="Predictive Filtering"
        description="Identify and block suspicious domain types before they are used."
      >
        <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-card/30">
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
        </div>
      </SeamlessSection>

      <SeamlessSection
        title="Critical Prevention"
        description="Core security filters protecting against the most harmful digital content."
      >
        <div className="p-2 sm:p-6 bg-rose-500/5">
          <div className="p-1 rounded-xl bg-white/5 border border-rose-500/10 transition-all hover:bg-white/10">
            <ToggleCard
              id="csam"
              label={getFeatureMeta('csam').name}
              description={getFeatureMeta('csam').description}
              checked={security.csam}
              onCheckedChange={(checked) => setSecurity({ ...security, csam: checked })}
              className="border-none shadow-none bg-transparent hover:bg-transparent"
            />
          </div>
        </div>
      </SeamlessSection>

      <SeamlessSection
        title="Geofencing"
        description="Block entire country-level domains (TLDs) to prevent traffic from high-risk or irrelevant regions."
      >
        <div className="p-4 sm:p-8 bg-card/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {countries.map((country: any) => {
              const isBlocked = blockedCountries.includes(country.id);
              return (
                <button
                  key={country.id}
                  onClick={() => toggleCountry(country.id)}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all active:scale-95",
                    isBlocked
                      ? "bg-primary/10 text-primary border-primary shadow-sm shadow-primary/5"
                      : "bg-background text-muted-foreground border-border/40 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-lg shrink-0 grayscale group-hover:grayscale-0 transition-all">{country.flag || country.id.toUpperCase()}</span>
                    <span className="truncate">{country.name}</span>
                  </div>
                  {isBlocked && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0 ml-1">
                      <Check className="h-2.5 w-2.5 text-primary-foreground font-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </SeamlessSection>

      <div className="fixed bottom-8 right-8 z-50">
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
          {updateMutation.isPending ? "Protecting..." : "Save Security Suite"}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;