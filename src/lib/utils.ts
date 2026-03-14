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

export const USD_TO_KES_RATE = 130;

export function formatKsh(usdAmount: number): string {
  const kesAmount = usdAmount * USD_TO_KES_RATE;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kesAmount);
}
