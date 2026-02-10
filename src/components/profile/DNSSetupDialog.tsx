import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCircle2, AlertCircle, Loader2, Shield, Smartphone, Monitor, Network, HelpCircle, Phone, Mail, ExternalLink, QrCode as QrIcon, Send, Share2 } from "lucide-react";
import SafeariLogo from "@/assets/favicon.svg";
import QRCode from "react-qr-code";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
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
  const [showShare, setShowShare] = useState(false);
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
            title: "Open Settings",
            description: "Go to Settings → Network & internet → Private DNS"
          },
          {
            title: "Enter Protection Address",
            description: "Select 'Private DNS provider hostname' and paste this:",
            copyText: dotHostname,
            copyLabel: "Protection address"
          },
          {
            title: "Save",
            description: "Tap Save. That's it! You're protected."
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
      <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-4">
        {/* Sticky Header Actions */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2 -mt-2 pt-2 flex justify-between gap-2 border-b mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs h-9 px-2"
          >
            <HelpCircle className="h-4 w-4 mr-1.5" />
            Help
          </Button>

          {showShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShare(false)}
              className="text-xs h-9 px-2 ml-auto"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Help Section */}
        {showHelp && (
          <Card className="bg-primary/5 border-primary/20 mb-4 animate-in slide-in-from-top-2">
            <CardContent className="p-3 sm:p-4 space-y-3">
              <p className="font-medium text-sm">Get Help Setting Up Protection</p>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                <Button asChild variant="outline" size="sm" className="justify-start h-10 bg-white dark:bg-black/20">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    <SiWhatsapp className="h-4 w-4 mr-2 text-[#25D366] flex-shrink-0" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start h-10 bg-white dark:bg-black/20">
                  <a href="tel:0114399034">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    Call Us
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start h-10 bg-white dark:bg-black/20">
                  <a href="mailto:support@safeari.co.ke">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share / Send to Child View */}
        {showShare && dnsDetails ? (
          <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl">Send Setup to {profileName}</DialogTitle>
              <DialogDescription>
                Open this link on {profileName}'s device to start the setup.
              </DialogDescription>
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* QR Code */}
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <QRCode
                  value={`https://safeari.co.ke/setup?dns=${dnsDetails.id}&name=${encodeURIComponent(profileName)}`}
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>

              <div className="w-full max-w-xs space-y-3">
                <p className="text-xs text-center text-muted-foreground uppercase tracking-widest font-medium">OR</p>

                <Button asChild className="w-full h-11" size="lg">
                  <a href={`sms:?body=${encodeURIComponent(`Hi! Setup protection on your phone here: https://safeari.co.ke/setup?dns=${dnsDetails.id}&name=${encodeURIComponent(profileName)}`)}`}>
                    Send via SMS
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    const url = `https://safeari.co.ke/setup?dns=${dnsDetails.id}&name=${encodeURIComponent(profileName)}`;
                    navigator.clipboard.writeText(url);
                    toast({ title: "Copied!", description: "Link copied to clipboard" });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Setup View */
          <>
            <DialogHeader className="space-y-2 text-left">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-card rounded-xl flex items-center justify-center p-2 border shadow-sm flex-shrink-0">
                    <img src={SafeariLogo} alt="Safeari" className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg sm:text-xl truncate leading-tight">Protect {profileName}</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">3 simple steps to block harmful content</DialogDescription>
                  </div>
                </div>

                {/* Re-positioned Share Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShare(true)}
                  className="text-primary border-primary/20 hover:bg-primary/5 text-xs h-9 px-3 flex-shrink-0 hidden sm:flex"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Send to Child
                </Button>

                {/* Mobile Icon Only */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowShare(true)}
                  className="text-primary border-primary/20 hover:bg-primary/5 h-9 w-9 flex-shrink-0 sm:hidden"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Connection Status - Compact */}
            <Card className={
              connectionStatus === "connected" ? "bg-green-500/5 border-green-500/20" :
                connectionStatus === "not-setup" ? "bg-amber-500/5 border-amber-500/20" :
                  "bg-muted/30"
            }>
              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                {connectionStatus === "connected" && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                {connectionStatus === "not-setup" && <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />}
                {connectionStatus === "idle" && <Shield className="h-5 w-5 text-primary flex-shrink-0" />}
                {connectionStatus === "testing" && <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {connectionStatus === "connected" ? "Protected" : connectionStatus === "not-setup" ? "Not Protected" : "Status"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {connectionStatus === "connected" ? "Blocking harmful content" : "Setup required"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => testConnection(false)}
                  disabled={connectionStatus === "testing"}
                  className="h-8 px-2 text-xs"
                >
                  {connectionStatus === "testing" ? "Checking..." : "Check Status"}
                </Button>
              </CardContent>
            </Card>

            {/* Platform Tabs */}
            <Tabs defaultValue="android" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full h-auto p-1 bg-muted/50 grid grid-cols-4 sm:grid-cols-6 mb-4">
                {Object.entries(platformInstructions).map(([key, platform]) => {
                  const IconComponent = platform.icon;
                  return (
                    <TabsTrigger key={key} value={key} className="py-2 px-1 text-[10px] sm:text-xs flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <IconComponent className="h-4 w-4" />
                      <span className="truncate max-w-full">{platform.name.split('/')[0]}</span>
                    </TabsTrigger>
                  );
                })}
                <TabsTrigger value="router" className="py-2 px-1 text-[10px] sm:text-xs flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <Network className="h-4 w-4" />
                  <span>Router</span>
                </TabsTrigger>
              </TabsList>

              {/* Platform Instructions */}
              {activeTab !== "router" && currentPlatform && (
                <TabsContent value={activeTab} className="space-y-3 mt-0">
                  <div className="space-y-3">
                    {currentPlatform.steps.map((step, index) => (
                      <InstructionStep key={index} number={index + 1} {...step} />
                    ))}
                  </div>
                </TabsContent>
              )}

              {/* Router Tab - Simplified */}
              <TabsContent value="router" className="mt-0">
                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Network className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-amber-900 dark:text-amber-100">Router Setup (Beta)</p>
                        <p className="text-muted-foreground text-xs">Protects all devices on your Wi-Fi, including Smart TVs and consoles.</p>
                        <Button variant="outline" size="sm" asChild className="w-full h-9 mt-2 text-xs bg-white dark:bg-black/20">
                          <a href={WHATSAPP_LINK} target="_blank">Contact Support for Help</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-2 mt-auto">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-11 text-muted-foreground">
                Later
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  if (connectionStatus !== "connected") {
                    toast({
                      title: "Great!",
                      description: `We'll check protection status for ${profileName} in the background`,
                    });
                  }
                }}
                className="flex-1 h-11 font-medium"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I've Finished Setup
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog >
  );
};

export default DNSSetupDialog;
