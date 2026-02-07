import _ from 'lodash';
import { format } from 'date-fns';
import type { OverviewResponse, LogEntry, TimelineData } from "@/lib/api/types";

// PREVIEW DATA - Shown while waiting for real data
export const PREVIEW_DATA = {
  overview: {
    time_range: '7d',
    queries: [
      { status: 'default', queries: 2847 },
      { status: 'blocked', queries: 153 }
    ],
    devices: [
      { id: 'preview-device-1', name: 'iPhone 12', model: 'iPhone', queries: 1842 },
      { id: 'preview-device-2', name: 'iPad Pro', model: 'iPad', queries: 1158 }
    ]
  },
  timeline: [
    {
      status: 'default',
      queries: [0, 0, 0, 0, 0, 0, 45, 89, 156, 234, 189, 98, 67, 45, 178, 267, 312, 389, 245, 156, 89, 67, 234, 189]
    },
    {
      status: 'blocked',
      queries: [0, 0, 0, 0, 0, 0, 2, 5, 8, 12, 9, 4, 3, 2, 9, 13, 15, 18, 12, 8, 4, 3, 11, 9]
    }
  ],
  domains: [
    { domain: 'youtube.com', root: 'youtube', queries: 456, tracker: false },
    { domain: 'tiktok.com', root: 'tiktok', queries: 389, tracker: false },
    { domain: 'instagram.com', root: 'instagram', queries: 312, tracker: true },
    { domain: 'snapchat.com', root: 'snapchat', queries: 267, tracker: false },
    { domain: 'discord.com', root: 'discord', queries: 234, tracker: false },
    { domain: 'roblox.com', root: 'roblox', queries: 189, tracker: false },
    { domain: 'twitter.com', root: 'twitter', queries: 156, tracker: true },
    { domain: 'facebook.com', root: 'facebook', queries: 134, tracker: true },
    { domain: 'netflix.com', root: 'netflix', queries: 112, tracker: false },
    { domain: 'spotify.com', root: 'spotify', queries: 98, tracker: true }
  ],
  logs: [
    { timestamp: new Date(Date.now() - 5 * 60000).toISOString(), domain: 'youtube.com', status: 'default', reasons: [], device: { name: 'iPhone 12', model: 'iPhone' } },
    { timestamp: new Date(Date.now() - 12 * 60000).toISOString(), domain: 'tiktok.com', status: 'blocked', reasons: [{ name: 'Social Media - Parental Controls' }], device: { name: 'iPhone 12', model: 'iPhone' } },
    { timestamp: new Date(Date.now() - 18 * 60000).toISOString(), domain: 'instagram.com', status: 'default', reasons: [], device: { name: 'iPad Pro', model: 'iPad' } },
    { timestamp: new Date(Date.now() - 25 * 60000).toISOString(), domain: 'gambling-site.com', status: 'blocked', reasons: [{ name: 'Gambling - Security Filter' }], device: { name: 'iPhone 12', model: 'iPhone' } },
    { timestamp: new Date(Date.now() - 32 * 60000).toISOString(), domain: 'discord.com', status: 'default', reasons: [], device: { name: 'iPad Pro', model: 'iPad' } }
  ],
  trackers: {
    summary: { allowed_count: 4, blocked_count: 0 },
    allowed_trackers: [
      { tracker: 'Google Analytics', count: 156 },
      { tracker: 'Facebook Pixel', count: 134 },
      { tracker: 'Instagram Tracker', count: 89 },
      { tracker: 'Twitter Analytics', count: 67 }
    ]
  }
};

// CONFIGURATION
export const ANALYTICS_CONFIG = {
  LOGS_PER_PAGE: 50,
  EXPORT_LIMIT: 1000,
  LOGS_LIMITS: {
    '6h': 50,
    '12h': 75,
    '1d': 100,
    '7d': 500,
    '30d': 500,
  } as const,
  TIME_RANGES: [
    { label: "Last 6 Hours", value: "6h", days: 0.25 },
    { label: "Last 12 Hours", value: "12h", days: 0.5 },
    { label: "Today", value: "1d", days: 1 },
    { label: "Last 7 Days", value: "7d", days: 7 },
    { label: "Last 30 Days", value: "30d", days: 30 },
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
  logs: LogEntry[];
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
      logs: _.uniqBy(items, 'domain')
    }))
    .orderBy('count', 'desc')
    .value();
}

/**
 * Format timeline data for charts with proper aggregation
 * - 1d: 24 hourly bars
 * - 7d: 7 daily bars (aggregates 24 hours per day)
 * - 30d: 30 daily bars
 * - 90d: 90 daily bars
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

  if (allowedQueries.length === 0 && blockedQueries.length === 0) return [];

  // For 6h/12h/1d: show hourly bars (rolling window from now backwards)
  if (timeRange === '6h' || timeRange === '12h' || timeRange === '1d') {
    const hours = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : 24;
    const now = new Date();

    const currentHour = now.getHours();

    return Array.from({ length: hours }, (_, index) => {
      // Calculate the actual clock hour this bar represents
      // index 0 = oldest hour, index 23 = current hour
      const hoursAgo = hours - 1 - index;
      const actualHour = (currentHour - hoursAgo + 24) % 24;

      const hour12 = actualHour === 0 ? 12 : actualHour > 12 ? actualHour - 12 : actualHour;
      const period = actualHour >= 12 ? 'PM' : 'AM';

      return {
        time: `${hour12}${period}`,
        allowed: allowedQueries[index] || 0,
        blocked: blockedQueries[index] || 0
      };
    });
  }

  // For 7d, 30d, 90d: aggregate hours into days
  const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const hoursPerDay = 24;

  const aggregated: Array<{ time: string; allowed: number; blocked: number }> = [];

  for (let day = 0; day < daysCount; day++) {
    const startIdx = day * hoursPerDay;
    const endIdx = startIdx + hoursPerDay;

    // Sum up all hours in this day
    let dayAllowed = 0;
    let dayBlocked = 0;

    for (let i = startIdx; i < endIdx && i < allowedQueries.length; i++) {
      dayAllowed += allowedQueries[i] || 0;
      dayBlocked += blockedQueries[i] || 0;
    }

    // Calculate the actual date for this day
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (daysCount - 1 - day));

    let timeLabel = '';
    if (timeRange === '7d') {
      // Show day names: Mon, Tue, Wed, etc.
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      timeLabel = days[targetDate.getDay()];
    } else {
      // Show dates: Nov 1, Nov 8, etc.
      const month = targetDate.toLocaleString('default', { month: 'short' });
      timeLabel = `${month} ${targetDate.getDate()}`;
    }

    aggregated.push({
      time: timeLabel,
      allowed: dayAllowed,
      blocked: dayBlocked
    });
  }

  return aggregated;
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
 * Format timestamp for activity lists
 */
export function formatTime(timestamp: string): string {
  try {
    return format(new Date(timestamp), 'h:mm a');
  } catch (e) {
    return 'Unknown';
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
  contextLabel: string;
  contextIcon: 'moon' | 'shield-alert' | 'shield-check' | 'trending-up' | 'activity';
}

export function calculateTodaysHighlights(
  timeline: TimelineData[],
  timeRange: string,
  chartData: Array<{ time: string; allowed: number; blocked: number }>,
  metrics: ProtectionMetrics
): TodaysHighlights {
  try {
    let peakHour: { time: string; count: number } | null = null;

    if (timeline?.length > 0 && chartData?.length > 0) {
      // Find peak from chartData (already formatted with correct labels)
      let maxCount = 0;
      let peakTime = '';

      for (const item of chartData) {
        const total = item.allowed + item.blocked;
        if (total > maxCount) {
          maxCount = total;
          peakTime = item.time;
        }
      }

      if (maxCount > 0 && peakTime) {
        peakHour = { time: peakTime, count: maxCount };
      }
    }

    // Generate smart context label
    const timeRangeLabel = {
      '6h': 'Last 6 Hours',
      '12h': 'Last 12 Hours',
      '1d': 'Today',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days'
    }[timeRange] || 'Last 24 Hours';

    // Detect late night activity ONLY for hourly views (6h, 12h, 1d)
    const isHourlyView = ['6h', '12h', '1d'].includes(timeRange);
    let lateNightActivity = null;

    if (isHourlyView) {
      const now = new Date();
      const currentHour = now.getHours();
      lateNightActivity = chartData.find((item, idx) => {
        const hoursAgo = chartData.length - 1 - idx;
        const actualHour = (currentHour - hoursAgo + 24) % 24;
        const isLateNight = actualHour >= 0 && actualHour <= 5;
        const hasActivity = (item.allowed + item.blocked) > 0;
        return isLateNight && hasActivity;
      });
    }

    const blockRate = metrics.total > 0 ? (metrics.blocked / metrics.total) * 100 : 0;

    let context = '';
    let contextIcon: 'moon' | 'shield-alert' | 'shield-check' | 'trending-up' | 'activity' = 'activity';

    if (lateNightActivity) {
      context = `Active at ${lateNightActivity.time} (bedtime)`;
      contextIcon = 'moon';
    } else if (blockRate > 10) {
      context = `${metrics.blocked.toLocaleString()} threats blocked`;
      contextIcon = 'shield-alert';
    } else if (metrics.blocked === 0 && metrics.total > 0) {
      context = `All activity safe`;
      contextIcon = 'shield-check';
    } else if (peakHour) {
      context = `Most active ${peakHour.time}`;
      contextIcon = 'trending-up';
    } else {
      context = 'No activity detected';
      contextIcon = 'activity';
    }

    const contextLabel = `${timeRangeLabel} • ${context}`;

    return { peakHour, contextLabel, contextIcon };
  } catch (error) {
    console.error('Error calculating highlights:', error);
    return { peakHour: null, contextLabel: 'Last 24 Hours', contextIcon: 'activity' };
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