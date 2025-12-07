import apiClient from "./client";

// Profile management endpoints
// Handles CRUD ops for user profiles and DNS configurations

export type AgePreset = 'young_kids' | 'tweens' | 'teens' | 'custom';

export interface Profile{
    id: number;
    user_id: string;
    nextdns_profile_id: string;
    display_name: string;
    age_preset: AgePreset;
    is_active: boolean;
    is_router_level: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateProfileRequest {
    display_name: string;
    age_preset: AgePreset;
    is_router_level: boolean;
}

export interface UpdateProfileRequest {
    display_name?: string;
    age_preset?: AgePreset;
    is_router_level?: boolean;
}

// Get all profiles for the authenticated user
// Returns an array of user profiles
export const getProfiles = async (): Promise<Profile[]> => {
    const response = await apiClient.getClient().get<Profile[]>('/api/v1/profiles/');

    return response.data;
}

// Get specific profile details by ID
// @param profileId
// @returns Profile details
export const getProfile = async (profileId: number): Promise<Profile> => {
    const response = await apiClient.getClient().get<Profile>(`/api/v1/profiles/${profileId}/`);

    return response.data;
};

// Create new profile with age-based auto-configs
// @param profileData - Profile creation data
// @returns Newly created profile
export const createProfile = async (profileData: CreateProfileRequest): Promise<Profile> => {
    const response = await apiClient.getClient().post<Profile>('/api/v1/profiles/', profileData);

    return response.data;
};

// full update of profile,all fields required
// @param profileId - Profile ID to update
// @param profileData - Complete profile data
// @returns Updated profile
export const updateProfile = async (profileId: number, profileData: UpdateProfileRequest): Promise<Profile> => {
    const response = await apiClient.getClient().put<Profile>(`/api/v1/profiles/${profileId}/`, profileData);
    
    return response.data;
};

// Partial update of profile,only changed fields
// @param profileId - Profile ID to update
// @param profileData - Partial profile data
// @returns Updated profile
export const patchProfile = async (profileId: number, profileData: Partial<UpdateProfileRequest>): Promise<Profile> => {
    const response = await apiClient.getClient().patch<Profile>(`/api/v1/profiles/${profileId}/`, profileData);
    
    return response.data;
};

// soft delete profile,marks as inactive
// @param profileId - Profile ID to delete
export const deleteProfile = async (profileId: number): Promise<void> => {
    await apiClient.getClient().delete(`/api/v1/profiles/${profileId}/`);
};