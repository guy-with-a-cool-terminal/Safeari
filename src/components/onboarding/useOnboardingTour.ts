/**
 * Onboarding Tour State Management Hook
 *
 * Manages multi-step tours with localStorage persistence
 * Tracks completion and "don't show again" preferences
 */

import { useState, useEffect, useCallback } from "react";
import { TourCoordinator, TOUR_PRIORITIES } from "./TourCoordinator";

const STORAGE_KEY = "safeari_onboarding_tours";

interface TourState {
  completed: boolean;
  dismissed: boolean;    // User clicked "Skip"
  dontShowAgain: boolean; // User permanently dismissed
  lastStep: number;
}

interface TourStates {
  [tourId: string]: TourState;
}

export interface UseOnboardingTourOptions {
  tourId: string;      // Unique identifier for this tour
  totalSteps: number;  // Number of steps in the tour
  autoStart?: boolean; // Start automatically if not completed (default: true)
  priority?: number;   // Tour priority (higher = more important, default: 5)
}

export const useOnboardingTour = ({
  tourId,
  totalSteps,
  autoStart = true,
  priority = TOUR_PRIORITIES.FEATURE_INTRO,
}: UseOnboardingTourOptions) => {
  const [currentStep, setCurrentStep] = useState(1); // 1-based indexing
  const [isActive, setIsActive] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allStates: TourStates = stored ? JSON.parse(stored) : {};
      const tourState = allStates[tourId];

      if (tourState) {
        if (tourState.dontShowAgain || tourState.completed) {
          // Don't auto-start if user finished or permanently dismissed
          setIsActive(false);
          return;
        } else if (autoStart && !tourState.dismissed) {
          // Request to start tour via coordinator
          const canStart = TourCoordinator.requestTourStart(tourId, priority);
          if (canStart) {
            setCurrentStep(tourState.lastStep || 1);
            setIsActive(true);
          } else {
            // Blocked by higher priority tour
            setIsActive(false);
          }
        }
      } else if (autoStart) {
        // First time - request to start tour via coordinator
        const canStart = TourCoordinator.requestTourStart(tourId, priority);
        if (canStart) {
          setIsActive(true);
        } else {
          // Blocked by higher priority tour
          setIsActive(false);
        }
      }
    } catch (error) {
      console.error("Failed to load tour state:", error);
    }
  }, [tourId, autoStart, priority]);

  // Save state to localStorage
  const saveState = useCallback(
    (updates: Partial<TourState>) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allStates: TourStates = stored ? JSON.parse(stored) : {};

        allStates[tourId] = {
          completed: false,
          dismissed: false,
          dontShowAgain: false,
          lastStep: currentStep,
          ...allStates[tourId],
          ...updates,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allStates));
      } catch (error) {
        console.error("Failed to save tour state:", error);
      }
    },
    [tourId, currentStep]
  );

  // Go to next step
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const nextStepNum = currentStep + 1;
      setCurrentStep(nextStepNum);
      saveState({ lastStep: nextStepNum });
    } else {
      // Reached end - mark as completed and clear from coordinator
      setIsActive(false);
      saveState({ completed: true, lastStep: totalSteps });
      TourCoordinator.clearActiveTour(tourId);
    }
  }, [currentStep, totalSteps, saveState, tourId]);

  // Skip tour (can be restarted later)
  const skipTour = useCallback(() => {
    setIsActive(false);
    saveState({ dismissed: true, lastStep: currentStep });
    TourCoordinator.clearActiveTour(tourId);
  }, [currentStep, saveState, tourId]);

  // Close and never show again
  const dismissPermanently = useCallback(() => {
    setIsActive(false);
    saveState({ dontShowAgain: true, dismissed: true });
    TourCoordinator.clearActiveTour(tourId);
  }, [saveState, tourId]);

  // Start tour (for manual trigger or restart)
  const startTour = useCallback(() => {
    const canStart = TourCoordinator.requestTourStart(tourId, priority);
    if (canStart) {
      setCurrentStep(1);
      setIsActive(true);
      saveState({ lastStep: 1, dismissed: false });
    } else {
      console.warn(`[useOnboardingTour] Cannot start tour ${tourId} - blocked by another tour`);
    }
  }, [saveState, tourId, priority]);

  // Reset tour completely (for testing/debugging)
  const resetTour = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allStates: TourStates = stored ? JSON.parse(stored) : {};
      delete allStates[tourId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allStates));

      TourCoordinator.clearActiveTour(tourId);
      setCurrentStep(1);
      setIsActive(autoStart);
    } catch (error) {
      console.error("Failed to reset tour:", error);
    }
  }, [tourId, autoStart]);

  return {
    // State
    isActive,
    currentStep,
    totalSteps,

    // Actions
    nextStep,
    skipTour,
    dismissPermanently,
    startTour,
    resetTour,
  };
};

/**
 * Utility: Reset all tours (for testing)
 */
export const resetAllTours = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset all tours:", error);
  }
};

/**
 * Utility: Check if tour is completed
 */
export const isTourCompleted = (tourId: string): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allStates: TourStates = stored ? JSON.parse(stored) : {};
    return allStates[tourId]?.completed || false;
  } catch {
    return false;
  }
};

// Re-export TOUR_PRIORITIES for convenience
export { TOUR_PRIORITIES } from "./TourCoordinator";

export default useOnboardingTour;
