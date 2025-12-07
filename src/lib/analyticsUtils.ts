import _ from 'lodash';
import type { OverviewResponse, LogEntry, TimelineData } from "@/lib/api/types";

// CONFIGURATION
export const ANALYTICS_CONFIG = {
  LOGS_PER_PAGE: 50,
  EXPORT_LIMIT: 1000,
  LOGS_LIMITS: {
    '1d': 100,
    '7d': 500,
    '30d': 500,
    '90d': 1000,
  } as const,
  TIME_RANGES: [
    { label: "Last 24 Hours", value: "1d", days: 1 },
    { label: "Last 7 Days", value: "7d", days: 7 },
    { label: "Last 30 Days", value: "30d", days: 30 },
    { label: "Last 90 Days", value: "90d", days: 90 },
  ] as const,
};

// TYPES
export interface ProtectionMetrics {
  total: number;
  blocked: number;
  allowed: number;
  protectionRate: number;
}

export interface ProtectionStatus {
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  message: string;
  description: string;
}

export interface BlockReason {
  reason: string;
  count: number;
  domains: string[];
}

export interface SiteInfo {
  display: string;
  original: string;
}

// UTILITY FUNCTIONS

/**
 * Extract readable site name from domain
 * Handles common patterns: www., api., mobile., etc.
 */
export function extractSiteName(log: { root?: string; domain: string }): { display: string; original: string } {
  // Use root when available (already extracted by API - more reliable)
  if (log.root) {
    const parts = log.root.split('.');
    const mainPart = parts[0];
    const display = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    return { display, original: log.root };
  }
  
  // Fallback for domains without root
  const domain = log.domain;
  if (!domain) return { display: 'Unknown', original: domain };
  
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const mainPart = parts[parts.length - 2];
    const display = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    return { display, original: domain };
  }
  
  return { display: domain, original: domain };
}

/**
 * Calculate protection metrics from overview data
 */
export function calculateMetrics(overview: OverviewResponse | null): ProtectionMetrics {
  if (!overview?.queries?.length) {
    return { total: 0, blocked: 0, allowed: 0, protectionRate: 0 };
  }

  const total = overview.queries.reduce((sum, q) => sum + (q.queries || 0), 0);
  const blocked = overview.queries.find(q => q.status === 'blocked')?.queries || 0;
  const allowed = total - blocked;
  const protectionRate = total > 0 ? Number(((blocked / total) * 100).toFixed(1)) : 0;

  return { total, blocked, allowed, protectionRate };
}

/**
 * Get protection status with color coding and messages
 */
export function getProtectionStatus(
  protectionRate: number, 
  blocked: number, 
  profileName: string
): ProtectionStatus {
  if (blocked === 0) {
    return {
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      message: 'Excellent - Zero threats detected',
      description: `All of ${profileName}'s browsing activity was safe. No harmful content was encountered.`
    };
  }
  
  if (protectionRate < 3) {
    return {
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      message: 'Good - Active protection',
      description: `${blocked.toLocaleString()} threats blocked for ${profileName}. Healthy protection rate.`
    };
  }
  
  if (protectionRate < 10) {
    return {
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      message: 'Elevated blocking activity',
      description: `${blocked.toLocaleString()} threats blocked (${protectionRate}%). ${profileName} may be encountering more restricted content.`
    };
  }
  
  return {
    color: 'bg-destructive',
    textColor: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    message: 'High blocking rate detected',
    description: `${blocked.toLocaleString()} threats blocked (${protectionRate}%). Review if ${profileName}'s settings are too restrictive.`
  };
}

/**
 * Group blocked logs by reason using lodash
 * More efficient and cleaner than manual Map manipulation
 */
export function groupBlockReasons(logs: LogEntry[]): BlockReason[] {
  if (!logs?.length) return [];
  
  const blockedLogs = logs.filter(
    log => log.status === 'blocked' && log.reasons?.length > 0
  );
  
  return _(blockedLogs)
    .groupBy(log => log.reasons![0].name)
    .map((items, reason) => ({
      reason,
      count: items.length,
      domains: _.uniq(items.map(item => item.domain))
    }))
    .orderBy('count', 'desc')
    .value();
}

/**
 * Format timeline data for recharts with proper time labels based on range
 */
export function formatTimeline(timeline: TimelineData[], timeRange: string = '1d'): Array<{
  time: string;
  allowed: number;
  blocked: number
}> {
  if (!timeline?.length) return [];

  const allowedData = timeline.find(t => t.status === 'default');
  const blockedData = timeline.find(t => t.status === 'blocked');

  const allowedQueries = allowedData?.queries || [];
  const blockedQueries = blockedData?.queries || [];

  const maxLength = Math.max(allowedQueries.length, blockedQueries.length);

  if (maxLength === 0) return [];

  // Format time labels based on range
  const formatTimeLabel = (index: number, range: string): string => {
    if (range === '1d') {
      // 24h: Show hours in 12-hour format - "12AM, 3AM, 6AM, 9AM, 12PM, 3PM, 6PM, 9PM"
      const hour = index;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      return `${hour12}${period}`;
    } else if (range === '7d') {
      // 7d: Show day names - "Mon, Tue, Wed, Thu, Fri, Sat, Sun"
      const dayIndex = Math.floor(index / 24);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (6 - dayIndex));
      return days[targetDate.getDay()];
    } else if (range === '30d') {
      // 30d: Show dates - "Nov 1, Nov 8, Nov 15, Nov 22"
      const dayIndex = Math.floor(index / 24);
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (29 - dayIndex));
      const month = targetDate.toLocaleString('default', { month: 'short' });
      return `${month} ${targetDate.getDate()}`;
    } else if (range === '90d') {
      // 90d: Show dates - "Aug 15, Sep 1, Sep 15, Oct 1, Nov 1"
      const dayIndex = Math.floor(index / 24);
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (89 - dayIndex));
      const month = targetDate.toLocaleString('default', { month: 'short' });
      return `${month} ${targetDate.getDate()}`;
    }
    return `${index}h`;
  };

  // Sample data points to avoid overcrowding the x-axis
  const sampleInterval = timeRange === '1d' ? 3 : timeRange === '7d' ? 24 : timeRange === '30d' ? 168 : 360;

  return Array.from({ length: maxLength }, (_, index) => ({
    time: index % sampleInterval === 0 ? formatTimeLabel(index, timeRange) : '',
    allowed: allowedQueries[index] || 0,
    blocked: blockedQueries[index] || 0
  }));
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  switch (status) {
    case 'default':
      return 'Allowed';
    case 'blocked':
      return 'Blocked';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Convert logs to CSV format with proper escaping
 */
export function convertToCSV(logs: LogEntry[]): string {
  if (!logs?.length) {
    return 'Timestamp,Domain,Status,Reason,Device Name,Device Model\n';
  }
  
  // Escape CSV cell (handle quotes and commas)
  const escapeCSV = (value: string | undefined | null): string => {
    if (!value) return 'N/A';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const headers = ['Timestamp', 'Domain', 'Status', 'Reason', 'Device Name', 'Device Model'];
  const rows = logs.map(log => [
    escapeCSV(log.timestamp),
    escapeCSV(log.domain),
    escapeCSV(log.status),
    escapeCSV(log.reasons?.[0]?.name),
    escapeCSV(log.device?.name || 'Unknown'),
    escapeCSV(log.device?.model || 'Unknown')
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Check if block reason is for ads/trackers
 */
export function isAdTrackerReason(reason: string): boolean {
  const trackerKeywords = ['oisd', 'ads', 'tracker', 'blocklist', 'adguard'];
  return trackerKeywords.some(keyword => 
    reason.toLowerCase().includes(keyword)
  );
}

/**
 * Get logs limit for time range
 */
export function getLogsLimit(timeRange: string): number {
  return ANALYTICS_CONFIG.LOGS_LIMITS[timeRange as keyof typeof ANALYTICS_CONFIG.LOGS_LIMITS] || 100;
}

/**
 * Calculate Today's Highlights from analytics data
 * Returns calculated insights for display in summary card
 */
export interface TodaysHighlights {
  peakHour: { time: string; count: number } | null;
  topBlockedCategory: {
    name: string;  // The block reason name (could be blocklist, parental control, security rule, etc.)
    count: number; // Total number of blocks for THIS specific reason (not total blocks)
  } | null;
  uniqueTrackers: { count: number; topCompanies: string[] };
  activityPattern: string;
}

export function calculateTodaysHighlights(
  timeline: TimelineData[],
  blockReasons: BlockReason[],
  trackers: Array<{ tracker: string; queries: number }>,
  profileName: string
): TodaysHighlights {
  try {
    // Calculate peak hour from timeline - aggregate by hour of day across all days
    let peakHour: { time: string; count: number } | null = null;
    if (timeline?.length > 0) {
      const allowedData = timeline.find(t => t.status === 'default');
      const blockedData = timeline.find(t => t.status === 'blocked');

      const allowedQueries = allowedData?.queries || [];
      const blockedQueries = blockedData?.queries || [];

      // Aggregate by hour of day (0-23) across all days
      const hourlyTotals: number[] = new Array(24).fill(0);

      for (let i = 0; i < Math.max(allowedQueries.length, blockedQueries.length); i++) {
        const hourOfDay = i % 24;
        const total = (allowedQueries[i] || 0) + (blockedQueries[i] || 0);
        hourlyTotals[hourOfDay] += total;
      }

      // Find peak hour
      let maxCount = 0;
      let maxHour = 0;
      for (let hour = 0; hour < 24; hour++) {
        if (hourlyTotals[hour] > maxCount) {
          maxCount = hourlyTotals[hour];
          maxHour = hour;
        }
      }

      if (maxCount > 0) {
        // Format hour in 12-hour format with space
        const hour12 = maxHour === 0 ? 12 : maxHour > 12 ? maxHour - 12 : maxHour;
        const period = maxHour >= 12 ? 'PM' : 'AM';
        peakHour = { time: `${hour12} ${period}`, count: maxCount };
      }
    }

    // Get top block reason - shows which rule/blocklist blocked the most
    // This could be from ads/trackers, parental controls, security rules, custom blocklists, etc.
    // Count represents total blocks for THIS SPECIFIC REASON (not total blocks across all reasons)
    let topBlockedCategory: { name: string; count: number } | null = null;
    if (blockReasons?.length > 0) {
      // blockReasons is already sorted by count descending, pick first item
      topBlockedCategory = {
        name: blockReasons[0].reason,
        count: blockReasons[0].count
      };
    }

    // Get unique trackers with top companies
    const uniqueTrackers = {
      count: trackers?.length || 0,
      topCompanies: (trackers || []).slice(0, 3).map(t => t.tracker)
    };

    // Determine activity pattern based on hour distribution
    let activityPattern = 'Moderate activity throughout the day';
    if (timeline?.length > 0) {
      const allowedData = timeline.find(t => t.status === 'default');
      const queries = allowedData?.queries || [];

      if (queries.length >= 24) {
        // Calculate activity in different time periods
        const morning = queries.slice(6, 12).reduce((sum, q) => sum + q, 0);
        const afternoon = queries.slice(12, 18).reduce((sum, q) => sum + q, 0);
        const evening = queries.slice(18, 24).reduce((sum, q) => sum + q, 0);
        const night = queries.slice(0, 6).reduce((sum, q) => sum + q, 0);

        const total = morning + afternoon + evening + night;
        if (total === 0) {
          activityPattern = 'No activity detected yet';
        } else {
          const morningPct = (morning / total) * 100;
          const afternoonPct = (afternoon / total) * 100;
          const eveningPct = (evening / total) * 100;
          const nightPct = (night / total) * 100;

          // Find the dominant period
          const max = Math.max(morningPct, afternoonPct, eveningPct, nightPct);
          if (max === morningPct && morningPct > 40) {
            activityPattern = 'Most active in the morning';
          } else if (max === afternoonPct && afternoonPct > 40) {
            activityPattern = 'Most active in the afternoon';
          } else if (max === eveningPct && eveningPct > 40) {
            activityPattern = 'Most active in the evening';
          } else if (max === nightPct && nightPct > 30) {
            activityPattern = 'Significant late-night activity';
          } else {
            activityPattern = 'Activity spread throughout the day';
          }
        }
      }
    }

    return {
      peakHour,
      topBlockedCategory,
      uniqueTrackers,
      activityPattern
    };
  } catch (error) {
    console.error('Error calculating highlights:', error);
    return {
      peakHour: null,
      topBlockedCategory: null,
      uniqueTrackers: { count: 0, topCompanies: [] },
      activityPattern: 'Unable to calculate activity pattern'
    };
  }
}

/**
 * Get severity level for a block reason
 * Used for color coding in the UI
 */
export function getSeverityLevel(reason: string): 'high' | 'medium' | 'low' {
  const reasonLower = reason.toLowerCase();

  // High severity - Critical content
  const highSeverity = ['adult', 'malware', 'phishing', 'gambling', 'csam', 'piracy', 'drugs'];
  if (highSeverity.some(keyword => reasonLower.includes(keyword))) {
    return 'high';
  }

  // Medium severity - Social/Gaming
  const mediumSeverity = ['social', 'gaming', 'dating', 'messaging', 'chat'];
  if (mediumSeverity.some(keyword => reasonLower.includes(keyword))) {
    return 'medium';
  }

  // Low severity - Ads/Trackers
  return 'low';
}