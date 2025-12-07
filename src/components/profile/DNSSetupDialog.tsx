import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCircle2, AlertCircle, Loader2, Shield, Smartphone, Monitor, Network, HelpCircle, MessageCircle, Phone, Mail, ExternalLink } from "lucide-react";
import SafeariLogo from "@/assets/favicon.svg";
import { useToast } from "@/hooks/use-toast";
import { getNextDNSDetails, getDeviceStats } from "@/lib/api";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { WHATSAPP_LINK } from "@/components/feedback/WhatsAppCTA";
import type { NextDNSDetails } from "@/lib/api/types";

interface DNSSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: number;
  profileName: string;
}

interface InstructionStep {
  title: string;
  description: string;
  copyText?: string;
  copyLabel?: string;
  linkUrl?: string;
  linkText?: string;
}

interface PlatformInstructions {
  icon: typeof Smartphone;
  name: string;
  steps: InstructionStep[];
}

const InstructionStep = ({ number, title, description, copyText, copyLabel, linkUrl, linkText }: InstructionStep & { number: number }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (copyText) {
      navigator.clipboard.writeText(copyText);
      toast({
        title: "Copied!",
        description: `${copyLabel || "Text"} copied to clipboard`,
      });
    }
  };

  return (
    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg border">
      <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
        {number}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>

        {linkUrl && (
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkText || "Open Setup"}
              <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
            </a>
          </Button>
        )}

        {copyText && (
          <div className="flex gap-2">
            <Input
              value={copyText}
              readOnly
              className="font-mono text-xs bg-background flex-1 min-w-0"
            />
            <Button size="sm" variant="outline" onClick={handleCopy} className="flex-shrink-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const DNSSetupDialog = ({ open, onOpenChange, profileId, profileName }: DNSSetupDialogProps) => {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "connected" | "not-setup">("idle");
  const [dnsDetails, setDnsDetails] = useState<NextDNSDetails | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [activeTab, setActiveTab] = useState("android");
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();
  const { subscription } = useSubscription();

  useEffect(() => {
    if (open && profileId && profileId > 0) {
      fetchDNSDetails();
      const timeoutId = setTimeout(() => testConnection(true), 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [open, profileId]);

  const fetchDNSDetails = async () => {
    setIsLoadingInitial(true);
    try {
      const response = await getNextDNSDetails(profileId);
      setDnsDetails(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load setup",
        description: "Please try again",
      });
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const testConnection = useCallback(async (isBackground = false) => {
    if (!profileId) return;
    if (!isBackground) setConnectionStatus("testing");

    try {
      const devices = await getDeviceStats(profileId, '1h');
      const hasActiveQueries = devices.some(device => device.queries > 0);

      if (hasActiveQueries) {
        setConnectionStatus("connected");
        if (!isBackground) {
          toast({
            title: "Connected!",
            description: `${profileName}'s device is protected`,
          });
        }
      } else {
        setConnectionStatus("not-setup");
        if (!isBackground) {
          toast({
            variant: "destructive",
            title: "Not connected yet",
            description: "Complete setup and try again",
          });
        }
      }
    } catch (error) {
      setConnectionStatus("not-setup");
    }
  }, [profileId, toast]);

  const getPlatformInstructions = (): Record<string, PlatformInstructions> => {
    if (!dnsDetails) return {};

    const dotHostname = `${dnsDetails.id}.dns.nextdns.io`;
    const configProfileUrl = `https://apple.nextdns.io/?profile=${dnsDetails.id}`;

    return {
      android: {
        icon: Smartphone,
        name: "Android",
        steps: [
          {
            title: "Open Private DNS Settings",
            description: "Go to Settings → Network & internet → Private DNS"
          },
          {
            title: "Enter Protection Address",
            description: "Select 'Private DNS provider hostname' and paste:",
            copyText: dotHostname,
            copyLabel: "Protection address"
          },
          {
            title: "Save & You're Protected!",
            description: "Tap Save. Done! All harmful content is now blocked."
          }
        ]
      },
      ios: {
        icon: Smartphone,
        name: "iPhone/iPad",
        steps: [
          {
            title: "Install Protection Profile",
            description: "Tap below to open Apple's setup page",
            linkUrl: configProfileUrl,
            linkText: "Open Setup"
          },
          {
            title: "Download & Install",
            description: "Tap 'Download' → Go to Settings → Profile Downloaded → Install"
          },
          {
            title: "You're Protected!",
            description: "Done! Your iPhone/iPad is now filtering harmful content."
          }
        ]
      },
      windows: {
        icon: Monitor,
        name: "Windows",
        steps: [
          {
            title: "Download & Install Protection Software",
            description: "Click below to download and install the protection software",
            linkUrl: "https://nextdns.io/download/windows/stable",
            linkText: "Download for Windows"
          },
          {
            title: "Enter Your Configuration ID",
            description: "After installing, right-click the system tray icon → Settings → Enter your Configuration ID:",
            copyText: dnsDetails.id,
            copyLabel: "Configuration ID"
          },
          {
            title: "Enable Protection",
            description: "Right-click the system tray icon → Click 'Enable'. Done! Your PC is now protected."
          }
        ]
      },
      mac: {
        icon: Monitor,
        name: "Mac",
        steps: [
          {
            title: "Run Quick Setup",
            description: "Open Terminal and paste this command:",
            copyText: 'sh -c "$(curl -sL https://nextdns.io/install)"',
            copyLabel: "Setup command"
          },
          {
            title: "Follow The Installer",
            description: "The installer will guide you through each step automatically"
          },
          {
            title: "You're Protected!",
            description: "Done! Your Mac is now filtering harmful content."
          }
        ]
      },
      linux: {
        icon: Monitor,
        name: "Linux",
        steps: [
          {
            title: "Run Quick Setup",
            description: "Open terminal and paste this command:",
            copyText: 'sh -c "$(curl -sL https://nextdns.io/install)"',
            copyLabel: "Setup command"
          },
          {
            title: "Follow The Installer",
            description: "The installer will guide you through automatically"
          },
          {
            title: "You're Protected!",
            description: "Done! Your Linux device is now protected."
          }
        ]
      }
    };
  };

  const platformInstructions = getPlatformInstructions();
  const currentPlatform = platformInstructions[activeTab];

  if (isLoadingInitial && !dnsDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Setup for {profileName}</DialogTitle>
            <DialogDescription>Preparing your protection settings...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const PlatformIcon = currentPlatform?.icon || Smartphone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
        {/* Sticky Help Button */}
        <div className="sticky top-0 z-10 bg-background pb-3 -mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full sm:w-auto"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Need Help?
          </Button>
        </div>

        {/* Help Section */}
        {showHelp && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium text-sm sm:text-base">Get Help Setting Up Protection</p>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">WhatsApp Group</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <a href="tel:0114399034">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Call Us</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <a href="mailto:support@safeari.com">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Email Support</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-card rounded-full flex items-center justify-center p-2 border flex-shrink-0">
              <img src={SafeariLogo} alt="Safeari" className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-xl truncate">Protect {profileName}'s Device</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">Simple 3-step setup</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Bonus Tip for Paid Users */}
        {subscription && subscription.tier !== 'free' && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-4">
              <p className="text-sm text-green-900 dark:text-green-100">
                💡 <strong>Bonus:</strong> {profileName} has multiple devices? Reuse this same profile across all of them - it's included in your plan!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Connection Status */}
        <Card className={
          connectionStatus === "connected" ? "bg-green-500/10 border-green-500/20" :
          connectionStatus === "not-setup" ? "bg-amber-500/10 border-amber-500/20" :
          "bg-muted/50"
        }>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {connectionStatus === "connected" && <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />}
                {connectionStatus === "not-setup" && <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 flex-shrink-0" />}
                {connectionStatus === "idle" && <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />}
                {connectionStatus === "testing" && <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm truncate">
                    {connectionStatus === "connected" && `${profileName} is Protected`}
                    {connectionStatus === "not-setup" && "Setup Needed"}
                    {connectionStatus === "idle" && `Ready to Protect ${profileName}`}
                    {connectionStatus === "testing" && "Checking..."}
                  </p>
                  <p className="text-muted-foreground text-xs truncate">
                    {connectionStatus === "connected" && "Harmful content is being blocked"}
                    {connectionStatus === "not-setup" && "Follow steps below"}
                    {connectionStatus === "idle" && "Choose device type"}
                    {connectionStatus === "testing" && "Testing connection..."}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testConnection(false)}
                disabled={connectionStatus === "testing"}
                className="flex-shrink-0 w-full sm:w-auto"
              >
                {connectionStatus === "testing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  "Check Protection"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Tabs */}
        <Tabs defaultValue="android" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
            {Object.entries(platformInstructions).map(([key, platform]) => {
              const IconComponent = platform.icon;
              return (
                <TabsTrigger key={key} value={key} className="text-xs sm:text-sm px-2 sm:px-4">
                  <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">{platform.name}</span>
                </TabsTrigger>
              );
            })}
            <TabsTrigger value="router" className="text-xs sm:text-sm relative px-2 sm:px-4">
              <Network className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Router</span>
              <span className="absolute -top-1 -right-0 sm:-right-1 bg-amber-500 text-white text-[10px] px-1 rounded">BETA</span>
            </TabsTrigger>
          </TabsList>

          {/* Platform Instructions */}
          {activeTab !== "router" && currentPlatform && (
            <TabsContent value={activeTab} className="space-y-4">
              <div className="space-y-3">
                {currentPlatform.steps.map((step, index) => (
                  <InstructionStep key={index} number={index + 1} {...step} />
                ))}
              </div>
            </TabsContent>
          )}

          {/* Router BETA Tab */}
          <TabsContent value="router" className="space-y-4">
            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Network className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="space-y-3 min-w-0">
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-amber-900 dark:text-amber-100">Router Setup is in BETA</p>
                      <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Router setup varies by brand and model. We're working on making it easier, but for now, let us help you!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-100">Get Personal Setup Help:</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Button asChild size="sm" variant="outline" className="justify-start">
                          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">WhatsApp</span>
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="justify-start">
                          <a href="tel:0114399034">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">0114399034</span>
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="justify-start">
                          <a href="mailto:support@safeari.com">
                            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">Email</span>
                          </a>
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      💡 <strong>Tip:</strong> Router setup protects all devices at once - phones, tablets, computers, and smart TVs!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 text-xs sm:text-sm">
            I'll Do This Later
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              if (connectionStatus !== "connected") {
                toast({
                  title: "Great!",
                  description: `We'll check if ${profileName}'s device is protected`,
                });
              }
            }}
            className="flex-1 text-xs sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Done! Device is Protected</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DNSSetupDialog;
