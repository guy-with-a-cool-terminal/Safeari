import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getCurrentSubscription } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SafeariLogo from "@/assets/favicon.svg";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  const reference = searchParams.get('reference');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscription = await getCurrentSubscription();
        
        if (subscription.status === 'active') {
          setStatus('success');
          toast({
            title: "Payment Successful!",
            description: "Your subscription is now active.",
          });
          
          setTimeout(() => {
            navigate('/profiles?create=true');
          }, 2000);
        } else if (subscription.status === 'pending_verification') {
          setStatus('checking');
          setTimeout(checkPaymentStatus, 3000);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        setStatus('failed');
      }
    };

    if (reference) {
      checkPaymentStatus();
    }
  }, [reference, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={SafeariLogo} alt="Safeari" className="h-12 w-12" />
          </div>
          <CardTitle>
            {status === 'checking' && "Processing Payment..."}
            {status === 'success' && "Payment Successful!"}
            {status === 'failed' && "Payment Failed"}
          </CardTitle>
          <CardDescription>
            {status === 'checking' && "Please wait while we confirm your payment"}
            {status === 'success' && "Your subscription is now active"}
            {status === 'failed' && "We couldn't process your payment"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'checking' && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-success" />
          )}
          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <Button onClick={() => navigate('/onboarding/subscription')}>
                Try Again
              </Button>
            </>
          )}
          
          {status === 'checking' && (
            <p className="text-sm text-muted-foreground text-center">
              Reference: {reference}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;