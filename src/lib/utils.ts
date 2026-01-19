import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format backend feature names to human-readable text
 */
export function formatFeatureName(feature: string): string {
  // Special mappings for specific features
  const specialMappings: Record<string, string> = {
    'basic_parental': 'Basic Parental Controls',
    'advanced_parental': 'Advanced Parental Controls',
    'denylist_unlimited': 'Unlimited Blocklists',
    'denylist_custom': 'Custom Blocklists',
    'tracker_insights': 'Tracker Insights',
    'block_bypass_prevention': 'VPN/Proxy Blocking',
    'custom_dns': 'Custom DNS Settings',
    'api_access': 'API Access',
    'priority_support': 'Priority Support',
    'allowlist_custom': 'Custom Allowlists',
    'recreation_schedule': 'Recreation Scheduling',
    'api_requests': 'Analytics Refreshes',
    'analytics': 'Analytics Dashboard',
    'data_exports': 'Data Exports',
  };

  // Check for special mapping first
  if (specialMappings[feature.toLowerCase()]) {
    return specialMappings[feature.toLowerCase()];
  }

  // Default: convert snake_case to Title Case
  return feature
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
