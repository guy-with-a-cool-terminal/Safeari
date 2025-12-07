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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import DNSSetupDialog from "@/components/profile/DNSSetupDialog";
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
      // Revert on error
      try {
        const profile = await getProfile(currentProfile.id);
        setProfileData(profile);
        setFormData({
          display_name: profile.display_name,
          age_preset: profile.age_preset,
          is_router_level: profile.is_router_level,
        });
      } catch {}
      
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage {currentProfile.display_name}'s configuration
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update basic profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">Profile Name</Label>
            <Input
              id="display-name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Enter profile name"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age-preset">Protection Level</Label>
            <Select
              value={formData.age_preset}
              onValueChange={(value: any) => setFormData({ ...formData, age_preset: value })}
              disabled={isSaving}
            >
              <SelectTrigger id="age-preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {referenceData?.age_presets && Object.entries(referenceData.age_presets).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name} - {config.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="space-y-1">
              <Label htmlFor="router-level" className="cursor-pointer">
                Router Level Protection
              </Label>
              <p className="text-sm text-muted-foreground">
                Apply settings to all devices on your network
              </p>
            </div>
            <Switch
              id="router-level"
              checked={formData.is_router_level}
              onCheckedChange={(checked) => setFormData({ ...formData, is_router_level: checked })}
              disabled={isSaving}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* DNS Setup */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
          <CardDescription>Configure DNS for this profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setDnsSetupOpen(true)}
          >
            View DNS Setup Instructions
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for this profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Deleting this profile will permanently remove all settings, analytics, and configuration. 
            This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Profile
          </Button>
        </CardContent>
      </Card>

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