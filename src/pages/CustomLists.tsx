import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Search, Loader2, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAllowlist, useDenylist } from "@/hooks/queries";
import UpgradeModal from "@/components/modals/UpgradeModal";
import {
  useAddToAllowlist,
  useRemoveFromAllowlist,
  useAddToDenylist,
  useRemoveFromDenylist,
} from "@/hooks/mutations";

const CustomLists = () => {
  const { currentProfile } = useProfile();
  const { subscription } = useSubscription();
  const { toast } = useToast();

  // React Query hooks
  const allowlistQuery = useAllowlist(currentProfile?.id);
  const denylistQuery = useDenylist(currentProfile?.id);

  // Mutation hooks
  const addToAllowlistMutation = useAddToAllowlist(currentProfile?.id || 0);
  const removeFromAllowlistMutation = useRemoveFromAllowlist(currentProfile?.id || 0);
  const addToDenylistMutation = useAddToDenylist(currentProfile?.id || 0);
  const removeFromDenylistMutation = useRemoveFromDenylist(currentProfile?.id || 0);

  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [denylist, setDenylist] = useState<string[]>([]);
  const [allowlistInput, setAllowlistInput] = useState("");
  const [denylistInput, setDenylistInput] = useState("");
  const [allowlistSearch, setAllowlistSearch] = useState("");
  const [denylistSearch, setDenylistSearch] = useState("");
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Initialize local state from React Query data
  useEffect(() => {
    if (allowlistQuery.data) {
      setAllowlist(allowlistQuery.data.domains?.map((d: any) => d.id) || []);
    }
  }, [allowlistQuery.data]);

  useEffect(() => {
    if (denylistQuery.data) {
      setDenylist(denylistQuery.data.domains?.map((d: any) => d.id) || []);
    }
  }, [denylistQuery.data]);

  // Show error toasts if queries fail
  useEffect(() => {
    if (allowlistQuery.error) {
      toast({
        variant: "destructive",
        title: "Failed to load allowlist",
        description: allowlistQuery.error instanceof Error ? allowlistQuery.error.message : "Please try again"
      });
    }
  }, [allowlistQuery.error, toast]);

  useEffect(() => {
    if (denylistQuery.error) {
      toast({
        variant: "destructive",
        title: "Failed to load denylist",
        description: denylistQuery.error instanceof Error ? denylistQuery.error.message : "Please try again"
      });
    }
  }, [denylistQuery.error, toast]);

  const isLoading = allowlistQuery.isLoading || denylistQuery.isLoading;
  const tier = subscription?.tier || 'free';
  const totalEntries = allowlist.length + denylist.length;
  const listLimit = subscription?.list_entries_limit ?? 5;

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  };

  const addToAllowlistHandler = async () => {
    if (!currentProfile) return;

    const domain = allowlistInput.trim().toLowerCase();

    if (!domain) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    if (!validateDomain(domain)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain (e.g., example.com)",
        variant: "destructive",
      });
      return;
    }

    if (allowlist.includes(domain)) {
      toast({
        title: "Already Added",
        description: "This domain is already in your allowlist",
        variant: "destructive",
      });
      return;
    }

    setAllowlistInput("");

    try {
      await addToAllowlistMutation.mutateAsync([domain]);
      toast({
        title: "Domain Added",
        description: `${domain} has been added to allowlist`,
      });
    } catch (error: any) {
      // Backend returns 403 when limit reached
      if (error.response?.status === 403) {
        setUpgradeModalOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to add domain",
          description: error.message
        });
      }
    }
  };

  const addToDenylistHandler = async () => {
    if (!currentProfile) return;

    const domain = denylistInput.trim().toLowerCase();

    if (!domain) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    if (!validateDomain(domain)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain (e.g., example.com)",
        variant: "destructive",
      });
      return;
    }

    if (denylist.includes(domain)) {
      toast({
        title: "Already Added",
        description: "This domain is already in your denylist",
        variant: "destructive",
      });
      return;
    }

    setDenylistInput("");

    try {
      await addToDenylistMutation.mutateAsync([domain]);
      toast({
        title: "Domain Blocked",
        description: `${domain} has been added to denylist`,
      });
    } catch (error: any) {
      // Backend returns 403 when limit reached
      if (error.response?.status === 403) {
        setUpgradeModalOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to block domain",
          description: error.message
        });
      }
    }
  };

  const removeFromAllowlistHandler = async (domain: string) => {
    if (!currentProfile) return;

    try {
      await removeFromAllowlistMutation.mutateAsync([domain]);
      toast({
        title: "Domain Removed",
        description: `${domain} has been removed from allowlist`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to remove domain",
        description: error.message
      });
    }
  };

  const removeFromDenylistHandler = async (domain: string) => {
    if (!currentProfile) return;

    try {
      await removeFromDenylistMutation.mutateAsync([domain]);
      toast({
        title: "Domain Unblocked",
        description: `${domain} has been removed from denylist`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to unblock domain",
        description: error.message
      });
    }
  };

  const filteredAllowlist = allowlist.filter((domain) =>
    domain.toLowerCase().includes(allowlistSearch.toLowerCase())
  );

  const filteredDenylist = denylist.filter((domain) =>
    domain.toLowerCase().includes(denylistSearch.toLowerCase())
  );

  const handleRefresh = async () => {
    try {
      await Promise.all([
        allowlistQuery.refetch(),
        denylistQuery.refetch()
      ]);
      toast({
        title: "Lists Refreshed",
        description: "Your custom lists have been updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Could not refresh lists. Please try again.",
      });
    }
  };

  const isRefreshing = allowlistQuery.isFetching || denylistQuery.isFetching;
  const isAtLimit = listLimit !== -1 && totalEntries >= listLimit;

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a profile</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Custom Lists</h1>
            <p className="text-muted-foreground mt-1">
              Manage domain allowlist and denylist
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Tier Limit Warning - Only show if not unlimited */}
        {listLimit !== -1 && (
          <Alert className={isAtLimit ? "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20" : "bg-slate-50 dark:bg-slate-800"}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  <strong>List Usage:</strong> {totalEntries} / {listLimit} entries used
                  {isAtLimit && " - Limit reached, Upgrade for more control over what sites your child can access"}
                </span>
                {isAtLimit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-4"
                    onClick={() => setUpgradeModalOpen(true)}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <AlertDescription className="text-slate-700 dark:text-slate-300">
            <strong>Custom Lists bypass all restrictions:</strong> Allowlisted sites are always accessible, denylist sites are always blocked - regardless of screen time settings, categories, or services. Use these for ultimate control.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="allowlist" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="allowlist">
              Allowlist ({allowlist.length})
            </TabsTrigger>
            <TabsTrigger value="denylist">
              Denylist ({denylist.length})
            </TabsTrigger>
          </TabsList>

          {/* Allowlist Tab */}
          <TabsContent value="allowlist" className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Add Domain to Allowlist</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter domain (e.g., example.com)"
                  value={allowlistInput}
                  onChange={(e) => setAllowlistInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addToAllowlistHandler()}
                />
                <Button onClick={addToAllowlistHandler}>
                  Add Domain
                </Button>
              </div>
            </div>

            {allowlist.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search allowlist..."
                  value={allowlistSearch}
                  onChange={(e) => setAllowlistSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {filteredAllowlist.length > 0 ? (
              <div className="space-y-2">
                {filteredAllowlist.map((domain) => {
                  const isPending = pendingOperations.has(domain);
                  return (
                    <div
                      key={domain}
                      className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                        isPending ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{domain}</span>
                        <Badge variant="secondary">
                          {isPending ? 'Syncing...' : 'Active'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromAllowlistHandler(domain)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  {allowlist.length === 0
                    ? "No domains in allowlist yet. Add one above."
                    : "No domains match your search"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Denylist Tab */}
          <TabsContent value="denylist" className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Add Domain to Denylist</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter domain (e.g., blocked-site.com)"
                  value={denylistInput}
                  onChange={(e) => setDenylistInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addToDenylistHandler()}
                />
                <Button onClick={addToDenylistHandler} variant="destructive">
                  Block Domain
                </Button>
              </div>
            </div>

            {denylist.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search denylist..."
                  value={denylistSearch}
                  onChange={(e) => setDenylistSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {filteredDenylist.length > 0 ? (
              <div className="space-y-2">
                {filteredDenylist.map((domain) => {
                  const isPending = pendingOperations.has(domain);
                  return (
                    <div
                      key={domain}
                      className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                        isPending ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{domain}</span>
                        <Badge variant="destructive">
                          {isPending ? 'Syncing...' : 'Blocked'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromDenylistHandler(domain)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  {denylist.length === 0
                    ? "No domains in denylist yet. Block one above."
                    : "No domains match your search"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature="Unlimited List Entries"
        currentTier={tier}
        requiredTier="basic"
      />
    </>
  );
};

export default CustomLists;