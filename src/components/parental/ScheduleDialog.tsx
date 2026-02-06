import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Info } from "lucide-react";
import RecreationSchedule from "@/components/parental/RecreationSchedule";
import BrandLogo from "@/components/parental/BrandLogo";

interface ScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    id: string;
    category?: string;
    isService?: boolean;
    recreationEnabled: boolean;
    onRecreationToggle: (enabled: boolean) => void;
    onSave: () => void;
}

/**
 * Unified dialog for managing screen time schedules for services or categories
 */
const ScheduleDialog = ({
    open,
    onOpenChange,
    title,
    id,
    category,
    isService = true,
    recreationEnabled,
    onRecreationToggle,
    onSave
}: ScheduleDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        {isService ? (
                            <BrandLogo id={id} name={title} className="h-12 w-12 p-2 bg-accent/50" />
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                        )}
                        <div>
                            <DialogTitle className="text-2xl">{title}</DialogTitle>
                            <DialogDescription>
                                Customize screen time hours for this {isService ? 'service' : 'category'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50">
                        <div className="space-y-0.5">
                            <div className="text-sm font-medium">Allow During Screen Time</div>
                            <div className="text-xs text-muted-foreground">
                                Set active hours when this {isService ? 'service' : 'category'} is accessible
                            </div>
                        </div>
                        <Switch
                            checked={recreationEnabled}
                            onCheckedChange={onRecreationToggle}
                        />
                    </div>

                    {recreationEnabled && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium px-1">
                                <Clock className="h-4 w-4 text-primary" />
                                Schedule Configuration
                            </div>
                            <div className="rounded-xl border border-border/50 bg-card p-4">
                                <RecreationSchedule hideHeader />
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400">
                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    The schedule below applies to all services and categories marked as "Allowed During Screen Time".
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSave}>
                        Apply Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleDialog;
