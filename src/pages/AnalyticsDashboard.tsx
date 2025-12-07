import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lock, Shield, Activity, Laptop, Eye, Clock, RefreshCw, FileDown, Info,
  Loader2, CheckCircle, AlertCircle, Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { getExportLogs } from "@/lib/api";
import type { LogEntry } from "@/lib/api/types";
import { Link } from "react-router-dom";
import DNSSetupDialog from "@/components/profile/DNSSetupDialog";
import ExportConfirmDialog from "@/components/dashboard/ExportConfirmDialog";
import {
  useAnalyticsOverview,
  useTopDomains,
  useTimelineData,
  useQueryLogs,
  useTrackerStats,
} from "@/hooks/queries";
import {
  ANALYTICS_CONFIG,
  calculateMetrics,
  getProtectionStatus,
  groupBlockReasons,
  formatTimeline,
  formatStatus,
  extractSiteName,
  convertToCSV,
  isAdTrackerReason,
  calculateTodaysHighlights,
  getSeverityLevel,
  type BlockReason,
} from "@/lib/analyticsUtils";
import { getLogsLimit } from "@/lib/analyticsUtils";

const ParentAnalyticsDashboard = () => {
  const { currentProfile } = useProfile();
  const { subscriptionTier } = useSubscription();
  const { toast } = useToast();

  // WORKAROUND: Default to "7d" instead of "1d" due to backend bug
  // The 1d filter frequently fails to return new queries, causing empty analytics
  // 7d filter is more reliable. Backend team investigating root cause.
  const [timeRange, setTimeRange] = useState("7d");
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Block details dialog
  const [selectedBlockReason, setSelectedBlockReason] = useState<BlockReason | null>(null);
  
  // DNS Setup Dialog
  const [showDNSSetup, setShowDNSSetup] = useState(false);
  
  // Pagination
  const [logsPage, setLogsPage] = useState(1);

  // React Query hooks - each endpoint loads independently
  const profileIdStr = currentProfile?.id.toString();
  const logsLimit = getLogsLimit(timeRange);

  const overviewQuery = useAnalyticsOverview(profileIdStr, timeRange);
  const domainsQuery = useTopDomains(profileIdStr, timeRange, 50);
  const timelineQuery = useTimelineData(profileIdStr, timeRange);
  const logsQuery = useQueryLogs(profileIdStr, logsLimit);
  const trackersQuery = useTrackerStats(profileIdStr, timeRange);

  // Aggregate loading states
  const isInitialLoad =
    overviewQuery.isLoading ||
    domainsQuery.isLoading ||
    timelineQuery.isLoading ||
    logsQuery.isLoading ||
    trackersQuery.isLoading;

  const isRefreshing =
    overviewQuery.isFetching ||
    domainsQuery.isFetching ||
    timelineQuery.isFetching ||
    logsQuery.isFetching ||
    trackersQuery.isFetching;

  // Check for query errors (but only if no cached data available)
  const hasErrors =
    (overviewQuery.isError && !overviewQuery.data) ||
    (domainsQuery.isError && !domainsQuery.data) ||
    (timelineQuery.isError && !timelineQuery.data) ||
    (logsQuery.isError && !logsQuery.data) ||
    (trackersQuery.isError && !trackersQuery.data);

  // Show error toast specifically for 1d filter failures
  useEffect(() => {
    if (hasErrors && timeRange === '1d') {
      toast({
        variant: "destructive",
        title: "1-Day filter not responding",
        description: "Try the 7-day filter - there's a known issue with 1-day data we're investigating.",
        duration: 6000,
      });
    } else if (hasErrors && !overviewQuery.data) {
      toast({
        variant: "destructive",
        title: "Failed to load analytics",
        description: "Retrying automatically...",
      });
    }
  }, [hasErrors, timeRange, overviewQuery.data, toast]);

  // Refresh all queries
  const refresh = () => {
    overviewQuery.refetch();
    domainsQuery.refetch();
    timelineQuery.refetch();
    logsQuery.refetch();
    trackersQuery.refetch();

    toast({
      title: 'Refreshed',
      description: 'Analytics data updated',
    });
  };

  // Memoized computed values - prevent unnecessary recalculations
  const metrics = useMemo(() => calculateMetrics(overviewQuery.data), [overviewQuery.data]);
  
  const protectionStatus = useMemo(
    () => getProtectionStatus(metrics.protectionRate, metrics.blocked, currentProfile?.display_name || ''),
    [metrics.protectionRate, metrics.blocked, currentProfile?.display_name]
  );

  const blockReasons = useMemo(
    () => groupBlockReasons(logsQuery.data?.data || []),
    [logsQuery.data?.data]
  );

  const chartData = useMemo(
    () => formatTimeline(timelineQuery.data || [], timeRange),
    [timelineQuery.data, timeRange]
  );

  // Calculate today's highlights - summary insights
  const highlights = useMemo(
    () => calculateTodaysHighlights(
      timelineQuery.data || [],
      blockReasons,
      trackersQuery.data?.allowed_trackers || [],
      currentProfile?.display_name || ''
    ),
    [timelineQuery.data, blockReasons, trackersQuery.data?.allowed_trackers, currentProfile?.display_name]
  );

  // TIME RANGE LOGIC
  const isTimeRangeAvailable = (range: string): boolean => {
    if (!subscriptionTier) return range === "1d";
    
    const selectedRange = ANALYTICS_CONFIG.TIME_RANGES.find(r => r.value === range);
    if (!selectedRange) return false;
    
    return selectedRange.days <= subscriptionTier.analytics_retention;
  };

  const handleTimeRangeChange = (range: string) => {
    if (!isTimeRangeAvailable(range)) {
      toast({
        title: "Upgrade Required",
        description: `Unlock ${range} analytics by upgrading your subscription`,
        variant: "destructive"
      });
      return;
    }
    setTimeRange(range);
    setLogsPage(1); // Reset pagination
  };

  // EXPORT LOGIC
  const handleExportClick = () => {
    setShowExportDialog(true);
  };

  const handleExportConfirm = async () => {
    if (!currentProfile) return;
    
    setIsExporting(true);
    toast({
      title: "Exporting...",
      description: "Preparing your analytics data"
    });

    try {
      const exportData = await getExportLogs(currentProfile.id, ANALYTICS_CONFIG.EXPORT_LIMIT);
      
      let blob: Blob;
      let filename: string;
      
      if (exportFormat === 'csv') {
        const csvContent = convertToCSV(exportData.logs);
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `analytics-${currentProfile.display_name}-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `analytics-${currentProfile.display_name}-${new Date().toISOString().split('T')[0]}.json`;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ 
        title: "Export Complete", 
        description: `Downloaded ${exportData.count.toLocaleString()} entries as ${exportFormat.toUpperCase()}`
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({ 
        variant: "destructive", 
        title: "Export failed", 
        description: error.message || "Please try again"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // RENDER GUARDS
  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a profile to view analytics</p>
      </div>
    );
  }

  // Show loading skeleton only on initial load (no cache available)
  if (isInitialLoad) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{currentProfile.display_name}'s Activity Dashboard</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24 bg-muted/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no data yet
  if (!overviewQuery.isLoading && metrics.total === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{currentProfile.display_name}'s Protection Dashboard</h1>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Waiting for {currentProfile.display_name}'s First Activity...</h3>
              <p className="text-muted-foreground max-w-md">
                Make sure you set up {currentProfile.display_name}'s devices as instructed. Once configured, activity will appear here automatically.
              </p>
            </div>

            {/* Action buttons - Mobile optimized */}
            <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl px-4 sm:px-0">
              <Button
                onClick={() => setShowDNSSetup(true)}
                size="lg"
                className="w-full h-14 sm:h-12 text-base sm:text-sm"
              >
                <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">View DNS Setup Instructions</span>
                <span className="sm:hidden">Setup DNS Instructions</span>
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full h-14 sm:h-12 text-base sm:text-sm"
                >
                  <Link to="/dashboard/parental">
                    <Users className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Explore Parental Controls</span>
                    <span className="sm:hidden">Parental Controls</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full h-14 sm:h-12 text-base sm:text-sm"
                >
                  <Link to="/dashboard/security">
                    <Lock className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Configure Security Settings</span>
                    <span className="sm:hidden">Security Settings</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <DNSSetupDialog
          open={showDNSSetup}
          onOpenChange={setShowDNSSetup}
          profileId={currentProfile.id}
          profileName={currentProfile.display_name}
        />
      </div>
    );
  }

  // Extract data for rendering
  const devices = overviewQuery.data?.devices || [];
  const topAllowedDomains = (domainsQuery.data || []).slice(0, 15);
  const allowedTrackers = trackersQuery.data?.allowed_trackers || [];
  const trackerCount = trackersQuery.data?.summary.allowed_count || 0;

  // Pagination
  const allLogs = logsQuery.data?.data || [];
  const totalLogs = allLogs.length;
  const paginatedLogs = allLogs.slice(0, logsPage * ANALYTICS_CONFIG.LOGS_PER_PAGE);
  const hasMoreLogs = paginatedLogs.length < totalLogs;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">{currentProfile.display_name}'s Activity Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={exportFormat} onValueChange={(v: 'json' | 'csv') => setExportFormat(v)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportClick}
            disabled={isExporting}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 flex-wrap">
        {ANALYTICS_CONFIG.TIME_RANGES.map((range) => {
          const available = isTimeRangeAvailable(range.value);
          return (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              disabled={!available}
              onClick={() => handleTimeRangeChange(range.value)}
            >
              {!available && <Lock className="h-3 w-3 mr-1" />}
              {range.label}
            </Button>
          );
        })}
      </div>

      {/* Today's Highlights - Summary Card */}
      {metrics.total > 0 && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Today's Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Peak Activity */}
              {highlights.peakHour && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Peak Activity</p>
                  <p className="text-base font-medium">
                    {highlights.peakHour.time} with {highlights.peakHour.count.toLocaleString()} requests
                  </p>
                </div>
              )}

              {/* Top Block Reason */}
              {highlights.topBlockedCategory && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Top Block Reason</p>
                  <p className="text-base font-medium">
                    {highlights.topBlockedCategory.name} ({highlights.topBlockedCategory.count.toLocaleString()} blocks)
                  </p>
                </div>
              )}

              {/* Tracking Companies */}
              {highlights.uniqueTrackers.count > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tracking Companies</p>
                  <p className="text-base font-medium">
                    {highlights.uniqueTrackers.count} {highlights.uniqueTrackers.count === 1 ? 'company' : 'companies'} tracked {currentProfile.display_name} today
                    {highlights.uniqueTrackers.topCompanies.length > 0 && (
                      <span className="text-sm text-muted-foreground block mt-1">
                        Including: {highlights.uniqueTrackers.topCompanies.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Activity Pattern */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Activity Pattern</p>
                <p className="text-base font-medium">{highlights.activityPattern}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Protection Status Card */}
      <Card className={`border-2 ${protectionStatus.borderColor}`}>
        <CardHeader>
           <Shield className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Protection Rate</span>
            <span className={`text-3xl font-bold ${protectionStatus.textColor}`}>
              {metrics.protectionRate}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 flex overflow-hidden">
            <div 
              className="bg-primary h-3 transition-all" 
              style={{ width: `${100 - metrics.protectionRate}%` }}
              title={`${metrics.allowed.toLocaleString()} allowed`}
            />
            <div 
              className="bg-destructive h-3 transition-all" 
              style={{ width: `${metrics.protectionRate}%` }}
              title={`${metrics.blocked.toLocaleString()} blocked`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Threats Blocked</p>
              <p className="text-2xl font-bold text-destructive">{metrics.blocked.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{currentProfile.display_name}'s Internet Activity</p>
              <p className="text-2xl font-bold text-primary">{metrics.total.toLocaleString()}</p>
            </div>
          </div>
          
          <Alert className={protectionStatus.bgColor}>
            {metrics.blocked === 0 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertDescription>
              <p className={`font-medium ${protectionStatus.textColor}`}>
                {protectionStatus.message}
              </p>
              <p className="text-sm mt-1">{protectionStatus.description}</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{currentProfile.display_name}'s Internet Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">total requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground truncate">
              {devices.length > 0 ? devices[0].name : 'No devices'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies Watching {currentProfile.display_name} Online</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackerCount}</div>
            <p className="text-xs text-muted-foreground">companies tracking</p>
          </CardContent>
        </Card>

        {blockReasons.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Block Reason</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockReasons[0].count}</div>
              <p className="text-xs text-muted-foreground truncate">{blockReasons[0].reason}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tracker Alert - Enhanced with top companies */}
      {trackerCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <strong>{trackerCount} companies</strong> are watching {currentProfile.display_name} online
              {allowedTrackers.length > 0 && (
                <div className="text-sm mt-2 text-muted-foreground">
                  Most tracked by: {allowedTrackers.slice(0, 5).map((t, idx) =>
                    `${t.tracker} (${t.queries.toLocaleString()} times)`
                  ).join(', ')}
                  {allowedTrackers.length > 5 && ` +${allowedTrackers.length - 5} more`}
                </div>
              )}
            </div>
            <Link to="/dashboard/privacy">
              <Button size="sm" variant="outline">Block Trackers</Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Activity Timeline - Show skeleton while loading */}
      <Card>
        <CardHeader>
          <CardTitle>{currentProfile.display_name}'s Activity Over Time</CardTitle>
          {/* Plain-English summary below title */}
          {!timelineQuery.isLoading && chartData.length > 0 && highlights.peakHour && (
            <p className="text-sm text-muted-foreground mt-2">
              {currentProfile.display_name}'s busiest time: {highlights.peakHour.time} with {highlights.peakHour.count.toLocaleString()} requests.
              {highlights.topBlockedCategory && ` ${highlights.topBlockedCategory.count.toLocaleString()} threats blocked.`}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {timelineQuery.isLoading ? (
            <div className="h-[300px] bg-muted/20 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="allowed" 
                  stroke="hsl(142 76% 36%)" 
                  strokeWidth={2}
                  name="Safe"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="blocked" 
                  stroke="hsl(0 84% 60%)" 
                  strokeWidth={2}
                  name="Blocked"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Most Visited Sites */}
        <Card>
          <CardHeader>
            <CardTitle>{currentProfile.display_name}'s Most Visited Sites</CardTitle>
          </CardHeader>
          <CardContent>
            {domainsQuery.isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />)}
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {topAllowedDomains.length > 0 ? (
                  topAllowedDomains.map((domain, index) => {
                    const { display, original } = extractSiteName({ root: domain.root, domain: domain.domain });
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{display}</p>
                            {domain.tracker && <Badge variant="outline" className="text-xs">Tracker</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{original}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold">{domain.queries}</p>
                          <p className="text-xs text-muted-foreground">visits</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What We're Protecting {currentProfile.display_name} From</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {blockReasons.length > 0 ? (
                blockReasons.map((item, index) => {
                  // Determine severity level for color coding
                  const severity = getSeverityLevel(item.reason);
                  const severityStyles = {
                    high: {
                      bg: 'bg-red-50 dark:bg-red-950/20',
                      hover: 'hover:bg-red-100 dark:hover:bg-red-950/30',
                      border: 'border-l-4 border-l-[hsl(var(--severity-high))]',
                      text: 'text-[hsl(var(--severity-high))]'
                    },
                    medium: {
                      bg: 'bg-amber-50 dark:bg-amber-950/20',
                      hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/30',
                      border: 'border-l-4 border-l-[hsl(var(--severity-medium))]',
                      text: 'text-[hsl(var(--severity-medium))]'
                    },
                    low: {
                      bg: 'bg-blue-50 dark:bg-blue-950/20',
                      hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/30',
                      border: 'border-l-4 border-l-[hsl(var(--severity-low))]',
                      text: 'text-[hsl(var(--severity-low))]'
                    }
                  };
                  const styles = severityStyles[severity];

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedBlockReason(item)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg ${styles.bg} ${styles.hover} ${styles.border} transition-colors cursor-pointer`}
                    >
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${styles.text}`}>{item.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.domains.length} unique {item.domains.length === 1 ? 'site' : 'sites'} blocked
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-bold ${styles.text}`}>{item.count}</p>
                          <p className="text-xs text-muted-foreground">blocks</p>
                        </div>
                        <Shield className={`h-5 w-5 ${styles.text}`} />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No threats blocked - {currentProfile.display_name}'s activity was completely safe
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block Details Dialog */}
      <Dialog open={!!selectedBlockReason} onOpenChange={() => setSelectedBlockReason(null)}>
        
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Blocked by: {selectedBlockReason?.reason}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedBlockReason?.count} {selectedBlockReason?.count === 1 ? 'attempt' : 'attempts'} blocked from {selectedBlockReason?.domains.length} {selectedBlockReason?.domains.length === 1 ? 'site' : 'sites'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">
                    {['OISD', 'NextDNS Ads & Trackers Blocklist', 'Ads & Trackers'].some(tracker => 
                      selectedBlockReason?.reason.toLowerCase().includes(tracker.toLowerCase())
                    ) 
                      ? `Trackers and ads blocked automatically:`
                      : `Sites ${currentProfile.display_name} tried to access:`
                    }
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedBlockReason?.domains.map((domain, idx) => {
                      const { display, original } = extractSiteName({ domain: domain });
                      return (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <p className="font-medium">{display}</p>
                          <p className="text-xs text-muted-foreground truncate">{original}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm">
                    <strong>Why was this blocked?</strong> {
                      ['OISD', 'NextDNS Ads & Trackers Blocklist', 'Ads & Trackers'].some(tracker => 
                        selectedBlockReason?.reason.toLowerCase().includes(tracker.toLowerCase())
                      )
                        ? `These trackers and ads from were automatically blocked by our "${selectedBlockReason?.reason}" protection rule to keep ${currentProfile.display_name} safe from tracking and unwanted content.`
                        : `These sites matched your protection rules for "${selectedBlockReason?.reason}". You can adjust ${currentProfile.display_name}'s settings in the Security or Parental Controls sections.`
                    }
                  </p>
                </div>
              </DialogContent>
            </Dialog>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>{currentProfile.display_name}'s Connected Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {devices.length > 0 ? (
              devices.map((device, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <Laptop className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{device.name}</p>
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{device.model}</p>
                    <p className="text-xs text-muted-foreground">{device.queries.toLocaleString()} queries</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No devices detected yet for {currentProfile.display_name}</p>
                <Button onClick={() => setShowDNSSetup(true)} variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Setup Device Protection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentProfile.display_name}'s Recent Activity</CardTitle>
            <Badge variant="outline">{totalLogs.toLocaleString()}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {logsQuery.isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted/20 animate-pulse rounded" />)}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {paginatedLogs.length > 0 ? (
                <>
                  {paginatedLogs.map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center min-w-0">
                        <span className="text-sm text-muted-foreground truncate">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="font-medium truncate">{log.domain}</span>
                        <Badge variant={log.status === "blocked" ? "destructive" : "outline"}>
                          {formatStatus(log.status)}
                        </Badge>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground truncate">
                            {log.device?.name || 'Unknown'}
                          </span>
                          {log.status === 'blocked' && log.reasons?.[0] && (
                            <Badge variant="secondary" className="text-xs">
                              {log.reasons[0].name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {hasMoreLogs && (
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" onClick={() => setLogsPage(p => p + 1)}>
                        Load More ({totalLogs - paginatedLogs.length} remaining)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  No recent activity for {currentProfile.display_name}
                </p>
                <Button onClick={() => setShowDNSSetup(true)} variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Confirm DNS Setup
                </Button>
              </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <DNSSetupDialog
        open={showDNSSetup}
        onOpenChange={setShowDNSSetup}
        profileId={currentProfile.id}
        profileName={currentProfile.display_name}
      />

      <ExportConfirmDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onConfirm={handleExportConfirm}
        format={exportFormat}
        profileName={currentProfile.display_name}
        isExporting={isExporting}
      />
    </div>
  );
};

export default ParentAnalyticsDashboard;