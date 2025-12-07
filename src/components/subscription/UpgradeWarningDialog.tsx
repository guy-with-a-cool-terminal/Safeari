import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { SubscriptionTier } from "@/lib/api/types";

interface UpgradeWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  currentTier: SubscriptionTier | null;
  newTier: SubscriptionTier;
  isDowngrade: boolean;
}

export const UpgradeWarningDialog = ({
  open,
  onOpenChange,
  onConfirm,
  currentTier,
  newTier,
  isDowngrade
}: UpgradeWarningDialogProps) => {
  
  const getFeatureComparison = () => {
    if (!currentTier) return [];
    
    const comparison: { feature: string; current: any; new: any; isLoss: boolean }[] = [];
    
    // Profile limit comparison
    if (currentTier.max_profiles !== newTier.max_profiles) {
      comparison.push({
        feature: "Profile Limit",
        current: currentTier.max_profiles === -1 ? "Unlimited" : currentTier.max_profiles,
        new: newTier.max_profiles === -1 ? "Unlimited" : newTier.max_profiles,
        isLoss: currentTier.max_profiles > newTier.max_profiles || (currentTier.max_profiles === -1 && newTier.max_profiles !== -1)
      });
    }
    
    return comparison;
  };

  const featureChanges = getFeatureComparison();
  const hasFeatureLoss = featureChanges.some(f => f.isLoss);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            {isDowngrade ? "Confirm Downgrade" : "Confirm Plan Change"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Please review the following changes to your subscription before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan Change Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <Badge variant="outline" className="mt-1">{currentTier?.name || "Free"}</Badge>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div>
              <p className="text-sm text-muted-foreground">New Plan</p>
              <Badge variant="default" className="mt-1">{newTier.name}</Badge>
            </div>
          </div>

          {/* Feature Changes */}
          {featureChanges.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Plan Changes:</p>
              {featureChanges.map((change, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    {change.isLoss ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">{change.feature}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {change.current} → {change.new}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warning Alerts */}
          {isDowngrade && hasFeatureLoss && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Downgrading will immediately reduce your available features. 
                If you exceed the new limits (e.g., number of profiles), some features may be disabled until you adjust your usage.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="space-y-2">
              <p className="font-medium">Important Terms:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>No refunds:</strong> Changes take effect immediately. No refunds for unused time on your current plan.</li>
                <li><strong>Immediate changes:</strong> Your plan features will update as soon as payment is confirmed.</li>
                <li><strong>Billing:</strong> You'll be charged the new plan amount.</li>
                {isDowngrade && <li><strong>Feature loss:</strong> Some features will be removed immediately upon downgrade.</li>}
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isDowngrade && hasFeatureLoss ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isDowngrade ? "Confirm Downgrade" : "Confirm Upgrade"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
