import { useEffect, useState } from "react";
import { getInvoices, Invoice } from "@/lib/api/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const InvoiceSection = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load invoices",
          description: error.response?.data?.error || "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [toast]);

  const handleDownload = async (invoice: Invoice) => {
    try {
      window.open(invoice.pdf_url, '_blank');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Unable to download invoice.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Receipts</CardTitle>
          <CardDescription>View and download your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices & Receipts</CardTitle>
        <CardDescription>View and download your payment history</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No invoices available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-1 flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      Invoice #{invoice.invoice_number}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span>{format(new Date(invoice.issued_at), 'MMM dd, yyyy')}</span>
                      <span className="font-medium text-foreground">
                        {invoice.currency} {invoice.amount}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-success/10 text-success">
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(invoice)}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
