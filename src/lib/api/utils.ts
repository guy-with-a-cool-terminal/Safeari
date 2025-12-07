import apiClient from "./client";

// Utility endpoints for DNS setup and reference data
// Handles NextDNS integration and configuration metadata

export interface NextDNSSetup {
    ipv4: string[];
    ipv6: string[];
    linkedIp: {
        servers: string[];
        ip: string | null;
        ddns: string | null;
        updateToken: string;
    };
    dnscrypt: string;
}

export interface NextDNSDetails {
    id: string;
    fingerprint: string;
    name: string;
    setup: NextDNSSetup;
    security: any;
    privacy: any;
    parentalControl: any;
    settings: any;
    denylist: any[];
    allowlist: any[];
    rewrites: any[];
}

export interface SecurityFeature {
    id: string;
    name: string;
    description: string;
    category: string;
    default: boolean;
}

export interface ParentalService {
    id: string;
    name: string;
    description: string;
    category: string;
}

export interface ContentCategory {
    id: string;
    name: string;
    description: string;
    severity: string;
    default_block: boolean;
}

export interface Blocklist {
    id: string;
    name: string | null;
    website: string | null;
    description: string | null;
    entries: number;
    category:string;
    updatedOn: string;
}

export interface NativeTracker {
    id: string;
    name: string;
    description: string;
    category: string;
}

export interface ServiceConfig {
    id: string;
    active: boolean;
}

export interface CategoryConfig {
    id: string;
    active: boolean;
}

export interface AgePresetSecurity {
    threatIntelligenceFeeds: boolean;
    aiThreatDetection: boolean;
    googleSafeBrowsing: boolean;
    cryptojacking: boolean;
    dnsRebinding: boolean;
    idnHomographs: boolean;
    typosquatting: boolean;
    dga: boolean;
    nrd?: boolean;
    ddns?: boolean;
    parking?: boolean;
    csam: boolean;
}

export interface AgePresetParentalControl {
    safeSearch: boolean;
    youtubeRestrictedMode: boolean;
    blockBypass: boolean;
    services: ServiceConfig[];
    categories: CategoryConfig[];
}

export interface AgePresetPrivacy {
    blocklists: Array<{ id: string }>;
    natives: Array<{ id: string }>;
    disguisedTrackers: boolean;
    allowAffiliate: boolean;
}

export interface AgePresetConfig {
    name: string;
    description: string;
    security: AgePresetSecurity;
    parental_control: AgePresetParentalControl;
    privacy: AgePresetPrivacy;
}

export interface CountryTLD {
    id: string;
    name: string;
    flag: string;
}

export interface ReferenceDataMeta {
    version: string;
    last_updated: string;
    cache_ttl_hours: number;
}

export interface ReferenceDataResponse {
    security_features: SecurityFeature[];
    parental_services: ParentalService[];
    content_categories: ContentCategory[];
    blocklists: Blocklist[];
    native_trackers: NativeTracker[];
    age_presets: {
        young_kids: AgePresetConfig;
        tweens: AgePresetConfig;
        teens: AgePresetConfig;
    };
    country_tlds: CountryTLD[];
    meta: ReferenceDataMeta;
}

// Get full NextDNS profile details and DNS setup information
// @param profileId
// @returns Complete NextDNS profile configuration
export const getNextDNSDetails = async (profileId: number): Promise<{ data: NextDNSDetails }> => {
    const response = await apiClient.getClient().get<{ data: NextDNSDetails }>(`/api/v1/profiles/${profileId}/nextdns_details/`);
    
    return response.data;
};

// Get comprehensive reference data for frontend configuration
// @returns All metadata for security, parental, privacy features
export const getReferenceData = async (): Promise<ReferenceDataResponse> => {
    const response = await apiClient.getClient().get<ReferenceDataResponse>('/api/v1/profiles/reference_data/');
    
    return response.data;
};