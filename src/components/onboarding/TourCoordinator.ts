/**
 * Tour Coordinator Service
 *
 * Ensures only one onboarding tour is active at a time.
 * Prevents tour conflicts and overlapping tooltips.
 */

const ACTIVE_TOUR_KEY = 'safeari_active_tour';

export interface TourPriority {
  tourId: string;
  priority: number; // Higher = more important (1 = lowest, 10 = highest)
  startedAt: number;
}

/**
 * Tour Priority Levels
 */
export const TOUR_PRIORITIES = {
  NAVIGATION: 10,      // Dashboard navigation (highest)
  FIRST_VISIT: 9,      // First-time page visits
  FEATURE_INTRO: 5,    // Feature introductions
  OPTIONAL: 1,         // Optional tours
} as const;

class TourCoordinatorService {
  private listeners: Set<(activeTour: string | null) => void> = new Set();

  /**
   * Get the currently active tour ID
   */
  getActiveTour(): string | null {
    try {
      const stored = localStorage.getItem(ACTIVE_TOUR_KEY);
      if (!stored) return null;

      const data: TourPriority = JSON.parse(stored);

      // Check if tour is stale (older than 3 minutes - allows navigation to new pages)
      const threeMinutesAgo = Date.now() - (3 * 60 * 1000);
      if (data.startedAt < threeMinutesAgo) {
        this.clearActiveTour();
        return null;
      }

      return data.tourId;
    } catch {
      return null;
    }
  }

  /**
   * Request to start a tour
   * Returns true if tour can start, false if blocked by another tour
   */
  requestTourStart(tourId: string, priority: number): boolean {
    const currentTour = this.getActiveTour();

    // No active tour - allow start
    if (!currentTour) {
      this.setActiveTour(tourId, priority);
      return true;
    }

    // Same tour already active - allow (for refresh/reload scenarios)
    if (currentTour === tourId) {
      return true;
    }

    // Different tour active - check priority
    try {
      const stored = localStorage.getItem(ACTIVE_TOUR_KEY);
      if (!stored) {
        this.setActiveTour(tourId, priority);
        return true;
      }

      const currentData: TourPriority = JSON.parse(stored);

      // Allow override if:
      // 1. Higher priority tour
      // 2. Page-specific tour overriding navigation tour (user navigated to a new page)
      // 3. Different page tours (allow switching between pages)
      const isNavigationTourActive = currentTour === 'dashboard-navigation';
      const isPageTourRequesting = tourId !== 'dashboard-navigation' && tourId !== 'profiles-page';
      const allowPageOverride = isNavigationTourActive && isPageTourRequesting;

      if (priority > currentData.priority || allowPageOverride) {
        console.log(`[TourCoordinator] Overriding tour ${currentTour} (priority ${currentData.priority}) with ${tourId} (priority ${priority})`);
        this.setActiveTour(tourId, priority);
        return true;
      }

      // Lower priority - blocked (unless it's a different page tour)
      console.log(`[TourCoordinator] Tour ${tourId} blocked by active tour ${currentTour}`);
      return false;
    } catch {
      this.setActiveTour(tourId, priority);
      return true;
    }
  }

  /**
   * Set the active tour
   */
  private setActiveTour(tourId: string, priority: number): void {
    const data: TourPriority = {
      tourId,
      priority,
      startedAt: Date.now(),
    };

    localStorage.setItem(ACTIVE_TOUR_KEY, JSON.stringify(data));
    this.notifyListeners(tourId);
  }

  /**
   * Clear the active tour (called when tour completes or is skipped)
   */
  clearActiveTour(tourId?: string): void {
    // Only clear if the specified tourId matches the active tour
    if (tourId) {
      const currentTour = this.getActiveTour();
      if (currentTour !== tourId) {
        // Different tour is active, don't clear
        return;
      }
    }

    localStorage.removeItem(ACTIVE_TOUR_KEY);
    this.notifyListeners(null);
  }

  /**
   * Subscribe to active tour changes
   */
  subscribe(callback: (activeTour: string | null) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of tour change
   */
  private notifyListeners(activeTour: string | null): void {
    this.listeners.forEach(callback => callback(activeTour));
  }

  /**
   * Force clear all tours (for debugging)
   */
  resetAll(): void {
    localStorage.removeItem(ACTIVE_TOUR_KEY);
    this.notifyListeners(null);
  }
}

// Export singleton instance
export const TourCoordinator = new TourCoordinatorService();
