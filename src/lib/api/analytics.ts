import apiClient from "./client";

// Analytics and monitoring endpoints
// Handles profile statistics, logs, and insights

export interface QueryStat {
    status: string;
    queries: number;
}

export interface DeviceStat {
    id: string;
    name: string;
    model: string;
    queries: number;
}

export interface OverviewResponse {
    queries: QueryStat[];
    devices: DeviceStat[];
    time_range: string;
}

export interface DomainStat {
    domain: string;
    root?: string;
    queries: number;
    tracker?: string;
}

export interface TimelineData {
    status: string;
    queries: number[];
}

export interface TrackerStat {
    domain: string;
    tracker: string;
    queries: number;
    status: 'allowed' | 'blocked';
}

export interface TrackersResponse {
    allowed_trackers: TrackerStat[];
    blocked_trackers: TrackerStat[];
    summary: {
        allowed_count: number;
        blocked_count: number;
        total_trackers: number;
    };
}

export interface BlockingReason {
    id: string;
    name: string;
}

export interface LogDevice {
    id: string;
    name: string;
    model: string;
}

export interface LogEntry {
    timestamp: string;
    domain: string;
    status: string;
    reasons: BlockingReason[];
    device: LogDevice;
}

export interface LogsResponse {
    data: LogEntry[];
    meta: {
        pagination: {
            cursor: string | null;
        };
    };
}

export interface ExportLogsResponse {
    profile_id: string;
    logs: LogEntry[];
    count: number;
}

// Get analytics overview for a profile
// @param profileId
// @param timeRange - Time range filter (1d, 7d, 30d)
// @returns Overview statistics
export const getAnalyticsOverview = async (profileId: number, timeRange: string = '1d'): Promise<OverviewResponse> => {
    const response = await apiClient.getClient().get<OverviewResponse>(`/api/v1/analytics/${profileId}/overview/?time_range=${timeRange}`);
    
    return response.data;
};

// Get top domains for a profile
// @param profileId
// @param timeRange - Time range filter
// @param limit - Number of results
// @returns Top domains list
export const getTopDomains = async (profileId: number, timeRange: string = '1d', limit: number = 10): Promise<DomainStat[]> => {
    const response = await apiClient.getClient().get<DomainStat[]>(`/api/v1/analytics/${profileId}/domains/?time_range=${timeRange}&limit=${limit}`);
    
    return response.data;
};

// Get device statistics for a profile
// @param profileId
// @param timeRange - Time range filter
// @returns Device activity breakdown
export const getDeviceStats = async (profileId: number, timeRange: string = '1d'): Promise<DeviceStat[]> => {
    const response = await apiClient.getClient().get<DeviceStat[]>(`/api/v1/analytics/${profileId}/devices/?time_range=${timeRange}`);
    
    return response.data;
};

// Get timeline data for charts
// @param profileId
// @param timeRange - Time range filter
// @returns Time series data (24 points)
export const getTimelineData = async (profileId: number, timeRange: string = '1d'): Promise<TimelineData[]> => {
    const response = await apiClient.getClient().get<TimelineData[]>(`/api/v1/analytics/${profileId}/timeline/?time_range=${timeRange}`);
    
    return response.data;
};

// Get tracker insights
// @param profileId
// @param timeRange - Time range filter
// @returns Tracker statistics with allowed/blocked classification
export const getTrackerStats = async (profileId: number, timeRange: string = '1d'): Promise<TrackersResponse> => {
    const response = await apiClient.getClient().get<TrackersResponse>(`/api/v1/analytics/${profileId}/trackers/?time_range=${timeRange}`);
    
    return response.data;
};

// Get query logs with pagination
// @param profileId
// @param limit - Number of log entries
// @returns Paginated log entries
export const getQueryLogs = async (profileId: number, limit: number = 10): Promise<LogsResponse> => {
    const response = await apiClient.getClient().get<LogsResponse>(`/api/v1/analytics/${profileId}/logs/?limit=${limit}`);
    
    return response.data;
};

// Get export-ready logs without pagination
// @param profileId
// @param limit - Number of log entries
// @returns Complete log export
export const getExportLogs = async (profileId: number, limit: number = 10): Promise<ExportLogsResponse> => {
    const response = await apiClient.getClient().get<ExportLogsResponse>(`/api/v1/analytics/${profileId}/export_logs/?limit=${limit}`);
    
    return response.data;
};
