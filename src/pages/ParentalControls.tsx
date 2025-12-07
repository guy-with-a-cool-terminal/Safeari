import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import UpgradeModal from "@/components/modals/UpgradeModal";
import ToggleCard from "@/components/settings/ToggleCard";
import ServiceCard from "@/components/settings/ServiceCard";
import CategoryCard from "@/components/settings/CategoryCard";
import SettingsSection from "@/components/settings/SettingsSection";
import RecreationSchedule from "@/components/parental/RecreationSchedule";
import {
  MessageCircle, Youtube, Instagram, Facebook, Twitter, Music, Video,
  Heart, Camera, Search, ChevronDown, ChevronUp, Gamepad2, ShoppingBag,
  Bot, MessageSquare, Phone, Tv, Users, Info, Clock, Lock, Crown
} from "lucide-react";
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

  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

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

  const getServiceIcon = (serviceId: string) => {
    const iconMap: Record<string, any> = {
      tiktok: Music, facebook: Facebook, instagram: Instagram, twitter: Twitter,
      whatsapp: MessageCircle, snapchat: Camera, reddit: MessageSquare, tumblr: MessageSquare,
      pinterest: Camera, vk: Users, "9gag": MessageSquare, bereal: Camera, mastodon: MessageSquare,
      youtube: Youtube, netflix: Tv, twitch: Video, dailymotion: Video, hulu: Tv, vimeo: Video,
      disneyplus: Tv, primevideos: Tv, hbomax: Tv, imgur: Camera, spotify: Music,
      discord: MessageSquare, telegram: MessageCircle, messenger: MessageCircle, signal: Phone,
      googlechat: MessageCircle, skype: Phone, zoom: Video, roblox: Gamepad2, fortnite: Gamepad2,
      minecraft: Gamepad2, leagueoflegends: Gamepad2, steam: Gamepad2, xboxlive: Gamepad2,
      playstationnetwork: Gamepad2, blizzard: Gamepad2, tinder: Heart, amazon: ShoppingBag,
      ebay: ShoppingBag, chatgpt: Bot,
    };
    return iconMap[serviceId] || MessageCircle;
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, any> = {
      social: Users, video: Video, music: Music, messaging: MessageSquare,
      gaming: Gamepad2, dating: Heart, shopping: ShoppingBag, ai: Bot,
    };
    return iconMap[categoryName] || Users;
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
    <>
      <div className="space-y-8 relative">
        <div className="sticky top-0 z-50 bg-background pb-4">
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              💡 <strong>Remember:</strong> Click "Save Changes" at the bottom after making any adjustments.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Parental Controls</h1>
              <p className="text-muted-foreground mt-1">Manage content filtering and access restrictions</p>
            </div>
            <Button variant="outline" onClick={handleRestoreDefaults} className="hidden sm:flex">
              Restore Defaults
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!hasRecreationSchedule) {
                  setUpgradeFeature("Recreation Schedule");
                  setUpgradeModalOpen(true);
                  return;
                }
                document.getElementById('screen-time-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto"
            >
              {!hasRecreationSchedule && <Lock className="h-4 w-4 mr-2" />}
              <Clock className="h-4 w-4 mr-2" />
              Set Screen Time
            </Button>
            <Button variant="outline" onClick={handleRestoreDefaults} className="w-full sm:hidden">
              Restore Defaults
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <SettingsSection title="Quick Actions" description="One-click shortcuts - click to block and see what was affected">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { category: 'social', title: 'Block All Social Media', subtitle: 'TikTok, Instagram, Snapchat, Facebook...' },
              { category: 'gaming', title: 'Block All Gaming', subtitle: 'Roblox, Fortnite, Minecraft...' },
              { category: 'video', title: 'Block All Video Streaming', subtitle: 'YouTube, Netflix, Twitch...' },
              { category: 'messaging', title: 'Block All Messaging Apps', subtitle: 'WhatsApp, Telegram, Discord...' },
            ].map(({ category, title, subtitle }) => (
              <Button
                key={category}
                variant="outline"
                className="h-auto py-4 px-4 flex items-center justify-between text-left"
                onClick={() => blockAllAndNavigate(category)}
              >
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground">{subtitle}</div>
                </div>
                <Badge variant="secondary">
                  {services.filter((s: any) => s.category === category && blockedServices[s.id]).length}/
                  {services.filter((s: any) => s.category === category).length}
                </Badge>
              </Button>
            ))}
          </div>
        </SettingsSection>

        {/* Core Protections */}
        <SettingsSection title="Core Protections" description="Essential safety features - we recommend keeping these ON">
          <ToggleCard
            id="safe-search"
            label="Safe Search"
            description="Enforce safe search across all search engines"
            checked={safeSearch}
            onCheckedChange={setSafeSearch}
          />
          <ToggleCard
            id="youtube-restricted"
            label="YouTube Restricted Mode"
            description="Enable restricted mode on YouTube to filter mature content"
            checked={youtubeRestricted}
            onCheckedChange={setYoutubeRestricted}
          />
          <ToggleCard
            id="block-bypass"
            label={
              <div className="flex items-center gap-2">
                Block Bypass Protection
                {!hasBlockBypass && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Basic+
                  </Badge>
                )}
              </div>
            }
            description="Prevent circumvention of parental controls using VPNs and proxies"
            checked={blockBypass}
            onCheckedChange={handleBlockBypassToggle}
            disabled={!hasBlockBypass && !blockBypass}
          />
          {!hasBlockBypass && (
            <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span><strong>VPN/Proxy blocking</strong> prevents tech-savvy kids from bypassing restrictions</span>
                  <Button size="sm" variant="outline" onClick={() => {
                    setUpgradeFeature("Block Bypass Protection");
                    setUpgradeModalOpen(true);
                  }}>
                    Upgrade
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </SettingsSection>

        {/* Services Section */}
        <SettingsSection id="services-section" title="Block Services & Apps" description={`${blockedServicesCount} services blocked`}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          <div className="space-y-3">
            {Object.entries(filteredGroupedServices).map(([category, categoryServices]) => {
              const isExpanded = expandedCategories[category];
              const CategoryIcon = getCategoryIcon(category);
              const blockedInCategory = categoryServices.filter((s: any) => blockedServices[s.id]).length;

              return (
                <div key={category} id={`category-${category}`} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted"
                       onClick={() => toggleCategory(category)}>
                    <div className="flex items-center gap-3 flex-1">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge variant="secondary">{blockedInCategory}/{categoryServices.length}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {blockedInCategory > 0 && (() => {
                        const blockedServicesInCategory = categoryServices.filter((s: any) => blockedServices[s.id]);
                        const allBlockedHaveRecreation = blockedServicesInCategory.every((s: any) => recreationServices[s.id]);

                        return (
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            toggleRecreationForCategory(category, !allBlockedHaveRecreation);
                          }} className="text-xs">
                            {!hasRecreationSchedule && <Lock className="h-3 w-3 mr-1" />}
                            {allBlockedHaveRecreation ? 'Block All Day' : 'Allow During Screen Time'}
                          </Button>
                        );
                      })()}
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        blockAllInCategory(category);
                      }}>
                        {blockedInCategory === categoryServices.length ? 'Unblock All' : 'Block All'}
                      </Button>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryServices.map((service: any) => (
                        <ServiceCard
                          key={service.id}
                          id={service.id}
                          name={service.name}
                          description={service.description}
                          category={service.category}
                          icon={getServiceIcon(service.id)}
                          checked={blockedServices[service.id] || false}
                          onCheckedChange={(checked) => setBlockedServices({ ...blockedServices, [service.id]: checked })}
                          recreationEnabled={recreationServices[service.id] || false}
                          onRecreationChange={(enabled) => {
                            if (!hasRecreationSchedule) {
                              setUpgradeFeature("Recreation Schedule");
                              setUpgradeModalOpen(true);
                              return;
                            }
                            setRecreationServices({ ...recreationServices, [service.id]: enabled });
                          }}
                          hasRecreationAccess={hasRecreationSchedule}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SettingsSection>

        {/* Categories Section */}
        <SettingsSection title="Block Content Categories" description={`${blockedCategoriesCount} categories blocked`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category: any) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
                severity={category.severity as "high" | "medium" | "low"}
                checked={blockedCategories[category.id] || false}
                onCheckedChange={(checked) => setBlockedCategories({ ...blockedCategories, [category.id]: checked })}
                recreationEnabled={recreationCategories[category.id] || false}
                onRecreationChange={(enabled) => {
                  if (!hasRecreationSchedule) {
                    setUpgradeFeature("Recreation Schedule");
                    setUpgradeModalOpen(true);
                    return;
                  }
                  setRecreationCategories({ ...recreationCategories, [category.id]: enabled });
                }}
                hasRecreationAccess={hasRecreationSchedule}
              />
            ))}
          </div>
        </SettingsSection>

        {/* Recreation Schedule Section */}
        <SettingsSection
          id="screen-time-section"
          title={
            <div className="flex items-center gap-2">
              Screen Time Schedule
              {!hasRecreationSchedule && (
                <Badge variant="secondary">
                  <Crown className="h-3 w-3 mr-1" />
                  Basic+
                </Badge>
              )}
            </div>
          }
          description="Set specific times when internet access is allowed each day of the week"
        >
          {!hasRecreationSchedule ? (
            <Alert className="border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5">
              <Lock className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Smart Scheduling Available on Basic Tier</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set different rules for weekdays vs weekends. Allow TikTok from 7-9pm on school nights, 
                      block gaming until homework time, create custom schedules for each day.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button onClick={() => {
                      setUpgradeFeature("Recreation Schedule");
                      setUpgradeModalOpen(true);
                    }}>
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Basic
                    </Button>
                    <p className="text-sm text-muted-foreground">From $3/month</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Screen time settings only apply to services/categories you've enabled "Allow During Screen Time" on above. 
                  Custom Lists (allowlist/denylist) bypass screen time completely and work 24/7.
                </AlertDescription>
              </Alert>
              <RecreationSchedule />
            </>
          )}
        </SettingsSection>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={isLoading || updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature={upgradeFeature}
        currentTier={tier}
        requiredTier="basic"
      />
    </>
  );
};

export default ParentalControls;