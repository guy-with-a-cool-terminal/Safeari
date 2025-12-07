/**
 * Tour Manager Component
 * 
 * Provides a floating help button that allows users to:
 * - Restart completed tours
 * - View available tours
 * - Access help documentation
 */

import { useState } from "react";
import { HelpCircle, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isTourCompleted, resetAllTours } from "./useOnboardingTour";
import { useToast } from "@/hooks/use-toast";

interface Tour {
  id: string;
  name: string;
  description: string;
  page: string;
}

const AVAILABLE_TOURS: Tour[] = [
  {
    id: "dashboard-navigation",
    name: "Dashboard & Analytics",
    description: "Navigate the dashboard and understand analytics",
    page: "/dashboard",
  },
  {
    id: "profiles-page",
    name: "Profile Management",
    description: "Create and manage family profiles",
    page: "/profiles",
  },
  {
    id: "parental-controls",
    name: "Parental Controls",
    description: "Block apps and set content filters",
    page: "/dashboard/parental",
  },
  {
    id: "security-settings",
    name: "Security Settings",
    description: "Advanced threat protection",
    page: "/dashboard/security",
  },
  {
    id: "privacy-settings",
    name: "Privacy Settings",
    description: "Block trackers and ads",
    page: "/dashboard/privacy",
  },
  {
    id: "custom-lists",
    name: "Custom Lists",
    description: "Manage allow and deny lists",
    page: "/dashboard/lists",
  },
];

export const TourManager = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const restartTour = (tourId: string, tourName: string, page: string) => {
    try {
      // Remove specific tour from localStorage
      const stored = localStorage.getItem("safeari_onboarding_tours");
      if (stored) {
        const allStates = JSON.parse(stored);
        delete allStates[tourId];
        localStorage.setItem("safeari_onboarding_tours", JSON.stringify(allStates));
      }

      setOpen(false);
      
      toast({
        title: "Tour Restarted",
        description: `${tourName} will restart when you visit ${page}`,
      });

      // Reload page if we're on the tour page
      if (window.location.pathname.includes(page) || page === window.location.pathname) {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error("Failed to restart tour:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restart tour. Please try again.",
      });
    }
  };

  const restartAllTours = () => {
    try {
      resetAllTours();
      setOpen(false);
      
      toast({
        title: "All Tours Reset",
        description: "All onboarding tours will restart when you visit their pages",
      });

      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Failed to reset tours:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset tours. Please try again.",
      });
    }
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
            aria-label="Help & Tours"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-72 max-h-96 overflow-y-auto mb-2">
          <DropdownMenuLabel>Help & Tutorials</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Available Tours
          </div>

          {AVAILABLE_TOURS.map((tour) => {
            const isCompleted = isTourCompleted(tour.id);
            
            return (
              <DropdownMenuItem
                key={tour.id}
                onClick={() => restartTour(tour.id, tour.name, tour.page)}
                className="flex items-start gap-3 py-3 cursor-pointer"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{tour.name}</div>
                  <div className="text-xs text-muted-foreground">{tour.description}</div>
                  <div className="text-xs text-primary mt-1">
                    {isCompleted ? "Completed • Click to restart" : "Click to start"}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={restartAllTours}
            className="flex items-center gap-2 text-destructive cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="font-medium">Reset All Tours</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TourManager;
