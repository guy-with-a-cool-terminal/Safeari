import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, Clock, Lock, Crown } from "lucide-react";
import { useState } from "react";

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  severity: "high" | "medium" | "low";
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  recreationEnabled?: boolean; 
  hasRecreationAccess?: boolean;
  onRecreationChange?: (enabled: boolean) => void;
}

/**
 * Card component for content categories with severity indicators
 */
const CategoryCard = ({ 
  id, 
  name, 
  description,
  severity, 
  checked, 
  onCheckedChange ,
  recreationEnabled = false,
   hasRecreationAccess = false,
  onRecreationChange
}: CategoryCardProps) => {

  const severityConfig = {
    high: {
      badge: "bg-[hsl(var(--severity-high)_/_0.1)] text-[hsl(var(--severity-high))] border-[hsl(var(--severity-high)_/_0.3)]",
      border: "border-l-4 border-l-[hsl(var(--severity-high))]",
      label: "High Risk"
    },
    medium: {
      badge: "bg-[hsl(var(--severity-medium)_/_0.1)] text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium)_/_0.3)]",
      border: "border-l-4 border-l-[hsl(var(--severity-medium))]",
      label: "Moderate"
    },
    low: {
      badge: "bg-[hsl(var(--severity-low)_/_0.1)] text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low)_/_0.3)]",
      border: "border-l-4 border-l-[hsl(var(--severity-low))]",
      label: "Low Priority"
    },
  };

  return (
    <div className="space-y-2">
      <div className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${severityConfig[severity].border}`}>
        <div className="flex-1 space-y-2 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{name}</span>
            <Badge variant="outline" className={severityConfig[severity].badge}>
              {severityConfig[severity].label}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="flex-shrink-0"
        />
      </div>

      {checked && (
        <div className="pl-4 pr-4 pb-2 space-y-2">
          {hasRecreationAccess ? (
            <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={recreationEnabled ? "text-primary font-medium" : "text-muted-foreground"}>
                {recreationEnabled ? "Allowed During Screen Time" : "Blocked All Day"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRecreationChange?.(!recreationEnabled)}
            >
              {recreationEnabled ? "Block All Day" : "Allow During Screen Time"}
            </Button>
          </div>
          {recreationEnabled && (
            <p className="text-xs text-muted-foreground">
              This category will only be accessible during the screen time hours you set below.
            </p>
          )}
          {!recreationEnabled && (
            <p className="text-xs text-muted-foreground">
              This category is completely blocked. Enable screen time to allow access during scheduled hours.
            </p>
          )}
          </>
          ) : (
            // User doesn't have access - show upgrade badge
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-dashed">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Screen time scheduling available on Basic tier</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Basic+
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;