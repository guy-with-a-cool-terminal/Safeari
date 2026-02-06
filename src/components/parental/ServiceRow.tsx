import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, Info, Clock } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface ServiceRowProps {
    id: string;
    name: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    recreationEnabled?: boolean;
    hasRecreationAccess?: boolean;
    onScheduleClick?: () => void;
}

/**
 * Minimal floating row component for services/apps
 * Replaces heavy ServiceCard with clean horizontal layout
 */
const ServiceRow = ({
    id,
    name,
    description,
    checked,
    onCheckedChange,
    recreationEnabled = false,
    hasRecreationAccess = false,
    onScheduleClick
}: ServiceRowProps) => {
    return (
        <div className="flex items-center justify-between p-3 px-4 my-1 rounded-xl border border-transparent hover:border-border/40 hover:bg-accent/40 hover:shadow-sm transition-all duration-200 group">
            {/* Left: Logo + Name + Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Brand Logo or Fallback Icon */}
                <BrandLogo
                    id={id}
                    name={name}
                    className="h-10 w-10 p-2 bg-accent/30 grayscale-[0.2] transition-all group-hover:grayscale-0 group-hover:scale-105"
                />

                {/* Service Name */}
                <span className="font-medium truncate">{name}</span>

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
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Schedule Button - Only show when service is blocked and user has access */}
                {checked && hasRecreationAccess && onScheduleClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
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
                    aria-label={`${checked ? 'Unblock' : 'Block'} ${name}`}
                />
            </div>
        </div>
    );
};

export default ServiceRow;
