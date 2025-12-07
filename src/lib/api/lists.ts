import apiClient from "./client";

// Custom allowlist and denylist management endpoints
// Handles domain blocking and allowing for profiles

export interface DomainEntry {
    id: string;
    active: boolean;
}

export interface DomainListResponse {
    domains: DomainEntry[];
}

export interface UpdateDomainsRequest {
    domains: string[];
}

// Get allowlisted domains for a profile
// @param profileId
// @returns Array of allowed domains
export const getAllowlist = async (profileId: number): Promise<DomainListResponse> => {
    const response = await apiClient.getClient().get<DomainListResponse>(`/api/v1/profiles/${profileId}/allowlist/`);
    
    return response.data;
};

// Add domains to allowlist (bulk or single)
// @param profileId
// @param domains - Array of domains to allow
// @returns Success status
export const addToAllowlist = async (profileId: number, domains: string[]): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().post<{ success: boolean }>(`/api/v1/profiles/${profileId}/allowlist/`, { domains });
    
    return response.data;
};

// Remove domains from allowlist (bulk or single)
// @param profileId
// @param domains - Array of domains to remove
// @returns Success status
export const removeFromAllowlist = async (profileId: number, domains: string[]): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().delete<{ success: boolean }>(`/api/v1/profiles/${profileId}/allowlist/`, { data: { domains } });
    
    return response.data;
};

// Get denylisted domains for a profile
// @param profileId
// @returns Array of blocked domains
export const getDenylist = async (profileId: number): Promise<DomainListResponse> => {
    const response = await apiClient.getClient().get<DomainListResponse>(`/api/v1/profiles/${profileId}/denylist/`);
    
    return response.data;
};

// Add domains to denylist (bulk or single)
// @param profileId
// @param domains - Array of domains to block
// @returns Success status
export const addToDenylist = async (profileId: number, domains: string[]): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().post<{ success: boolean }>(`/api/v1/profiles/${profileId}/denylist/`, { domains });
    
    return response.data;
};

// Remove domains from denylist (bulk or single)
// @param profileId
// @param domains - Array of domains to remove
// @returns Success status
export const removeFromDenylist = async (profileId: number, domains: string[]): Promise<{ success: boolean }> => {
    const response = await apiClient.getClient().delete<{ success: boolean }>(`/api/v1/profiles/${profileId}/denylist/`, { data: { domains } });
    
    return response.data;
};