import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getProfiles, isAuthenticated, createProfile } from '@/lib/api';
import type { Profile } from '@/lib/api/types';

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  refreshProfiles: () => Promise<void>;
  addProfileOptimistically: (profileData: any) => Promise<Profile>;
  clearProfileData: () => void; // New method to clear on logout
  isLoading: boolean;
  error: Error | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  // Simple state - no module-level cache needed
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch profiles from API
  const refreshProfiles = useCallback(async (): Promise<void> => {
    if (!isAuthenticated()) {
      setProfiles([]);
      setCurrentProfileState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedProfiles = await getProfiles();
      setProfiles(fetchedProfiles);

      // No profiles - clear everything
      if (!fetchedProfiles || fetchedProfiles.length === 0) {
        setCurrentProfileState(null);
        localStorage.removeItem('lastViewedProfileId');
        return;
      }

      // Profile selection logic: saved > first
      let profileToSet: Profile | null = null;

      // 1. Restore from localStorage (persists after logout/login)
      const savedProfileId = localStorage.getItem('lastViewedProfileId');
      if (savedProfileId) {
        const savedProfile = fetchedProfiles.find(p => p.id === parseInt(savedProfileId));
        if (savedProfile) {
          profileToSet = savedProfile;
        }
      }

      // 2. Default to first profile
      if (!profileToSet && fetchedProfiles.length > 0) {
        profileToSet = fetchedProfiles[0];
      }

      // Set selected profile and save to localStorage
      if (profileToSet) {
        setCurrentProfileState(profileToSet);
        localStorage.setItem('lastViewedProfileId', profileToSet.id.toString());
      }

    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - stable function

  // Initialize profiles on mount only
  useEffect(() => {
    const initializeProfiles = async () => {
      if (!isAuthenticated()) {
        // User logged out - clear all data
        setProfiles([]);
        setCurrentProfileState(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      await refreshProfiles();
    };

    initializeProfiles();
  }, [refreshProfiles]);

  // Optimistic profile creation - show immediately, replace with real data when API responds
  const addProfileOptimistically = useCallback(async (profileData: any): Promise<Profile> => {
    // Temporary profile with id: 0 (replaced after API call)
    const tempProfile: Profile = {
      id: 0,
      user_id: '',
      nextdns_profile_id: '',
      display_name: profileData.display_name,
      age_preset: profileData.age_preset,
      is_active: true,
      is_router_level: profileData.is_router_level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    // Add temp profile to UI immediately
    setProfiles(prev => [...prev, tempProfile]);
    
    try {
      // Background API call
      const realProfile = await createProfile(profileData);
      
      // Replace temp profile (id: 0) with real one from API
      setProfiles(prev => prev.map(p => p.id === 0 ? realProfile : p));

      // Auto-select the new profile
      setCurrentProfileState(realProfile);
      localStorage.setItem('lastViewedProfileId', realProfile.id.toString());

      return realProfile;
    } catch (error) {
      // Rollback - remove temp profile on failure
      setProfiles(prev => prev.filter(p => p.id !== 0));
      throw error;
    }
  }, []);

  // Switch current profile and persist to localStorage
  const setCurrentProfile = useCallback((profile: Profile | null) => {
    if (profile) {
      setCurrentProfileState(profile);
      localStorage.setItem('lastViewedProfileId', profile.id.toString());
    } else {
      setCurrentProfileState(null);
      localStorage.removeItem('lastViewedProfileId');
    }
  }, []);

  // Clear all profile data on logout - prevents old data showing to new users
  const clearProfileData = useCallback(() => {
    setProfiles([]);
    setCurrentProfileState(null);
    setIsLoading(false);
    setError(null);
    localStorage.removeItem('lastViewedProfileId');
  }, []);

  const value: ProfileContextType = {
    profiles,
    currentProfile,
    setCurrentProfile,
    refreshProfiles,
    addProfileOptimistically,
    clearProfileData,
    isLoading,
    error,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};