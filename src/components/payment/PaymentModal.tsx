import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubscription } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";
import SafeariFullLogo from "@/assets/logofull.svg";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierName: string;
  onSuccess?: () => void;
}

export const PaymentModal = ({ isOpen, onClose, tierName, onSuccess }: PaymentModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'preparing' | 'redirecting'>('preparing');

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    const initializePayment = async () => {
      try {
        setStatus('preparing');

        const subscription = await createSubscription({
          tier: tierName.toLowerCase(),
          provider: 'paystack'
        });

        // Don't proceed if modal was closed during API call
        if (isCancelled) {
          return;
        }

        // Set redirecting status
        setStatus('redirecting');

        // Redirect immediately - no delay
        window.location.href = subscription.authorization_url;

      } catch (error: any) {
        if (!isCancelled) {
          toast({
            variant: "destructive",
            title: "Payment initialization failed",
            description: error.response?.data?.error || "Please try again.",
          });
          onClose();
        }
      }
    };

    initializePayment();

    // Cleanup function to prevent redirect after close
    return () => {
      isCancelled = true;
    };
  }, [isOpen, tierName, navigate, toast, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-muted/20 to-primary/5 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border/50 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={SafeariFullLogo} alt="Safeari" className="h-12 sm:h-14 w-auto" />
            </div>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {status === 'preparing' ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <ExternalLink className="h-8 w-8 text-primary animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold">
                {status === 'preparing' ? 'Preparing Payment' : 'Redirecting to Payment'}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {status === 'preparing'
                  ? 'Setting up your secure payment session...'
                  : 'Taking you to our secure payment gateway...'
                }
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                Please do not close this window
              </p>
            </div>

            {/* Loading dots */}
            <div className="flex justify-center gap-1 pt-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
