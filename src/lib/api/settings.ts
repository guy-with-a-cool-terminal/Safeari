import apiClient from "./client";

// Parental, security and privacy settings endpoints
// Handles profile-specific configuration management

// Parental Controls
export interface ParentalControlsData {
    safeSearch: boolean;
    youtubeRestrictedMode: boolean;
    blockBypass: boolean;
    services: any[];
    categories: any[];
    recreation: {
        times: any;
        timezone: string | null;
    };
}

export interface UpdateParentalControlsRequest {
    safe_search?: boolean;
    youtube_restricted_mode?: boolean;
    block_bypass?: boolean;
    services?: Array<{ id: string; active: boolean }>;
    categories?: Array<{ id: string; active: boolean }>;
}

// Recreation Time
export interface RecreationScheduleData {
  times: Record<string, { start: string; end: string }>;
  timezone: string | null;
}

export interface UpdateRecreationScheduleRequest {
  timezone: string;
  times: Record<string, { start: string; end: string }>;
}
// Security Settings
export interface SecuritySettingsData {
    threatIntelligenceFeeds: boolean;
    aiThreatDetection: boolean;
    googleSafeBrowsing: boolean;
    cryptojacking: boolean;
    dnsRebinding: boolean;
    idnHomographs: boolean;
    typosquatting: boolean;
    dga: boolean;
    nrd: boolean;
    ddns: boolean;
    parking: boolean;
    csam: boolean;
    tlds: any[];
}

export interface UpdateSecuritySettingsRequest {
    threat_intelligence_feeds?: boolean;
    ai_threat_detection?: boolean;
    google_safe_browsing?: boolean;
    cryptojacking?: boolean;
    dns_rebinding?: boolean;
    idn_homographs?: boolean;
    typosquatting?: boolean;
    dga?: boolean;
    nrd?: boolean;
    ddns?: boolean;
    parking?: boolean;
    csam?: boolean;
    tlds?: Array<{ id: string }>; 
}

// Privacy Settings
export interface Blocklist {
    id: string;
    name: string | null;
    website: string | null;
    description: string | null;
    entries: number;
    updatedOn: string;
}

export interface NativeTracker {
    id: string;
}

export interface PrivacySettingsData {
    disguisedTrackers: boolean;
    allowAffiliate: boolean;
    blocklists: Blocklist[];
    natives: NativeTracker[];
}

export interface UpdatePrivacySettingsRequest {
  disguised_trackers?: boolean;
  allow_affiliate?: boolean;
  blocklists?: Array<{ id: string }>;
  natives?: Array<{ id: string }>;
}

// Get parental control settings for a profile
// @param profileId
// @returns Parental control configuration
export const getParentalControls = async (profileId: number): Promise<ParentalControlsData> => {
    const response = await apiClient.getClient().get<{ data: ParentalControlsData }>(`/api/v1/profiles/${profileId}/parental_controls/`);
    
    return response.data.data;
};

// Update parental control settings
// @param profileId
// @param settings - Settings to update
// @returns Success status
export const updateParentalControls = async (profileId: number, settings: UpdateParentalControlsRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().patch<{ success: boolean }>(`/api/v1/profiles/${profileId}/parental_controls/`, settings);
    
    return response.data;
};

// Get recreation schedule
export const getRecreationSchedule = async (profileId: number): Promise<RecreationScheduleData> => {
  const response = await apiClient.getClient().get<RecreationScheduleData>(
    `/api/v1/profiles/${profileId}/parental_controls/recreation/`
  );

  return response.data;
};

// Update recreation schedule
export const updateRecreationSchedule = async (
  profileId: number, 
  schedule: UpdateRecreationScheduleRequest

): Promise<{ success: boolean }> => {
  const response = await apiClient.getClient().patch<{ success: boolean }>(
    `/api/v1/profiles/${profileId}/parental_controls/recreation/`,
    schedule
  );

  return response.data;
};

// Get security settings for a profile
// @param profileId
// @returns Security configuration
export const getSecuritySettings = async (profileId: number): Promise<SecuritySettingsData> => {
    const response = await apiClient.getClient().get<{ data: SecuritySettingsData }>(`/api/v1/profiles/${profileId}/security_settings/`);
    
    return response.data.data;
};

// Update security settings
// @param profileId
// @param settings - Settings to update
// @returns Success status
export const updateSecuritySettings = async (profileId: number, settings: UpdateSecuritySettingsRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().patch<{ success: boolean }>(`/api/v1/profiles/${profileId}/security_settings/`, settings);
    
    return response.data;
};

// Get privacy settings for a profile
// @param profileId
// @returns Privacy configuration
export const getPrivacySettings = async (profileId: number): Promise<PrivacySettingsData> => {
    const response = await apiClient.getClient().get<{ data: PrivacySettingsData }>(`/api/v1/profiles/${profileId}/privacy_settings/`);
    
    return response.data.data;
};

// Update privacy settings
// @param profileId
// @param settings - Settings to update
// @returns Success status
export const updatePrivacySettings = async (profileId: number, settings: UpdatePrivacySettingsRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().patch<{ success: boolean }>(`/api/v1/profiles/${profileId}/privacy_settings/`, settings);
    
    return response.data;
};