import { Link, Outlet, useLocation } from "react-router-dom";
import { Shield, BarChart3, Users, Lock, Eye, Settings, List, MoreHorizontal, CreditCard, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import TopBar from "@/components/dashboard/TopBar";
import { cn } from "@/lib/utils";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import SafeariFullLogo from "@/assets/logofull.svg";
import SafeariIcon from "@/assets/favicon.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingTooltip } from "@/components/onboarding/OnboardingTooltip";
import { useOnboardingTour, TOUR_PRIORITIES } from "@/components/onboarding/useOnboardingTour";
import { GlobalNav } from "@/components/navigation/GlobalNav";

// Navigation configuration with tier-based feature flags
const getNavItems = (tier: string = 'free') => {
  const baseItems = [
    {
      icon: Users,
      label: "Parental",
      href: "/dashboard",
      available: true
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/dashboard/analytics",
      available: true
    },
    {
      icon: Shield,
      label: "Security",
      href: "/dashboard/security",
      available: true
    },
    {
      icon: Eye,
      label: "Privacy",
      href: "/dashboard/privacy",
      available: true
    },
  ];

  const tierBasedItems = [
    {
      icon: List,
      label: "Lists",
      href: "/dashboard/lists",
      available: true
    },
    {
      icon: CreditCard,
      label: "Usage & Billing",
      href: "/dashboard/usage-billing",
      available: true
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
      available: true
    },
    {
      icon: MessageSquare,
      label: "Help & Feedback",
      href: "#feedback", // Special href to trigger modal
      available: true
    },
  ];

  return [...baseItems, ...tierBasedItems.filter(item => item.available)];
};

// Loading skeleton - only for initial load
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background w-full flex">
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-card">
      <div className="p-6 border-b">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </aside>

    <div className="flex-1 flex flex-col min-w-0">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>

    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t">
      <div className="grid grid-cols-5 gap-1 p-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </nav>
  </div>
);

// Empty state for no profiles
const NoProfilesEmptyState = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-background flex items-center justify-center p-6 md:p-8">
        <div className="text-center space-y-12 max-w-3xl">
          {/* Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
            <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Welcome to Safeari</h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Create your child's profile and take control of their digital safety in minutes.
            </p>
          </div>

          {/* What they'll get - 3 quick benefits with more space */}
          <div className="grid md:grid-cols-3 gap-6 text-left pt-4">
            <div className="p-6 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-base mb-2">Shield from harmful content</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatically block inappropriate sites, adult content, and online threats before they reach your child.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors">
              <BarChart3 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-base mb-2">See their online activity</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Know exactly what sites they visit, when they're most active, and spot concerning patterns early.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-base mb-2">Control screen time</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set daily limits, create schedules, and ensure healthy device habits without constant battles.
              </p>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="space-y-4 pt-4">
            <Button asChild size="lg" className="w-full md:w-auto px-8 h-12 text-base">
              <Link to="/profiles">
                <Users className="h-5 w-5 mr-2" />
                Create Your Child's Profile
              </Link>
            </Button>

            {/* Secondary action */}
            <p className="text-sm text-muted-foreground">
              Need help getting started?{" "}
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </button>
            </p>
          </div>

          {/* Progress indicator with more space */}
          <div className="pt-8 border-t">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-4">What happens next</p>
            <div className="flex items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                  1
                </div>
                <span className="font-medium">Create profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs">
                  2
                </div>
                <span className="text-muted-foreground">Setup device</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs">
                  3
                </div>
                <span className="text-muted-foreground">Start protecting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
    </>
  );
};

// Mobile bottom navigation with "More" dropdown
const MobileBottomNav = ({ items, onFeedbackClick }: { items: any[], onFeedbackClick?: () => void }) => {
  const location = useLocation();
  const mainItems = items.slice(0, 4);
  const moreItems = items.slice(4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="grid grid-cols-5 gap-1 p-2">
        {mainItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}

        {moreItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex flex-col items-center justify-center py-2 px-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-xs mt-1">More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="mb-2 bg-popover">
              {moreItems.map((item) => {
                // Special handling for Help & Feedback
                if (item.href === "#feedback") {
                  return (
                    <DropdownMenuItem key={item.href} onSelect={onFeedbackClick}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                }

                const isActive = location.pathname === item.href;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-2 w-full ${isActive ? "text-primary" : ""
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const { profiles, currentProfile, isLoading: profilesLoading } = useProfile();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasProfilesData, setHasProfilesData] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Onboarding tour - simplified to 2 essential steps
  const dashboardTour = useOnboardingTour({
    tourId: 'dashboard-navigation',
    totalSteps: 2,
    autoStart: true,
    priority: TOUR_PRIORITIES.NAVIGATION,
  });

  const tourSteps = [
    {
      title: "Welcome to Safeari!",
      message: "Use the sidebar (left on desktop, bottom on mobile) to access Analytics, Parental Controls, Security, Privacy & more."
    },
    {
      title: "Need Help?",
      message: "Find Help & Feedback in the sidebar to get support or share your thoughts anytime."
    },
  ];

  // Track when we have definitive profiles data
  useEffect(() => {
    // Consider initial load complete if:
    // 1. Loading finished, OR
    // 2. We have any profiles data (even if still loading)
    if (!profilesLoading || profiles.length > 0) {
      setInitialLoadComplete(true);
      setHasProfilesData(profiles.length > 0);
    }
  }, [profilesLoading, profiles.length]);

  // Memoize navigation items with cached tier fallback
  const navItems = useMemo(() => {
    const cachedTier = localStorage.getItem('cached_tier');
    const tier = subscription?.tier || cachedTier || 'free';
    return getNavItems(tier);
  }, [subscription?.tier]);

  // Show loading state only during true initial load (no cached data)
  // This prevents flashing between states
  if (!initialLoadComplete) {
    return <DashboardSkeleton />;
  }

  // Show empty state if no profiles (and we've finished loading)
  if (!profilesLoading && profiles.length === 0) {
    return <NoProfilesEmptyState />;
  }

  // If we're still loading but have cached profiles, show the dashboard with cached data
  // This prevents the UI from disappearing during background refreshes
  if (profilesLoading && hasProfilesData) {
    // Return the dashboard with existing data while loading in background
    return (
      <div className="min-h-screen bg-background w-full flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:flex lg:flex-col border-r bg-card transition-all duration-300 ease-in-out relative",
          sidebarCollapsed ? "w-20" : "w-64"
        )}>
          <div className={cn(
            "p-6 border-b flex items-center",
            sidebarCollapsed ? "justify-center px-4" : "justify-between"
          )}>
            {!sidebarCollapsed && (
              <Link to="/" className="flex items-center group transition-transform hover:scale-105 duration-300">
                <img src={SafeariFullLogo} alt="Safeari" className="h-11 w-auto" />
              </Link>
            )}
            {sidebarCollapsed && (
              <Link to="/" className="flex items-center justify-center group transition-transform hover:scale-110 duration-300">
                <div className="h-10 w-10 flex items-center justify-center">
                  <img src={SafeariIcon} alt="Safeari" className="h-8 w-8 object-contain" />
                </div>
              </Link>
            )}
          </div>
          <DashboardNav
            items={navItems}
            onFeedbackClick={() => setFeedbackModalOpen(true)}
            isCollapsed={sidebarCollapsed}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-accent absolute -right-4 top-1/2 -translate-y-1/2 z-50 transition-all group-hover:scale-110"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
            {/* Show subtle loading indicator instead of full skeleton */}
            <div className="flex justify-center mb-4">
              <div className="animate-pulse text-sm text-muted-foreground">
                Updating data...
              </div>
            </div>
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav items={navItems} onFeedbackClick={() => setFeedbackModalOpen(true)} />
      </div>
    );
  }

  // Show dashboard with current data
  return (
    <>
      <div className="min-h-screen bg-background w-full flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:flex lg:flex-col border-r bg-card transition-all duration-300 ease-in-out relative",
          sidebarCollapsed ? "w-20" : "w-64"
        )} id="dashboard-sidebar">
          <div className={cn(
            "p-6 border-b flex items-center",
            sidebarCollapsed ? "justify-center px-4" : "justify-between"
          )}>
            {!sidebarCollapsed && (
              <Link to="/" className="flex items-center group transition-transform hover:scale-105 duration-300">
                <img src={SafeariFullLogo} alt="Safeari" className="h-11 w-auto" />
              </Link>
            )}
            {sidebarCollapsed && (
              <Link to="/" className="flex items-center justify-center group transition-transform hover:scale-110 duration-300">
                <div className="h-10 w-10 flex items-center justify-center">
                  <img src={SafeariIcon} alt="Safeari" className="h-8 w-8 object-contain" />
                </div>
              </Link>
            )}
          </div>
          <DashboardNav
            items={navItems}
            onFeedbackClick={() => setFeedbackModalOpen(true)}
            isCollapsed={sidebarCollapsed}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-accent absolute -right-4 top-1/2 -translate-y-1/2 z-50 transition-all hover:scale-110"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />

          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
            {/* Welcome tour tooltip */}
            {dashboardTour.isActive && dashboardTour.currentStep === 1 && (
              <div className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-[9999] px-2">
                <OnboardingTooltip
                  title={tourSteps[0].title}
                  message={tourSteps[0].message}
                  step={dashboardTour.currentStep}
                  totalSteps={dashboardTour.totalSteps}
                  position="bottom"
                  onNext={dashboardTour.nextStep}
                  onSkip={dashboardTour.skipTour}
                  onClose={dashboardTour.skipTour}
                />
              </div>
            )}

            {/* Help & Feedback location tooltip */}
            {dashboardTour.isActive && dashboardTour.currentStep === 2 && (
              <div className="fixed bottom-36 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-auto z-[9999] w-auto md:w-80">
                <OnboardingTooltip
                  title={tourSteps[1].title}
                  message={tourSteps[1].message}
                  step={dashboardTour.currentStep}
                  totalSteps={dashboardTour.totalSteps}
                  position="top"
                  onNext={dashboardTour.nextStep}
                  onSkip={dashboardTour.skipTour}
                  onClose={dashboardTour.skipTour}
                />
              </div>
            )}

            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav items={navItems} onFeedbackClick={() => setFeedbackModalOpen(true)} />
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
    </>
  );
};

export default Dashboard;