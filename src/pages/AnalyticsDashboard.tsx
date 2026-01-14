import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Lock, Shield, Activity, Laptop, Eye, RefreshCw, FileDown,
  AlertCircle, Users, ChevronDown, Search, X
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
  calculateMetrics,
  groupBlockReasons,
  formatTimeline,
  formatStatus,
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
  const metrics = useMemo(() => calculateMetrics(overviewQuery.data), [overviewQuery.data]);

  const blockReasons = useMemo(
    () => groupBlockReasons(logsQuery.data?.data || []),
    [logsQuery.data?.data]
  );

  const chartData = useMemo(
    () => formatTimeline(timelineQuery.data || [], timeRange),
    [timelineQuery.data, timeRange]
  );

  const highlights = useMemo(
    () => calculateTodaysHighlights(
      timelineQuery.data || [],
      blockReasons,
      trackersQuery.data?.allowed_trackers || [],
      currentProfile?.display_name || ''
    ),
    [timelineQuery.data, blockReasons, trackersQuery.data?.allowed_trackers, currentProfile?.display_name]
  );

  const devices = overviewQuery.data?.devices || [];
  const topAllowedDomains = (domainsQuery.data || []).slice(0, 15);
  const allowedTrackers = trackersQuery.data?.allowed_trackers || [];
  const trackerCount = trackersQuery.data?.summary.allowed_count || 0;
  const allLogs = logsQuery.data?.data || [];
  
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

        <Card className="border-0 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Waiting for {currentProfile.display_name}'s First Activity...</h3>
              <p className="text-muted-foreground max-w-md">
                Make sure you set up {currentProfile.display_name}'s devices as instructed.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl px-4 sm:px-0">
              <Button
                onClick={() => setShowDNSSetup(true)}
                size="lg"
                className="w-full"
              >
                <Shield className="h-5 w-5 mr-2" />
                View DNS Setup Instructions
              </Button>
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

  return (
    <div className="space-y-6 pb-20 lg:pb-6 max-w-[1400px] mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">{currentProfile.display_name}'s Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Select value={exportFormat} onValueChange={(v: 'json' | 'csv') => setExportFormat(v)}>
            <SelectTrigger className="w-20 sm:w-24">
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
            <FileDown className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* TIME RANGE SELECTOR */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ANALYTICS_CONFIG.TIME_RANGES.map((range) => {
          const available = isTimeRangeAvailable(range.value);
          return (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              disabled={!available}
              onClick={() => handleTimeRangeChange(range.value)}
              className="whitespace-nowrap"
            >
              {!available && <Lock className="h-3 w-3 mr-1" />}
              {range.label}
            </Button>
          );
        })}
      </div>

      {/* HERO SECTION - DONUT CHART + HIGHLIGHTS */}
      <Card className="overflow-hidden !border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            {/* RECHARTS DONUT CHART */}
            <DonutChart 
              safeCount={metrics.total - metrics.blocked}
              blockedCount={metrics.blocked}
              size={180}
              className="mb-4"
            />

            <div className={`text-lg font-semibold mb-1 ${metrics.blocked === 0 ? 'text-green-600' : 'text-primary'}`}>
              {metrics.blocked === 0 ? `✓ ${currentProfile.display_name} is protected` : `${metrics.blocked} threats blocked`}
            </div>
            <div className="text-sm text-muted-foreground">
              {(metrics.total - metrics.blocked).toLocaleString()} safe · {metrics.blocked} blocked
            </div>
          </div>

          {/* QUICK HIGHLIGHTS */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-muted/50">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Peak Activity</div>
              <div className="text-base font-semibold">{highlights.peakHour?.time || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">{highlights.peakHour?.count.toLocaleString() || '0'} requests</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Trackers</div>
              <div className="text-base font-semibold">{trackerCount}</div>
              <div className="text-xs text-muted-foreground">companies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KEY METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          { icon: Activity, value: metrics.total, label: 'Total Requests', color: 'text-muted-foreground' },
          { icon: Laptop, value: devices.length, label: 'Connected Devices', color: 'text-muted-foreground' },
          { icon: Eye, value: trackerCount, label: 'Tracking Companies', color: 'text-muted-foreground' },
          { icon: Shield, value: blockReasons.length > 0 ? blockReasons[0].count : 0, label: blockReasons.length > 0 ? blockReasons[0].reason.substring(0, 15) + '...' : 'No Blocks', color: 'text-muted-foreground' }
        ].map((item, i) => (
          <div key={i} className="rounded-lg bg-card p-5">
            <item.icon className={`h-5 w-5 ${item.color} mb-2`} />
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-xs text-muted-foreground font-medium truncate">{item.label}</div>
          </div>
        ))}
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
              <Button size="sm" variant="outline" className="whitespace-nowrap">
                Block Trackers
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* TABBED SECTION */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="screenTime">Screen Time</TabsTrigger>
            <TabsTrigger value="mostVisited">Most Visited</TabsTrigger>
            <TabsTrigger value="blocked" className="relative">
              Blocked
              {blockReasons.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {blockReasons.reduce((sum, reason) => sum + reason.domains.length, 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <CardContent className="pt-6 px-6">
            {activeTab === "blocked" && blockReasons.length > 0 && (
              <div className="mb-4 text-xs text-muted-foreground">
                Showing blocks from: Your Blocklist settings, Ad blockers, and Security filters
              </div>
            )}
            <TabsContent value="screenTime" className="mt-0">
              {/* Big Summary */}
              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {metrics.total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                {highlights.peakHour ? `Most active ${highlights.peakHour.time}` : 'No activity detected'}
              </div>
              </div>

              {/* Timeline Chart */}
              <div className="h-72 flex items-end gap-2 overflow-x-auto pb-2">
              {chartData.map((item, i) => {
              const total = item.allowed + item.blocked;
              const allowedHeight = ((item.allowed / maxTimelineValue) * 100);
              const blockedHeight = ((item.blocked / maxTimelineValue) * 100);
              const totalHeight = allowedHeight + blockedHeight;

              return (
              <div key={i} className="flex-1 flex flex-col items-center min-w-[32px] max-w-[48px]">
              <div className="w-full flex flex-col items-center mb-2 relative h-full">
              {/* Single bar with smooth gradient */}
              <div 
              className="w-full relative group rounded-t-lg overflow-hidden transition-all duration-300 shadow-sm"
              style={{ 
              height: `${Math.max(totalHeight, 5)}%`,
              minHeight: total > 0 ? '24px' : '8px',
              background: item.blocked > 0 
                ? `linear-gradient(to top, 
                  rgb(16, 185, 129) 0%, 
                  rgb(34, 197, 94) ${(item.allowed / total * 100) - 1}%, 
                  rgb(239, 68, 68) ${(item.allowed / total * 100) + 1}%, 
                  rgb(220, 38, 38) 100%)`
                : `linear-gradient(to top, rgb(16, 185, 129), rgb(34, 197, 94), rgb(5, 150, 105))`,
              }}
              >
              {/* Glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
              {/* Hover glow */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-all duration-200 pointer-events-none" />
              </div>
              </div>
              {/* Day/Hour labels */}
              <div className="text-xs text-muted-foreground font-medium">{item.time}</div>
              </div>
              );
              })}
              </div>

              {/* Compact Legend */}
              <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-sm" />
              <span>Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-rose-600 rounded-sm" />
              <span>Blocked</span>
              </div>
              </div>
          </TabsContent>

            <TabsContent value="mostVisited" className="mt-0 max-h-96 overflow-y-auto space-y-1">
              {topAllowedDomains.map((domain, i) => {
                const { display, original } = extractSiteName({ root: domain.root, domain: domain.domain });
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors border-b last:border-b-0 border-muted">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{display}</p>
                        {domain.tracker && <Badge variant="outline" className="text-xs">Tracker</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{original}</p>
                    </div>
                    <div className="text-lg font-bold text-primary ml-3">{domain.queries}</div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="blocked" className="mt-0 max-h-96 overflow-y-auto space-y-3">
              {blockReasons.length > 0 ? (
                blockReasons.flatMap((item) => 
                  item.domains.map((domain, idx) => {
                    const isDenylist = item.reason.toLowerCase().includes('denylist') || 
                                     item.reason.toLowerCase().includes('blocked by you') ||
                                     item.reason.toLowerCase().includes('parental');
                    const isAdBlock = item.reason.toLowerCase().includes('ad') || 
                                     item.reason.toLowerCase().includes('tracker');
                    
                    const borderColor = isDenylist ? 'border-l-[4px] border-red-500' : 
                                      isAdBlock ? 'border-l-[4px] border-orange-500' : 
                                      'border-l-[4px] border-blue-500';
                    const bgColor = isDenylist ? 'bg-red-50/30 dark:bg-red-950/5' : 
                                  isAdBlock ? 'bg-orange-50/30 dark:bg-orange-950/5' : 
                                  'bg-blue-50/30 dark:bg-blue-950/5';
                    
                    const { display, original } = extractSiteName({ domain });
                    
                    return (
                      <div key={`${item.reason}-${idx}`} className={`rounded-lg ${bgColor} overflow-hidden`}>
                        <div className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base mt-0.5 flex-shrink-0">🚫</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{display}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{original}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.reason} · {item.count} {item.count === 1 ? 'attempt' : 'attempts'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No sites blocked</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* CONNECTED DEVICES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {devices.map((device, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-muted/20">
                  <Laptop className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{device.name}</p>
                      <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" title="Active" />
                    </div>
                    <p className="text-xs text-muted-foreground">{device.model || 'Unknown model'}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {device.queries.toLocaleString()} queries
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Laptop className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No devices detected yet for {currentProfile.display_name}</p>
              <Button onClick={() => setShowDNSSetup(true)} variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Setup Device Protection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECENT ACTIVITY */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Badge variant="outline">{allLogs.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {['today', 'yesterday', 'older'].map(day => {
              const logs = filteredGroupedLogs[day] || [];
              if (logs.length === 0) return null;
              
              const dayLabel = day === 'today' ? 'Today' : day === 'yesterday' ? 'Yesterday' : 'Older';
              const displayedLogs = logs.slice(0, activityPage * ACTIVITIES_PER_PAGE);
              const hasMore = logs.length > displayedLogs.length;
              
              return (
                <div key={day}>
                  <button
                    onClick={() => toggleDay(day)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors mb-2"
                  >
                    <span className="text-sm font-semibold">
                      📅 {dayLabel} ({logs.length} {logs.length === 1 ? 'activity' : 'activities'})
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedDays.includes(day) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedDays.includes(day) && (
                    <div className="space-y-2 mb-3">
                      {displayedLogs.map((log, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors border-b last:border-b-0 border-muted/50"
                        >
                          <span className="text-sm text-muted-foreground min-w-[70px] font-mono">
                            {new Date(log.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          <span className="flex-1 text-sm font-medium truncate">{log.domain}</span>
                          <span className="text-2xl flex-shrink-0">
                            {log.status === 'allowed' ? '✅' : '🚫'}
                          </span>
                        </div>
                      ))}
                      
                      {hasMore && (
                        <div className="flex justify-center pt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActivityPage(p => p + 1)}
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
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No activities match your search' : 'No recent activity'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
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