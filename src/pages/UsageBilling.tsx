import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlobalNav } from "@/components/navigation/GlobalNav";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUsageSummary, getInvoices, type UsageSummary, type Invoice } from "@/lib/api/subscriptions";
import { BarChart3, FileText, Download, AlertTriangle, TrendingUp, Package } from "lucide-react";

const UsageBilling = () => {
  const { subscription, subscriptionTier, isLoading: subLoading } = useSubscription();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usageData, invoiceData] = await Promise.all([
        getUsageSummary(),
        getInvoices()
      ]);
      setUsage(usageData);
      setInvoices(invoiceData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: error.response?.data?.error || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    try {
      if (invoice.pdf_url) {
        window.open(invoice.pdf_url, '_blank');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Unable to open invoice PDF.",
      });
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return "bg-destructive";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-primary";
  };

  const profilesPercentage = usage?.limits.profiles === -1 
    ? 0 
    : (usage?.usage.profiles_created / (usage?.limits.profiles || 1)) * 100;

  const isProfilesWarning = profilesPercentage >= 80;
  const isProfilesCritical = profilesPercentage >= 95;

  if (subLoading || isLoading) {
    return (
      <>
        <GlobalNav />
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalNav />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Usage & Billing</h1>
          <p className="text-muted-foreground">
            Monitor your plan usage and manage billing information
          </p>
        </div>

        {/* Usage Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Current Usage
                </CardTitle>
                <CardDescription>Your usage against plan limits</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {subscriptionTier?.name || "Free"} Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profiles Warning/Critical Alert */}
            {isProfilesWarning && (
              <Alert variant={isProfilesCritical ? "destructive" : "default"} className={!isProfilesCritical ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : ""}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {isProfilesCritical 
                      ? "Profile limit almost reached! Upgrade to add more profiles."
                      : "You're approaching your profile limit. Consider upgrading."}
                  </span>
                  <Button 
                    variant={isProfilesCritical ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => navigate('/account/subscription')}
                    className="ml-4"
                  >
                    Upgrade Plan
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Profiles Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Profiles</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage?.usage.profiles_created || 0} / {usage?.limits.profiles === -1 ? "∞" : usage?.limits.profiles}
                </span>
              </div>
              <Progress 
                value={profilesPercentage} 
                indicatorClassName={getProgressColor(profilesPercentage)}
              />
              {isProfilesWarning && (
                <p className="text-xs text-muted-foreground">
                  {profilesPercentage.toFixed(0)}% of limit used
                </p>
              )}
            </div>

            {/* API Requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">API Requests (This Month)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage?.usage.api_calls?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Current Tier Info */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {subscriptionTier?.name || "Free"}
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/account/subscription')}>
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoices & Receipts
            </CardTitle>
            <CardDescription>View and download your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Invoices will appear here after your first payment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                            <Badge 
                              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                              className={invoice.status === 'paid' ? 'bg-green-500/10 text-green-700 hover:bg-green-500/10' : ''}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Date: {new Date(invoice.issued_at).toLocaleDateString()}</p>
                            <p>Amount: {invoice.currency} {parseFloat(invoice.amount).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(invoice)}
                            disabled={!invoice.pdf_url}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UsageBilling;
