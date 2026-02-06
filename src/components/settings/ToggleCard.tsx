import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToggleCardProps {
  id: string;
  label: string | React.ReactNode;
  description?: string;
  tooltip?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable toggle card component for settings pages
 * Features: label, description, optional tooltip, disabled state
 */
const ToggleCard = ({
  id,
  label,
  description,
  tooltip,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: ToggleCardProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200",
      className
    )}>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
};

export default ToggleCard;
