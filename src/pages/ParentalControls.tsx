import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import UpgradeModal from "@/components/modals/UpgradeModal";
import ToggleCard from "@/components/settings/ToggleCard";
import ServiceRow from "@/components/parental/ServiceRow";
import CategoryRow from "@/components/parental/CategoryRow";
import ScheduleDialog from "@/components/parental/ScheduleDialog";
import SettingsSection from "@/components/settings/SettingsSection";
import RecreationSchedule from "@/components/parental/RecreationSchedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown, Search, Lock, Crown, Clock, Info, ChevronUp,
  Users, Video, Gamepad2, MessageCircle, Check, RefreshCw, Loader2
} from "lucide-react";
import BrandLogo from "@/components/parental/BrandLogo";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useParentalControls } from "@/hooks/queries";
import { useUpdateParentalControls } from "@/hooks/mutations";

const ParentalControls = () => {
  const { currentProfile } = useProfile();
  const { subscription } = useSubscription();
  const { data: referenceData } = useReferenceData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Schedule Dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDialogTarget, setScheduleDialogTarget] = useState<{
    id: string;
    name: string;
    isService: boolean;
    recreationEnabled: boolean;
  } | null>(null);

  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [globalScheduleOpen, setGlobalScheduleOpen] = useState(false);

  // Check feature access
  const features = subscription?.features || [];
  const hasRecreationSchedule = features.includes('screen_time');
  const hasBlockBypass = features.includes('block_bypass_prevention');
  const tier = subscription?.tier || 'free';

  // React Query hooks
  const { data: parentalData, isLoading, error } = useParentalControls(currentProfile?.id);
  const updateMutation = useUpdateParentalControls(currentProfile?.id || 0);

  const [safeSearch, setSafeSearch] = useState(true);
  const [youtubeRestricted, setYoutubeRestricted] = useState(true);
  const [blockBypass, setBlockBypass] = useState(true);
  const [blockedServices, setBlockedServices] = useState<Record<string, boolean>>({});
  const [blockedCategories, setBlockedCategories] = useState<Record<string, boolean>>({});
  const [recreationServices, setRecreationServices] = useState<Record<string, boolean>>({});
  const [recreationCategories, setRecreationCategories] = useState<Record<string, boolean>>({});

  // Track initial state for delta detection
  const [initialServices, setInitialServices] = useState<Record<string, boolean>>({});
  const [initialCategories, setInitialCategories] = useState<Record<string, boolean>>({});
  const [initialRecreationServices, setInitialRecreationServices] = useState<Record<string, boolean>>({});
  const [initialRecreationCategories, setInitialRecreationCategories] = useState<Record<string, boolean>>({});

  // Initialize local state from React Query data
  useEffect(() => {
    if (parentalData) {
      setSafeSearch(parentalData.safeSearch);
      setYoutubeRestricted(parentalData.youtubeRestrictedMode);
      setBlockBypass(parentalData.blockBypass);

      const servicesMap: Record<string, boolean> = {};
      const recreationServicesMap: Record<string, boolean> = {};
      parentalData.services?.forEach((s: any) => {
        servicesMap[s.id] = s.active;
        if (s.recreation) recreationServicesMap[s.id] = true;
      });
      setBlockedServices(servicesMap);
      setRecreationServices(recreationServicesMap);
      setInitialServices(servicesMap);
      setInitialRecreationServices(recreationServicesMap);

      const categoriesMap: Record<string, boolean> = {};
      const recreationCategoriesMap: Record<string, boolean> = {};
      parentalData.categories?.forEach((c: any) => {
        categoriesMap[c.id] = c.active;
        if (c.recreation) recreationCategoriesMap[c.id] = true;
      });
      setBlockedCategories(categoriesMap);
      setRecreationCategories(recreationCategoriesMap);
      setInitialCategories(categoriesMap);
      setInitialRecreationCategories(recreationCategoriesMap);
    }
  }, [parentalData]);

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

  const openScheduleDialog = (id: string, name: string, isService: boolean) => {
    if (!hasRecreationSchedule) {
      setUpgradeFeature("Recreation Schedule");
      setUpgradeModalOpen(true);
      return;
    }

    setScheduleDialogTarget({
      id,
      name,
      isService,
      recreationEnabled: isService ? !!recreationServices[id] : !!recreationCategories[id]
    });
    setScheduleDialogOpen(true);
  };

  const services = referenceData?.parental_services || [];
  const categories = referenceData?.content_categories || [];

  const groupedServices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    services.forEach((service: any) => {
      const cat = service.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(service);
    });
    return groups;
  }, [services]);

  const filteredGroupedServices = useMemo(() => {
    if (!searchQuery.trim()) return groupedServices;

    const filtered: Record<string, any[]> = {};
    Object.entries(groupedServices).forEach(([category, items]) => {
      const matchingItems = items.filter((service: any) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingItems.length > 0) {
        filtered[category] = matchingItems;
      }
    });
    return filtered;
  }, [groupedServices, searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const blockAllAndNavigate = (category: string) => {
    blockAllInCategory(category);
    setExpandedCategories(prev => ({ ...prev, [category]: true }));

    setTimeout(() => {
      const categoryElement = document.getElementById(`category-${category}`);
      const servicesSection = document.getElementById('services-section');
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const blockAllInCategory = (category: string) => {
    const serviceIds = groupedServices[category]?.map((s: any) => s.id) || [];
    const newBlockedServices = { ...blockedServices };
    const allBlocked = serviceIds.every(id => newBlockedServices[id]);

    if (allBlocked) {
      serviceIds.forEach(id => delete newBlockedServices[id]);
    } else {
      serviceIds.forEach(id => newBlockedServices[id] = true);
    }
    setBlockedServices(newBlockedServices);
  };

  const toggleRecreationForCategory = (category: string, enable: boolean) => {
    if (!hasRecreationSchedule) {
      setUpgradeFeature("Recreation Schedule");
      setUpgradeModalOpen(true);
      return;
    }

    const serviceIds = groupedServices[category]?.map((s: any) => s.id) || [];
    const newRecreationServices = { ...recreationServices };
    serviceIds.forEach(id => {
      if (blockedServices[id]) newRecreationServices[id] = enable;
    });
    setRecreationServices(newRecreationServices);
  };

  const handleBlockBypassToggle = (checked: boolean) => {
    if (!hasBlockBypass && checked) {
      setUpgradeFeature("Block Bypass Protection");
      setUpgradeModalOpen(true);
      return;
    }
    setBlockBypass(checked);
  };

  const handleSave = async () => {
    if (!currentProfile) return;

    const changedServices = Object.keys({ ...blockedServices, ...initialServices })
      .filter(id => {
        const currentBlocked = blockedServices[id] || false;
        const initialBlocked = initialServices[id] || false;
        const currentRecreation = recreationServices[id] || false;
        const initialRecreation = initialRecreationServices[id] || false;
        return currentBlocked !== initialBlocked || (currentBlocked && currentRecreation !== initialRecreation);
      })
      .map(id => ({ id, active: blockedServices[id] || false, recreation: recreationServices[id] || false }));

    const changedCategories = Object.keys({ ...blockedCategories, ...initialCategories })
      .filter(id => {
        const currentBlocked = blockedCategories[id] || false;
        const initialBlocked = initialCategories[id] || false;
        const currentRecreation = recreationCategories[id] || false;
        const initialRecreation = initialRecreationCategories[id] || false;
        return currentBlocked !== initialBlocked || (currentBlocked && currentRecreation !== initialRecreation);
      })
      .map(id => ({ id, active: blockedCategories[id] || false, recreation: recreationCategories[id] || false }));

    const CHUNK_SIZE = 5;
    const serviceChunks = [];
    for (let i = 0; i < changedServices.length; i += CHUNK_SIZE) {
      serviceChunks.push(changedServices.slice(i, i + CHUNK_SIZE));
    }

    const basePayload = {
      safe_search: safeSearch,
      youtube_restricted_mode: youtubeRestricted,
      block_bypass: blockBypass,
    };

    const firstPayload: any = { ...basePayload };
    if (changedCategories.length > 0) firstPayload.categories = changedCategories;
    if (serviceChunks.length > 0) firstPayload.services = serviceChunks[0];

    try {
      await updateMutation.mutateAsync(firstPayload);

      const { updateParentalControls } = await import('@/lib/api');
      for (let i = 1; i < serviceChunks.length; i++) {
        await updateParentalControls(currentProfile.id, { services: serviceChunks[i] });
      }

      setInitialServices(blockedServices);
      setInitialCategories(blockedCategories);
      setInitialRecreationServices(recreationServices);
      setInitialRecreationCategories(recreationCategories);

      toast({
        title: "✓ Settings Saved",
        description: `Updated ${changedServices.length + changedCategories.length} items successfully`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to save", description: error.message });
    }
  };

  const handleRestoreDefaults = () => {
    setSafeSearch(true);
    setYoutubeRestricted(true);
    setBlockBypass(hasBlockBypass);
    setBlockedServices({});
    setBlockedCategories({});
    setRecreationServices({});
    setRecreationCategories({});
    toast({ title: "Defaults Restored", description: "All settings have been reset to defaults" });
  };

  const blockedServicesCount = Object.values(blockedServices).filter(Boolean).length;
  const blockedCategoriesCount = Object.values(blockedCategories).filter(Boolean).length;

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Keep {currentProfile.display_name} Safe Online</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          Easily manage what {currentProfile.display_name} can see and do online with these simple safeguards.
        </p>
      </div>

      <div className="space-y-12">
        {/* Block the Worst Offenders (Quick Actions) */}
        <SettingsSection
          title="Block the Worst Offenders"
          description="Instantly block TikTok, gaming, adult content, and more"
        >
          <div className="flex items-center gap-4 lg:gap-8 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1 lg:justify-start">
            {[
              { category: 'social', title: 'Social', icon: Users, color: '#1877F2' },
              { category: 'video', title: 'Videos', icon: Video, color: '#FF0000' },
              { category: 'gaming', title: 'Gaming', icon: Gamepad2, color: '#FF4500' },
              { category: 'messaging', title: 'Chats', icon: MessageCircle, color: '#25D366' },
              { category: 'schedule', title: 'Schedule', icon: Clock, color: 'hsl(var(--primary))' },
            ].map(({ category, title, icon: Icon, color }) => {
              if (category === 'schedule') {
                return (
                  <button
                    key={category}
                    onClick={() => {
                      if (!hasRecreationSchedule) {
                        setUpgradeFeature("Recreation Schedule");
                        setUpgradeModalOpen(true);
                        return;
                      }
                      setGlobalScheduleOpen(true);
                    }}
                    className="flex flex-col items-center gap-2 p-4 sm:p-3 min-w-[110px] sm:min-w-[100px] rounded-xl transition-all border shadow-sm bg-accent/30 border-border/50 hover:bg-accent/50 group"
                  >
                    <div
                      style={{ color: 'white', backgroundColor: color }}
                      className="p-4 sm:p-3 rounded-full transition-all group-hover:scale-110 shadow-sm"
                    >
                      <Icon className="h-6 w-6 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{title}</div>
                      <div className="text-[10px] sm:text-xs font-bold uppercase">Set Times</div>
                    </div>
                  </button>
                );
              }

              const blockedCount = services.filter((s: any) => s.category === category && blockedServices[s.id]).length;
              const totalCount = services.filter((s: any) => s.category === category).length;
              const isAllBlocked = blockedCount === totalCount && totalCount > 0;

              return (
                <button
                  key={category}
                  onClick={() => blockAllAndNavigate(category)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 sm:p-3 min-w-[110px] sm:min-w-[100px] rounded-xl transition-all border shadow-sm group",
                    isAllBlocked
                      ? "bg-primary/5 border-primary/30"
                      : "bg-accent/30 border-border/50 hover:bg-accent/50"
                  )}
                >
                  <div
                    style={{ color: isAllBlocked ? 'white' : color, backgroundColor: isAllBlocked ? color : 'transparent' }}
                    className={cn(
                      "p-4 sm:p-3 rounded-full transition-all group-hover:scale-110",
                      !isAllBlocked && "bg-background shadow-sm"
                    )}
                  >
                    <Icon className="h-6 w-6 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{title}</div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase">
                      {isAllBlocked ? "All Blocked ✓" : blockedCount > 0 ? `Block All (${blockedCount})` : "Block All"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Services Section */}
        <SettingsSection id="services-section" title={`Decide what ${currentProfile.display_name} can use`} description="Turn off specific apps and websites individually">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 bg-accent/20 border-none shadow-none focus-visible:ring-1" />
          </div>

          <div className="divide-y divide-border/50 border-y border-border/50 -mx-4 sm:mx-0">
            {Object.entries(filteredGroupedServices).map(([category, categoryServices]) => {
              const isExpanded = expandedCategories[category];
              const blockedInCategory = categoryServices.filter((s: any) => blockedServices[s.id]).length;

              return (
                <div key={category} id={`category-${category}`} className={cn(
                  "transition-all",
                  isExpanded ? "bg-accent/10" : "hover:bg-accent/5"
                )}>
                  <div className={cn(
                    "flex items-center justify-between p-5 cursor-pointer",
                    isExpanded && "border-l-4 border-primary"
                  )}
                    onClick={() => toggleCategory(category)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors flex items-center justify-center bg-muted/50",
                        isExpanded ? "bg-primary/20" : ""
                      )}>
                        <BrandLogo id={category} name={category} className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold capitalize text-lg tracking-tight">{category}</span>
                        <span className="text-xs text-muted-foreground">{blockedInCategory} of {categoryServices.length} blocked</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {blockedInCategory > 0 && (() => {
                        const blockedServicesInCategory = categoryServices.filter((s: any) => blockedServices[s.id]);
                        const allBlockedHaveRecreation = blockedServicesInCategory.every((s: any) => recreationServices[s.id]);

                        return (
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            toggleRecreationForCategory(category, !allBlockedHaveRecreation);
                          }} className="text-xs h-8 px-3 hover:bg-background/80 transition-colors">
                            {!hasRecreationSchedule && <Lock className="h-3 w-3 mr-1" />}
                            {allBlockedHaveRecreation ? 'Block All Day' : 'Allow During Screen Time'}
                          </Button>
                        );
                      })()}
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        blockAllInCategory(category);
                      }} className="text-xs h-8 px-3 hover:bg-background/80 transition-colors">
                        {blockedInCategory === categoryServices.length ? 'Unblock All' : 'Block All'}
                      </Button>
                      <div className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")}>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 space-y-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-1">
                        {categoryServices.map((service: any, index: number) => {
                          const isSolo = index === categoryServices.length - 1 && categoryServices.length % 2 !== 0;
                          return (
                            <div
                              key={service.id}
                              className={cn(isSolo && "lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6")}
                            >
                              <ServiceRow
                                id={service.id}
                                name={service.name}
                                description={service.description}
                                checked={blockedServices[service.id] || false}
                                onCheckedChange={(checked) => setBlockedServices({ ...blockedServices, [service.id]: checked })}
                                recreationEnabled={recreationServices[service.id] || false}
                                hasRecreationAccess={hasRecreationSchedule}
                                onScheduleClick={() => openScheduleDialog(service.id, service.name, true)}
                              />
                              {isSolo && <div className="hidden lg:block" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SettingsSection>

        {/* Categories Section */}
        <SettingsSection title="Block Content Categories" description="Block entire types of content automatically">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border/50 border-y border-border/50 -mx-4 sm:mx-0 overflow-hidden shadow-sm">
            {categories.map((category: any, index: number) => {
              const isSolo = index === categories.length - 1 && categories.length % 2 !== 0;
              return (
                <div
                  key={category.id}
                  className={cn(
                    "bg-background",
                    isSolo && "lg:col-span-2 grid grid-cols-1 lg:grid-cols-2"
                  )}
                >
                  <CategoryRow
                    id={category.id}
                    name={category.name}
                    description={category.description}
                    severity={category.severity as "high" | "medium" | "low"}
                    checked={blockedCategories[category.id] || false}
                    onCheckedChange={(checked) => setBlockedCategories({ ...blockedCategories, [category.id]: checked })}
                    recreationEnabled={recreationCategories[category.id] || false}
                    hasRecreationAccess={hasRecreationSchedule}
                    onScheduleClick={() => openScheduleDialog(category.id, category.name, false)}
                  />
                  {isSolo && <div className="hidden lg:block bg-background" />}
                </div>
              );
            })}
          </div>
        </SettingsSection>

        {/* Always-On Protection */}
        <SettingsSection title="Always-On Protection" description="Essential safety features - we recommend keeping these ON">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border/50 border-y border-border/50 -mx-4 sm:mx-0 shadow-sm overflow-hidden">
            <div className="bg-background">
              <ToggleCard
                id="safe-search"
                label="Safe Search"
                description="Enforce safe search across all search engines"
                checked={safeSearch}
                onCheckedChange={setSafeSearch}
                className="border-none shadow-none rounded-none p-4 hover:bg-accent/5 transition-colors"
              />
            </div>
            <div className="bg-background">
              <ToggleCard
                id="youtube-restricted"
                label="YouTube Restricted Mode"
                description="Enable restricted mode on YouTube to filter mature content"
                checked={youtubeRestricted}
                onCheckedChange={setYoutubeRestricted}
                className="border-none shadow-none rounded-none p-4 hover:bg-accent/5 transition-colors"
              />
            </div>
            <div className="lg:col-span-2 bg-background grid grid-cols-1 lg:grid-cols-2">
              <ToggleCard
                id="block-bypass"
                label={
                  <div className="flex items-center gap-2 font-semibold">
                    Block Bypass Protection
                    {!hasBlockBypass && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold">
                        <Crown className="h-2.5 w-2.5 mr-1" />
                        Basic+
                      </Badge>
                    )}
                  </div>
                }
                description="Prevent circumvention of parental controls using VPNs and proxies"
                checked={blockBypass}
                onCheckedChange={handleBlockBypassToggle}
                disabled={!hasBlockBypass && !blockBypass}
                className="border-none shadow-none rounded-none p-4 hover:bg-accent/5 transition-colors"
              />
              <div className="hidden lg:block bg-background" />
            </div>
          </div>
          {!hasBlockBypass && (
            <Alert className="border-orange-500/30 bg-orange-500/5 dark:bg-orange-500/10">
              <Lock className="h-4 w-4 text-orange-500" />
              <AlertDescription className="flex items-center justify-between w-full">
                <span className="text-sm"><strong>VPN/Proxy blocking</strong> prevents tech-savvy kids from bypassing restrictions</span>
                <Button size="sm" variant="outline" onClick={() => {
                  setUpgradeFeature("Block Bypass Protection");
                  setUpgradeModalOpen(true);
                }} className="border-orange-500/20 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  Upgrade
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </SettingsSection>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-border/50 gap-4">
          <Button
            variant="ghost"
            onClick={handleRestoreDefaults}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Restore Defaults
          </Button>
          <div className="flex items-center gap-3 w-full sm:w-auto h-12">
            {/* Empty space for alignment, save moved to floating */}
          </div>
        </div>
      </div>

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
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature={upgradeFeature}
        currentTier={tier}
        requiredTier="basic"
      />

      {/* Schedule Dialog */}
      {scheduleDialogTarget && (
        <ScheduleDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          title={scheduleDialogTarget.name}
          id={scheduleDialogTarget.id}
          isService={scheduleDialogTarget.isService}
          recreationEnabled={scheduleDialogTarget.recreationEnabled}
          onRecreationToggle={(enabled) => {
            setScheduleDialogTarget(prev => prev ? { ...prev, recreationEnabled: enabled } : null);
          }}
          onSave={() => {
            const { id, isService, recreationEnabled } = scheduleDialogTarget;
            if (isService) {
              setRecreationServices(prev => ({ ...prev, [id]: recreationEnabled }));
            } else {
              setRecreationCategories(prev => ({ ...prev, [id]: recreationEnabled }));
            }
            setScheduleDialogOpen(false);
            toast({
              title: "Changes Staged",
              description: `Screen time for ${scheduleDialogTarget.name} has been updated. Don't forget to Save Changes.`,
            });
          }}
        />
      )}

      {/* Global Schedule Dialog */}
      <Dialog open={globalScheduleOpen} onOpenChange={setGlobalScheduleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">Global Screen Time</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Set the internet accessibility hours for this profile.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-primary/80">
                This schedule only applies where the 🕒 icon is active in the lists below.
              </AlertDescription>
            </Alert>

            <div className="rounded-2xl border bg-card/50 p-1">
              <RecreationSchedule />
            </div>

            <DialogFooter className="pt-4">
              <Button onClick={() => setGlobalScheduleOpen(false)} className="w-full sm:w-auto px-12 h-11">
                Done
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentalControls;