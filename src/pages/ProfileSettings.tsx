import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useProfileData } from "@/hooks/queries";
import { updateProfile, deleteProfile } from "@/lib/api";
import type { Profile, UpdateProfileRequest } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DNSSetupDialog from "@/components/profile/DNSSetupDialog";
import SeamlessSection from "@/components/ui/SeamlessSection";

/**
 * Profile Settings Page - Edit current profile details
 */
const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProfile, refreshProfiles } = useProfile();
  const { data: referenceData } = useReferenceData();

  // React Query hook - replaces useEffect + loadProfile
  const { data: profileData, isLoading, error } = useProfileData(currentProfile?.id);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    display_name: "",
    age_preset: "teens",
    is_router_level: false,
  });
  const [dnsSetupOpen, setDnsSetupOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Redirect if no profile selected
  useEffect(() => {
    if (!currentProfile) {
      toast({
        variant: "destructive",
        title: "No Profile Selected",
        description: "Please select a profile first",
      });
      navigate("/profiles");
    }
  }, [currentProfile, navigate, toast]);

  // Initialize form data from React Query data
  useEffect(() => {
    if (profileData) {
      setFormData({
        display_name: profileData.display_name,
        age_preset: profileData.age_preset,
        is_router_level: profileData.is_router_level,
      });
    }
  }, [profileData]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to Load Profile",
        description: error instanceof Error ? error.message : "Unable to load profile settings. Please try again.",
      });
    }
  }, [error, toast]);

  const handleSave = async () => {
    if (!currentProfile) return;

    setIsSaving(true);
    try {
      await updateProfile(currentProfile.id, formData);

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });

      // Background refresh
      refreshProfiles().catch(console.error);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Unable to save changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProfile) return;

    try {
      await deleteProfile(currentProfile.id);
      await refreshProfiles();

      toast({
        title: "Profile Deleted",
        description: `${currentProfile.display_name} has been permanently deleted.`,
      });

      navigate("/profiles");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Unable to delete profile. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData || !currentProfile) {
    return null;
  }

  return (
    <div className="space-y-12 max-w-4xl pb-20">
      {/* Header - Personalized and High Impact */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Manage how Safeari protects <span className="text-primary font-semibold">{currentProfile.display_name}</span>.
        </p>
      </div>

      {/* Profile Information */}
      <SeamlessSection
        title="Identity & Protection"
        description="Core details that define this profile's browsing experience."
      >
        <div className="p-2 sm:p-6 space-y-8 bg-card/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile Name</Label>
              <Input
                id="display-name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Enter profile name"
                disabled={isSaving}
                className="h-12 bg-background border-border/40 rounded-xl focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age-preset" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Protection Level</Label>
              <Select
                value={formData.age_preset}
                onValueChange={(value: any) => setFormData({ ...formData, age_preset: value })}
                disabled={isSaving}
              >
                <SelectTrigger id="age-preset" className="h-12 bg-background border-border/40 rounded-xl focus:ring-primary/20 transition-all font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 shadow-xl">
                  {referenceData?.age_presets && Object.entries(referenceData.age_presets).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="py-3 focus:bg-primary/5 rounded-lg mx-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold">{config.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium italic">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="group flex items-center justify-between p-6 rounded-xl bg-background border border-border/40 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="space-y-1">
              <Label htmlFor="router-level" className="cursor-pointer text-base font-bold tracking-tight">
                Router Level Protection
              </Label>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Enable this if you've configured your entire home network to route through this profile's DNS.
              </p>
            </div>
            <Switch
              id="router-level"
              checked={formData.is_router_level}
              onCheckedChange={(checked) => setFormData({ ...formData, is_router_level: checked })}
              disabled={isSaving}
              className="data-[state=checked]:bg-primary transition-colors"
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="h-12 px-8 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </div>
      </SeamlessSection>

      {/* DNS Setup */}
      <SeamlessSection
        title="Integration Guide"
        description="Step-by-step instructions to apply this profile to your devices."
      >
        <div className="p-2 sm:p-6 bg-card/30">
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h4 className="font-bold text-lg tracking-tight">DNS Settings</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your PC, Mobile, or Router using this profile's unique secure DNS address to start filtering content.
              </p>
            </div>
            <Button
              variant="default"
              className="h-11 px-6 rounded-full font-bold bg-primary hover:bg-primary/90 transition-all"
              onClick={() => setDnsSetupOpen(true)}
            >
              View Setup Guide
            </Button>
          </div>
        </div>
      </SeamlessSection>

      {/* Danger Zone */}
      <SeamlessSection
        title="Danger Zone"
        description="Permanently remove this profile and all associated data."
      >
        <div className="p-2 sm:p-6 bg-rose-500/5">
          <div className="p-6 rounded-xl bg-white/5 border border-rose-500/20 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-bold text-lg tracking-tight">Delete Profile</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                Deletes all parental controls, security settings, and browsing logs.
                <span className="font-bold text-rose-500/80 underline decoration-rose-500/20 underline-offset-4 ml-1">This cannot be undone.</span>
              </p>
            </div>
            <Button
              variant="destructive"
              className="h-11 px-6 rounded-full font-bold shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </SeamlessSection>

      {/* DNS Setup Dialog */}
      <DNSSetupDialog
        open={dnsSetupOpen}
        onOpenChange={setDnsSetupOpen}
        profileId={currentProfile.id}
        profileName={currentProfile.display_name}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentProfile.display_name}"? This will permanently remove:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 my-4">
            <li>• All parental control settings</li>
            <li>• Security and privacy configurations</li>
            <li>• Analytics and query logs</li>
            <li>• Custom allowlist and denylist entries</li>
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileSettings;