import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Lock, Shield, Activity, Laptop, Eye, RefreshCw, FileDown,
  AlertCircle, Users, ChevronDown, Search, X, CheckCircle2, XCircle,
  Moon, ShieldAlert, ShieldCheck, TrendingUp, Calendar, Clock
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonutChart from "@/components/dashboard/DonutChart";
import SeamlessSection from "@/components/ui/SeamlessSection";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { getExportLogs } from "@/lib/api";
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
  PREVIEW_DATA,
  calculateMetrics,
  groupBlockReasons,
  formatTimeline,
  formatStatus,
  formatTime,
  extractSiteName,
  convertToCSV,
  calculateTodaysHighlights,
  type BlockReason,
} from "@/lib/analyticsUtils";
import { getLogsLimit } from "@/lib/analyticsUtils";

const ParentAnalyticsDashboard = () => {
  const { currentProfile } = useProfile();
  const { subscriptionTier } = useSubscription();
  const { toast } = useToast();

  // ALL STATE HOOKS FIRST - BEFORE ANY CONDITIONALS
  const [timeRange, setTimeRange] = useState("7d");
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDNSSetup, setShowDNSSetup] = useState(false);
  const [activeTab, setActiveTab] = useState("screenTime");
  const [expandedDays, setExpandedDays] = useState<string[]>(["today"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITIES_PER_PAGE = 20;

  const profileIdStr = currentProfile?.id.toString();
  const logsLimit = getLogsLimit(timeRange);

  // ALL QUERY HOOKS - THESE MUST ALWAYS RUN
  const overviewQuery = useAnalyticsOverview(profileIdStr, timeRange);
  const domainsQuery = useTopDomains(profileIdStr, timeRange, 50);
  const timelineQuery = useTimelineData(profileIdStr, timeRange);
  const logsQuery = useQueryLogs(profileIdStr, logsLimit);
  const trackersQuery = useTrackerStats(profileIdStr, timeRange);

  const isInitialLoad =
    !overviewQuery.data &&
    !domainsQuery.data &&
    !timelineQuery.data &&
    (overviewQuery.isLoading || domainsQuery.isLoading || timelineQuery.isLoading);

  const isRefreshing =
    overviewQuery.isFetching ||
    domainsQuery.isFetching ||
    timelineQuery.isFetching ||
    logsQuery.isFetching ||
    trackersQuery.isFetching;

  const hasErrors =
    (overviewQuery.isError && !overviewQuery.data) ||
    (domainsQuery.isError && !domainsQuery.data) ||
    (timelineQuery.isError && !timelineQuery.data) ||
    (logsQuery.isError && !logsQuery.data) ||
    (trackersQuery.isError && !trackersQuery.data);

  // ALL useEffect HOOKS
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

  // ALL useMemo HOOKS
  const showPreviewMode = !overviewQuery.isLoading && overviewQuery.data && calculateMetrics(overviewQuery.data).total === 0;

  const metrics = useMemo(() => {
    const realMetrics = calculateMetrics(overviewQuery.data);
    if (showPreviewMode) {
      return calculateMetrics(PREVIEW_DATA.overview);
    }
    return realMetrics;
  }, [overviewQuery.data, showPreviewMode]);

  const blockReasons = useMemo(
    () => groupBlockReasons(logsQuery.data?.data || []),
    [logsQuery.data?.data]
  );

  const chartData = useMemo(
    () => {
      const data = showPreviewMode ? PREVIEW_DATA.timeline : (timelineQuery.data || []);
      return formatTimeline(data, timeRange);
    },
    [timelineQuery.data, timeRange, showPreviewMode]
  );

  const highlights = useMemo(
    () => calculateTodaysHighlights(
      timelineQuery.data || [],
      timeRange,
      chartData,
      metrics
    ),
    [timelineQuery.data, timeRange, chartData, metrics]
  );

  const devices = showPreviewMode ? PREVIEW_DATA.overview.devices : (overviewQuery.data?.devices || []);
  const topAllowedDomains = showPreviewMode ? PREVIEW_DATA.domains.slice(0, 15) : ((domainsQuery.data || []).slice(0, 15));
  const allowedTrackers = showPreviewMode ? PREVIEW_DATA.trackers.allowed_trackers : (trackersQuery.data?.allowed_trackers || []);
  const trackerCount = showPreviewMode ? PREVIEW_DATA.trackers.summary.allowed_count : (trackersQuery.data?.summary.allowed_count || 0);
  const allLogs = showPreviewMode ? PREVIEW_DATA.logs : (logsQuery.data?.data || []);

  // Group logs by date for Recent Activity
  const groupedLogs = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped: Record<string, typeof allLogs> = {
      today: [],
      yesterday: [],
      older: []
    };

    allLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      if (logDate.toDateString() === today.toDateString()) {
        grouped.today.push(log);
      } else if (logDate.toDateString() === yesterday.toDateString()) {
        grouped.yesterday.push(log);
      } else {
        grouped.older.push(log);
      }
    });

    return grouped;
  }, [allLogs]);

  // Filter logs by search query
  const filteredGroupedLogs = useMemo(() => {
    if (!searchQuery) return groupedLogs;

    const filtered: Record<string, typeof allLogs> = {};
    Object.keys(groupedLogs).forEach(key => {
      filtered[key] = groupedLogs[key].filter(log =>
        log.domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    return filtered;
  }, [groupedLogs, searchQuery]);

  // Calculate max value for timeline chart
  const maxTimelineValue = Math.max(...chartData.map(d => d.allowed + d.blocked), 1);

  // ALL CALLBACK FUNCTIONS
  const refresh = () => {
    [overviewQuery, domainsQuery, timelineQuery, logsQuery, trackersQuery].forEach(q => q.refetch());
    toast({ title: 'Refreshed', description: 'Analytics data updated' });
  };

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
  };

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

  const toggleDay = (day: string) => {
    setExpandedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // NOW CONDITIONAL RETURNS ARE SAFE - ALL HOOKS HAVE BEEN CALLED
  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a profile to view analytics</p>
      </div>
    );
  }

  if (isInitialLoad) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">{currentProfile.display_name}'s Dashboard</h1>
          <div className="text-sm text-muted-foreground">Loading analytics...</div>
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

  if (!overviewQuery.isLoading && metrics.total === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">{currentProfile.display_name}'s Dashboard</h1>
        </div>

        <div className="rounded-xl bg-muted/20 flex flex-col items-center justify-center py-16 space-y-6">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Waiting for {currentProfile.display_name}'s First Activity...</h3>
            <p className="text-muted-foreground max-w-md">
              Make sure you set up {currentProfile.display_name}'s devices as instructed.
              Once they start browsing, you'll see their activity here.
            </p>
          </div>
          <Link to="/dashboard/setup">
            <Button>
              View Setup Instructions
            </Button>
          </Link>
        </div>
        <DNSSetupDialog
          open={showDNSSetup}
          onOpenChange={setShowDNSSetup}
          profileId={currentProfile.id}
          profileName={currentProfile.display_name}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6 max-w-7xl mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8">
      {/* PREVIEW MODE BANNER - COMPACT BUT DESCRIPTIVE */}
      {showPreviewMode && (
        <div className="relative overflow-hidden rounded-xl bg-primary/5 border border-primary/10 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Preview Mode</span>
                  <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  Setup complete! Real data for {currentProfile.display_name} will appear within 10 minutes once they start browsing.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed leading-tight max-w-2xl">
                  While you wait, explore <span className="text-primary font-medium">Parental Controls</span> to set limits and filters, or review your current setup.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
              <Link to="/dashboard/parental" className="flex-1 lg:flex-none">
                <Button size="sm" variant="outline" className="w-full text-xs h-9 px-4 font-bold border-primary/20 hover:bg-primary/10 text-primary bg-background">
                  Parental Controls
                </Button>
              </Link>
              <Button
                onClick={() => setShowDNSSetup(true)}
                size="sm"
                variant="outline"
                className="flex-1 lg:flex-none text-xs h-9 px-4 font-bold border-border/50 hover:bg-accent/50 bg-background"
              >
                Review Setup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NEW PREMIUM HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {currentProfile.display_name}'s Safety Snapshot
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            See how Safeari is keeping {currentProfile.display_name} safe across all their devices.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="bg-accent/30 hover:bg-accent/50 border-none h-10 px-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-px bg-accent/30 rounded-lg overflow-hidden h-10">
              <Select value={exportFormat} onValueChange={(v: 'json' | 'csv') => setExportFormat(v)}>
                <SelectTrigger className="w-20 border-none bg-transparent h-full focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-px h-4 bg-border/40" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportClick}
                disabled={isExporting}
                className="hover:bg-accent/50 h-full border-none rounded-none px-4"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* TIME RANGE SELECTOR */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {ANALYTICS_CONFIG.TIME_RANGES.map((range) => {
          const available = isTimeRangeAvailable(range.value);
          const active = timeRange === range.value;
          return (
            <Button
              key={range.value}
              variant={active ? "default" : "secondary"}
              size="sm"
              disabled={!available}
              onClick={() => handleTimeRangeChange(range.value)}
              className={cn(
                "whitespace-nowrap px-4 h-9 rounded-full transition-all",
                active ? "shadow-md shadow-primary/20" : "bg-accent/30 hover:bg-accent/50 border-none text-muted-foreground"
              )}
            >
              {!available && <Lock className="h-3 w-3 mr-1.5 opacity-60" />}
              {range.label}
            </Button>
          );
        })}
      </div>

      {/* HERO SECTION - REFACTORED FOR PREMIUM FEEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-border/40 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <DonutChart
                safeCount={metrics.total - metrics.blocked}
                blockedCount={metrics.blocked}
                size={220}
              />

            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {metrics.blocked === 0
                    ? `Great news! ${currentProfile.display_name} is browsing safely.`
                    : `Safeari blocked ${metrics.blocked.toLocaleString()} threats.`}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our core filters are working in the background to ensure every request is verified and secure.
                </p>
              </div>

              <div className="flex justify-start max-w-sm mx-auto md:mx-0">
                <div className="p-4 rounded-xl bg-background/50 border border-border/40 backdrop-blur-sm pr-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Peak Activity</div>
                  <div className="text-xl font-bold">{highlights.peakHour?.time || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KEY METRICS GRID - ADJUSTED FOR HERO FLOW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-4">
          {[
            { icon: Activity, value: metrics.total, label: 'Activity', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: ShieldCheck, value: metrics.total - metrics.blocked, label: 'Safe', color: 'text-green-500', bg: 'bg-green-500/10' },
            { icon: ShieldAlert, value: metrics.blocked, label: 'Threats', color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { icon: Eye, value: trackerCount, label: 'Trackers', color: 'text-purple-500', bg: 'bg-purple-500/10' }
          ].map((item, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl bg-card p-4 border border-border/40 hover:border-primary/30 hover-lift flex items-center gap-4 lg:p-5">
              <div className={cn("inline-flex p-2.5 rounded-lg transition-transform group-hover:scale-110", item.bg)}>
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xl font-bold tracking-tight text-foreground">{item.value.toLocaleString()}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRACKER ALERT */}
      {trackerCount > 0 && (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-0">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <span className="font-semibold">{trackerCount} companies</span> tracking {currentProfile.display_name} online
              {allowedTrackers.length > 0 && (
                <div className="text-sm mt-1 text-muted-foreground">
                  Including: {allowedTrackers.slice(0, 3).map(t => t.tracker).join(', ')}
                </div>
              )}
            </div>
            <Link to="/dashboard/privacy">
              <Button size="sm" variant="default" className="whitespace-nowrap">
                Block Trackers
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* DETAILED ACTIVITY ANALYTICS */}
      <SeamlessSection
        title="Activity Breakdown"
        description="A deep dive into browsing patterns and security events."
      >
        <div className="p-2 sm:p-6 bg-card/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted/50 p-1 mb-8">
              <TabsTrigger value="screenTime" className="rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Screen Time</TabsTrigger>
              <TabsTrigger value="mostVisited" className="rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Most Visited</TabsTrigger>
              <TabsTrigger value="blocked" className="rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                Blocked
                {blockReasons.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-4 px-1 text-[10px] font-bold">
                    {blockReasons.reduce((sum, reason) => sum + reason.logs.length, 0)}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="min-h-[400px]">
              {activeTab === "blocked" && blockReasons.length > 0 && (
                <div className="mb-6 rounded-xl bg-primary/5 p-4 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
                    <ShieldAlert className="h-4 w-4" />
                    Security Filters Active
                  </div>
                  <p className="text-xs text-muted-foreground/80">
                    Showing blocks from: Your family blocklist, automated ad-blocking, and high-risk security filters.
                  </p>
                </div>
              )}

              <TabsContent value="screenTime" className="mt-0 outline-none">
                {/* Big Summary */}
                <div className="flex items-center justify-center gap-2 mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 border border-border/40 text-sm font-medium">
                    {highlights.contextIcon === 'moon' && <Moon className="h-4 w-4 text-amber-500" />}
                    {highlights.contextIcon === 'shield-alert' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                    {highlights.contextIcon === 'shield-check' && <ShieldCheck className="h-4 w-4 text-green-500" />}
                    {highlights.contextIcon === 'trending-up' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                    {highlights.contextIcon === 'activity' && <Activity className="h-4 w-4" />}
                    <span>{highlights.contextLabel}</span>
                  </div>
                </div>

                {/* Timeline Chart */}
                <div className="h-72 flex items-end gap-2 overflow-x-auto pb-4 px-2 no-scrollbar">
                  {chartData.map((item, i) => {
                    const total = item.allowed + item.blocked;
                    const allowedHeight = ((item.allowed / maxTimelineValue) * 100);
                    const blockedHeight = ((item.blocked / maxTimelineValue) * 100);
                    const totalHeight = allowedHeight + blockedHeight;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center min-w-[36px] max-w-[52px]">
                        <div className="w-full h-full flex flex-col justify-end mb-3 relative group cursor-pointer">
                          {/* Single bar with smooth gradient */}
                          <div
                            className="w-full relative rounded-t-lg overflow-hidden transition-all duration-300 shadow-sm"
                            style={{
                              height: `${Math.max(totalHeight, 5)}%`,
                              minHeight: total > 0 ? '24px' : '8px',
                              background: item.blocked > 0
                                ? `linear-gradient(to top, 
                                    #10b981 0%, 
                                    #10b981 ${(item.allowed / total * 100) - 2}%, 
                                    #f43f5e ${(item.allowed / total * 100) + 2}%, 
                                    #e11d48 100%)`
                                : `linear-gradient(to top, #10b981, #059669)`,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
                          </div>

                          {/* Tooltip hint on hover */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg border">
                            {total} req
                          </div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">{item.time}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Compact Legend */}
                <div className="flex justify-center gap-6 mt-8 py-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#10b981] rounded shadow-sm" />
                    <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Safe Browsing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#f43f5e] rounded shadow-sm" />
                    <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Blocked Threats</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mostVisited" className="mt-0 max-h-[450px] overflow-y-auto space-y-1 no-scrollbar pr-2">
                {topAllowedDomains.map((domain, i) => {
                  const { display, original } = extractSiteName({ root: domain.root, domain: domain.domain });
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/5 transition-all group border border-transparent hover:border-border/30">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 border border-border/20 group-hover:bg-background transition-colors">
                          <span className="text-sm font-bold text-primary/60">{display.substring(0, 1).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-base truncate tracking-tight">{display}</p>
                            {domain.tracker && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 bg-purple-500/5 text-purple-600 border-purple-500/20 uppercase font-bold tracking-widest">
                                Tracker
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground/60 truncate italic">{original}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-4 text-foreground">
                        <span className="text-sm font-bold tracking-tight">{domain.queries.toLocaleString()}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/40">Visits</span>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="blocked" className="mt-0 space-y-4">
                {blockReasons.length > 0 ? (
                  blockReasons.map((group, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center gap-2 sticky top-0 bg-background z-10 py-1">
                        <Badge variant="outline" className="bg-rose-500/5 text-rose-600 border-rose-500/20 text-xs font-bold px-2 py-0.5 uppercase tracking-wider">
                          {group.reason}
                        </Badge>
                        <div className="h-px flex-1 bg-border/20" />
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{group.logs.length} Sites</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.logs.map((log, j) => (
                          <div key={j} className="flex items-center justify-between p-3 rounded-lg hover:bg-rose-500/5 transition-all border border-transparent hover:border-rose-500/10 active:scale-[0.98]">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded bg-rose-500/10 flex items-center justify-center shrink-0">
                                <XCircle className="h-4 w-4 text-rose-500" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <p className="font-medium text-sm truncate tracking-tight text-foreground">{log.domain}</p>
                                <p className="text-[10px] text-muted-foreground/50">{formatTime(log.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg tracking-tight">Everything is clear!</h4>
                      <p className="text-sm text-muted-foreground max-w-[240px]">We haven't blocked any threats for this profile recently.</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SeamlessSection>
      {/* CONNECTED DEVICES */}
      <SeamlessSection
        title="Protected Devices"
        description="Every hardware connection verified and secured by Safeari."
      >
        <div className="p-2 sm:p-6 bg-card/30">
          {devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device, i) => (
                <div key={i} className="group flex items-center gap-4 p-5 rounded-xl bg-background border border-border/40 hover:border-primary/30 hover-lift">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 transition-transform group-hover:scale-110">
                    <Laptop className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm truncate tracking-tight">{device.name}</p>
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                    </div>
                    <div className="flex flex-col text-[10px] sm:text-xs">
                      <span className="text-muted-foreground/70 font-medium">{device.model || 'Standard Device'}</span>
                      <span className="text-primary font-bold uppercase tracking-widest mt-1">
                        {device.queries.toLocaleString()} SECURE REQUESTS
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/60">
                <Laptop className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <h4 className="font-bold text-base tracking-tight">No protected devices</h4>
                <p className="text-sm text-muted-foreground max-w-[240px] mb-4">Protect your family's hardware by setting up our custom DNS.</p>
                <Button onClick={() => setShowDNSSetup(true)} variant="outline" size="sm" className="rounded-full px-6">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Protection Guide
                </Button>
              </div>
            </div>
          )}
        </div>
      </SeamlessSection>

      {/* RECENT ACTIVITY LOGS */}
      <SeamlessSection
        title="Recent Activity"
        description="A live feed of the most recent requests and security events."
      >
        <div className="p-2 sm:p-6 bg-card/30">
          <div className="relative mb-8 pt-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Filter by domain or site name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-11 h-12 bg-background border-border/40 rounded-xl focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="space-y-6 max-h-[800px] overflow-y-auto no-scrollbar pr-1">
            {['today', 'yesterday', 'older'].map(day => {
              const logs = filteredGroupedLogs[day] || [];
              if (logs.length === 0) return null;

              const dayLabel = day === 'today' ? 'Today' : day === 'yesterday' ? 'Yesterday' : 'Older Activity';
              const displayedLogs = logs.slice(0, activityPage * ACTIVITIES_PER_PAGE);
              const hasMore = logs.length > displayedLogs.length;
              const isExpanded = expandedDays.includes(day);

              return (
                <div key={day} className="space-y-4">
                  <button
                    onClick={() => toggleDay(day)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-accent/20 hover:bg-accent/30 border border-border/20 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shadow-sm">
                        <Calendar className="h-4 w-4 text-primary/70" />
                      </div>
                      <span className="font-bold tracking-tight text-sm">
                        {dayLabel}
                        <span className="ml-2 text-muted-foreground/60 font-medium">({logs.length})</span>
                      </span>
                    </div>
                    <ChevronDown
                      className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded ? "rotate-180" : "")}
                    />
                  </button>

                  {isExpanded && (
                    <div className="grid grid-cols-1 gap-2 pl-2">
                      {displayedLogs.map((log, i) => (
                        <div
                          key={i}
                          className="group flex items-center gap-4 p-4 rounded-xl hover:bg-accent/5 transition-all border border-transparent hover:border-border/30"
                        >
                          <div className="flex flex-col min-w-[64px]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                              {formatTime(log.timestamp)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {log.domain}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {log.status === 'default' ? (
                              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <ShieldAlert className="h-4 w-4 text-rose-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {hasMore && (
                        <div className="flex justify-center pt-4 pb-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivityPage(p => p + 1);
                            }}
                            className="rounded-full px-8 border-none bg-accent/30 hover:bg-accent/50 text-xs font-bold uppercase tracking-widest transition-all"
                          >
                            Load More ({logs.length - displayedLogs.length} remaining)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.values(filteredGroupedLogs).every(logs => logs.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-70">
                <Search className="h-12 w-12 text-muted-foreground/20" />
                <div>
                  <h4 className="font-bold text-base tracking-tight">No activity found</h4>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    {searchQuery ? 'Try adjusting your search filters.' : 'Browsing data will appear here once detected.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SeamlessSection>

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
    </div >
  );
};

export default ParentAnalyticsDashboard;