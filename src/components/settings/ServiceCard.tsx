import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Clock, Lock, Crown } from "lucide-react";

interface ServiceCardProps {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon: LucideIcon;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  recreationEnabled?: boolean;
  hasRecreationAccess?: boolean;
  onRecreationChange?: (enabled: boolean) => void;
}

/**
 * Card component for blocking services/apps
 */
const ServiceCard = ({ 
  id, 
  name, 
  description,
  category,
  icon: Icon, 
  checked, 
  onCheckedChange,
  recreationEnabled = false,
  hasRecreationAccess = false,
  onRecreationChange 
}: ServiceCardProps) => {

  /* Map categories to severity levels - visual priority system */
  const categoryColors: Record<string, string> = {
    social: "bg-[hsl(var(--severity-medium)_/_0.1)] text-[hsl(var(--severity-medium))]",
    video: "bg-[hsl(var(--severity-low)_/_0.1)] text-[hsl(var(--severity-low))]",
    music: "bg-[hsl(var(--severity-low)_/_0.1)] text-[hsl(var(--severity-low))]",
    messaging: "bg-[hsl(var(--severity-medium)_/_0.1)] text-[hsl(var(--severity-medium))]",
    gaming: "bg-[hsl(var(--severity-medium)_/_0.1)] text-[hsl(var(--severity-medium))]",
    dating: "bg-[hsl(var(--severity-high)_/_0.1)] text-[hsl(var(--severity-high))]",
    shopping: "bg-[hsl(var(--severity-low)_/_0.1)] text-[hsl(var(--severity-low))]",
    ai: "bg-[hsl(var(--severity-low)_/_0.1)] text-[hsl(var(--severity-low))]",
  };

  /* Map categories to severity borders - visual consistency with CategoryCard */
  const categoryBorders: Record<string, string> = {
    social: "border-l-4 border-l-[hsl(var(--severity-medium))]",
    messaging: "border-l-4 border-l-[hsl(var(--severity-medium))]",
    gaming: "border-l-4 border-l-[hsl(var(--severity-medium))]",
    dating: "border-l-4 border-l-[hsl(var(--severity-high))]",
    video: "border-l-4 border-l-[hsl(var(--severity-low))]",
    music: "border-l-4 border-l-[hsl(var(--severity-low))]",
    shopping: "border-l-4 border-l-[hsl(var(--severity-low))]",
    ai: "border-l-4 border-l-[hsl(var(--severity-low))]",
  };

  const borderClass = category ? (categoryBorders[category] || "") : "";

  return (
    <div className="space-y-2">
      <div className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${borderClass}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-md bg-primary/10 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{name}</span>
              {category && (
                <Badge 
                  variant="secondary" 
                  className={categoryColors[category] || "bg-secondary"}
                >
                  {category}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="flex-shrink-0 ml-3"
        />
      </div>

      {/* Recreation Schedule Controls - Available when service is blocked */}
      {checked && (
        <div className="pl-4 pr-4 pb-2 space-y-2">
          {hasRecreationAccess ? (
            // User has access - show full controls
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
                  This service will only be accessible during the screen time hours you set below.
                </p>
              )}
              {!recreationEnabled && (
                <p className="text-xs text-muted-foreground">
                  This service is completely blocked. Enable screen time to allow access during scheduled hours.
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

export default ServiceCard;