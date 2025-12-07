import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, AlertTriangle } from "lucide-react";

interface ExportConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  format: 'json' | 'csv';
  profileName: string;
  isExporting: boolean;
}

const ExportConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  format,
  profileName,
  isExporting,
}: ExportConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export Analytics Data
          </DialogTitle>
          <DialogDescription>
            Export {profileName}'s activity logs as {format.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">Export Limits</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Up to 1,000 most recent log entries</li>
                <li>Large exports may take a moment to prepare</li>
                <li>File will download automatically when ready</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            The export will include:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Timestamps</li>
              <li>Domains accessed</li>
              <li>Block/Allow status</li>
              <li>Block reasons (if applicable)</li>
              <li>Device information</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportConfirmDialog;