import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandLogo from "./BrandLogo";

interface CategoryRowProps {
    id: string;
    name: string;
    description?: string;
    severity: "high" | "medium" | "low";
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    recreationEnabled?: boolean;
    hasRecreationAccess?: boolean;
    onScheduleClick?: () => void;
}

/**
 * Minimal floating row component for content categories
 * Replaces heavy CategoryCard with clean horizontal layout
 */
const CategoryRow = ({
    id,
    name,
    description,
    severity,
    checked,
    onCheckedChange,
    recreationEnabled = false,
    hasRecreationAccess = false,
    onScheduleClick
}: CategoryRowProps) => {

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
        <div className={cn(
            "flex items-center justify-between p-4 transition-all duration-200 hover:bg-accent/5 group",
            severityConfig[severity].border
        )}>
            {/* Left: Logo + Name + Severity Badge + Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Category Logo/Icon */}
                <BrandLogo
                    id={id}
                    name={name}
                    className="h-10 w-10 p-2 bg-accent/30 rounded-lg shrink-0 grayscale-[0.2] group-hover:grayscale-0 transition-all"
                />

                {/* Category Name */}
                <span className="font-semibold text-base tracking-tight truncate">{name}</span>

                {/* Severity Badge */}
                <Badge variant="outline" className={cn(severityConfig[severity].badge, "flex-shrink-0 text-[10px] h-4 px-1.5 uppercase font-bold tracking-wider")}>
                    {severityConfig[severity].label}
                </Badge>

                {/* Info Icon with Tooltip */}
                {description && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                                    aria-label="Show description"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-sm">{description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Schedule Button - Only show when category is blocked and user has access */}
                {checked && hasRecreationAccess && onScheduleClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                        onClick={onScheduleClick}
                        aria-label="Set screen time schedule"
                    >
                        <Clock className="h-4 w-4" />
                    </Button>
                )}

                {/* Toggle Switch */}
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    className="data-[state=checked]:bg-primary"
                    aria-label={`${checked ? 'Unblock' : 'Block'} ${name}`}
                />
            </div>
        </div>
    );
};

export default CategoryRow;
