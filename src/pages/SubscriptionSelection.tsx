import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ArrowRight, Home, LayoutDashboard } from "lucide-react";
import type { SubscriptionTier } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SafeariFullLogo  from "@/assets/logofull.svg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createSubscription } from "@/lib/api";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { TierCard } from "@/components/subscription/TierCard";
import { useSubscriptionTiers } from "@/hooks/useSubscriptionTiers";
import { usePaystack } from "@/hooks/usePaystack";

const SubscriptionSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { tiers, isLoading } = useSubscriptionTiers();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  usePaystack();

  const handleSelectTier = async (tier: SubscriptionTier) => {
    setSelectedTier(tier.name);

    try {
      if (tier.name.toLowerCase() === 'free') {
        await createSubscription({
          tier: 'free',
          provider: 'manual'
        });

        toast({
          title: "Free plan activated",
          description: "Create your first profile to get started.",
        });
        navigate('/profiles?create=true');
      } else {
        setShowPaymentModal(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Failed to activate ${tier.name} plan`,
        description: error.response?.data?.error || "Please try again.",
      });
    } finally {
      if (tier.name.toLowerCase() === 'free') {
        setSelectedTier(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={SafeariFullLogo} alt="Safeari" className="h-7 sm:h-8 w-auto" />
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild className="text-sm">
              <Link to={isAuthenticated ? "/dashboard" : "/"}>
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </>
                )}
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 sm:space-y-3 mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Choose Your <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Protection Plan</span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade based on your family needs
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-10">
            {tiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                isRecommended={tier.name === 'Family'}
                isLoading={selectedTier === tier.name}
                onSelect={handleSelectTier}
              />
            ))}
          </div>

          <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg text-center">Core Protection Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {['DNS Filtering', 'Threat Protection', 'Ad Blocking', 'Real-time Analytics'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/40">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedTier(null);
        }}
        tierName={selectedTier || ""}
        onSuccess={() => {
          toast({
            title: "Payment Successful",
            description: "Your subscription is being activated.",
          });
        }}
      />
    </div>
  );
};

export default SubscriptionSelection;