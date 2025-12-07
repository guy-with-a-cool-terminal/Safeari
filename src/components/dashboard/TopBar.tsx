import { ChevronDown, User, LogOut, CreditCard, Plus, Loader2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import CreateProfileDialog from "@/components/profile/CreateProfileDialog";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { useState } from "react";

/**
 * INTEGRATION NOTES
 * - Uses ProfileContext for real profile data
 * - Uses AuthContext for logout functionality
 * - Profile switching updates global state
 * - Added visual feedback and loading states
 */
const TopBar = () => {
  const { logout } = useAuth();
  const { profiles, currentProfile, setCurrentProfile, isLoading } = useProfile();
  const { subscription } = useSubscription();
  const [switchingProfileId, setSwitchingProfileId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Calculate profile usage
  const maxProfiles = subscription?.tier === 'premium' ? -1 : 
                     subscription?.tier === 'family' ? 10 :
                     subscription?.tier === 'basic' ? 3 : 1;
  const usedProfiles = profiles.length;
  const canCreateMore = maxProfiles === -1 || usedProfiles < maxProfiles;
  const profileUsageText = maxProfiles === -1 ? 'Unlimited' : `${usedProfiles}/${maxProfiles}`;

  const handleProfileSwitch = async (profile: any) => {
    setSwitchingProfileId(profile.id);
    
    // Close dropdown immediately for better UX
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCurrentProfile(profile);
    setSwitchingProfileId(null);
  };

  const handleProfileCreated = (profile: any) => {
    setCreateDialogOpen(false);
    // ProfileContext will refresh automatically
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Profile Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading...</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium truncate">
                      {currentProfile?.display_name || "Select Profile"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-popover">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Switch Profile</span>
                <Badge variant="secondary" className="text-xs">
                  {profileUsageText}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Profile List */}
              <div className="max-h-60 overflow-y-auto">
                {profiles.map((profile, index) => {
                  /* Phase 1: Each profile gets a distinct color indicator */
                  const profileColorIndex = (index % 5) + 1;
                  const profileColorVar = `--profile-${profileColorIndex}`;

                  return (
                    <DropdownMenuItem
                      key={profile.id}
                      onClick={() => handleProfileSwitch(profile)}
                      disabled={switchingProfileId === profile.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Phase 1: Colored circle for each profile */}
                        <div
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `hsl(var(${profileColorVar}))` }}
                        />
                        <span className="truncate">{profile.display_name}</span>
                        {profile.is_router_level && (
                          <Badge variant="outline" className="text-xs shrink-0">Router</Badge>
                        )}
                      </div>
                      {switchingProfileId === profile.id && (
                        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                      )}
                      {currentProfile?.id === profile.id && switchingProfileId !== profile.id && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              {/* Create Profile Option */}
              {canCreateMore && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2 py-2">
                    <Plus className="h-4 w-4" />
                    <span>Create New Profile</span>
                  </DropdownMenuItem>
                </>
              )}

              {/* Profile Limit Warning */}
              {!canCreateMore && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs text-muted-foreground text-center border border-amber-200 bg-amber-50 rounded">
                    Profile limit reached
                  </div>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profiles" className="flex items-center gap-2 cursor-pointer">
                  <span>Manage All Profiles</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle & Account Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account/subscription" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Subscription</span>
                  {subscription?.tier && (
                    <Badge variant="secondary" className="ml-auto text-xs capitalize">
                      {subscription.tier}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFeedbackModalOpen(true)} className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Help & Feedback</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Create Profile Dialog */}
      <CreateProfileDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProfileCreated={handleProfileCreated}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
    </>
  );
};

export default TopBar;