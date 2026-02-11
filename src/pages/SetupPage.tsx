import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Copy,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Shield,
    Smartphone,
    Monitor,
    Network,
    HelpCircle,
    Phone,
    Mail,
    ExternalLink,
    Info,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getDeviceStats } from "@/lib/api";
import { WHATSAPP_LINK } from "@/components/feedback/WhatsAppCTA";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { useProfileData, useDNSDetails } from "@/hooks/queries";
import { useProfile } from "@/contexts/ProfileContext";
import SeamlessSection from "@/components/ui/SeamlessSection";
// Reusing InstructionStepRow for consistent styling

interface InstructionStep {
    title: string;
    description: string;
    copyText?: string;
    copyLabel?: string;
    linkUrl?: string;
    linkText?: string;
    isBrandPath?: boolean;
}

interface PlatformConfig {
    name: string;
    icon: any;
    steps: InstructionStep[];
    hasBrands?: boolean;
}

const InstructionStepRow = ({ number, title, description, copyText, copyLabel, linkUrl, linkText }: InstructionStep & { number: number }) => {
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
        <div className="flex items-start gap-4 py-6 border-b border-border/10 last:border-0 group">
            <div className="h-7 w-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors group-hover:bg-primary/20">
                {number}
            </div>
            <div className="flex-1 space-y-3 min-w-0">
                <div className="space-y-1">
                    <p className="font-bold text-base leading-tight">{title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>

                {linkUrl && (
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-full font-bold border-border/40 hover:bg-accent transition-all">
                        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                            {linkText || "Open Setup"}
                            <ExternalLink className="h-3.5 w-3.5 ml-2" />
                        </a>
                    </Button>
                )}

                {copyText && (
                    <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                        <code className="flex-1 px-3 py-2 bg-accent/30 rounded-lg font-mono text-sm border border-border/20 break-all">
                            {copyText}
                        </code>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCopy}
                            className="h-10 px-4 rounded-lg font-bold border-none transition-all hover:bg-primary hover:text-white"
                        >
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Copy
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SetupPage = () => {
    const { profileId } = useParams<{ profileId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { currentProfile } = useProfile();

    // React Query Hooks
    // Priority: Params if provided, otherwise context
    const pid = profileId ? parseInt(profileId) : currentProfile?.id;
    const { data: profile, isLoading: profileLoading } = useProfileData(pid);
    const { data: dnsDetails, isLoading: dnsLoading } = useDNSDetails(pid);

    const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "connected" | "not-setup">("idle");
    const [activePlatform, setActivePlatform] = useState("android");
    const [hasSelectedPlatform, setHasSelectedPlatform] = useState(false);
    const [activeBrand, setActiveBrand] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    const isLoading = profileLoading || dnsLoading;

    // Sync URL with context if they differ
    useEffect(() => {
        if (currentProfile && profileId && parseInt(profileId) !== currentProfile.id) {
            navigate(`/dashboard/setup/${currentProfile.id}`, { replace: true });
        }
    }, [currentProfile, profileId, navigate]);

    const testConnection = useCallback(async (isBackground = false) => {
        if (!pid) return;
        if (!isBackground) setConnectionStatus("testing");

        try {
            const devices = await getDeviceStats(pid, '1h');
            const hasActiveQueries = devices.some(device => device.queries > 0);

            if (hasActiveQueries) {
                setConnectionStatus("connected");
                if (!isBackground) {
                    toast({
                        title: "✓ Connected!",
                        description: `${profile?.display_name || "Device"} protection is active`,
                    });
                }
            } else {
                setConnectionStatus("not-setup");
                if (!isBackground) {
                    toast({
                        variant: "destructive",
                        title: "Not connected yet",
                        description: "Please ensure settings are saved on the child's device.",
                    });
                }
            }
        } catch (error) {
            setConnectionStatus("not-setup");
        }
    }, [pid, profile?.display_name, toast]);

    useEffect(() => {
        setConnectionStatus("idle");
        setHasSelectedPlatform(false);
        setShowHelp(false);
        setActiveBrand(null);
    }, [pid]);

    useEffect(() => {
        if (profile && dnsDetails && profile.id === pid) {
            testConnection(true);
        }
    }, [profile, dnsDetails, testConnection, pid]);

    // Auto-detect platform
    useEffect(() => {
        if (hasSelectedPlatform) return;
        const ua = navigator.userAgent.toLowerCase();
        let detected = "android";
        if (ua.includes("android")) detected = "android";
        else if (ua.includes("iphone") || ua.includes("ipad")) detected = "ios";
        else if (ua.includes("windows")) detected = "windows";
        else if (ua.includes("mac")) detected = "mac";

        if (detected !== activePlatform) {
            setActivePlatform(detected);
        }
    }, [hasSelectedPlatform, activePlatform]);

    const androidBrands: Record<string, string[]> = {
        samsung: [
            "Open Settings and tap 'Connections'",
            "Tap 'More connection settings' at the bottom",
            "Select 'Private DNS'",
            "Choose 'Private DNS provider hostname'"
        ],
        pixel: [
            "Open Settings and tap 'Network & internet'",
            "Tap 'Private DNS' (you may need to scroll down)",
            "Select 'Private DNS provider hostname'"
        ],
        xiaomi: [
            "Open Settings and tap 'Connection & sharing'",
            "Select 'Private DNS'",
            "Choose 'Private DNS provider hostname'"
        ],
        oneplus: [
            "Open Settings and tap 'Connection & Sharing'",
            "Select 'Private DNS'",
            "Choose 'Designated private DNS'"
        ],
        other: [
            "Open Settings on your child's phone",
            "Tap the search bar at the top and type 'Private DNS'",
            "Select 'Private DNS' from the results",
            "Choose 'Private DNS provider hostname'"
        ]
    };

    const dotHostname = dnsDetails?.id ? `${dnsDetails.id}.dns.nextdns.io` : "";
    const configProfileUrl = dnsDetails?.id ? `https://apple.nextdns.io/?profile=${dnsDetails.id}` : "";

    const platforms: Record<string, PlatformConfig> = useMemo(() => ({
        android: {
            name: "Android",
            icon: Smartphone,
            hasBrands: true,
            steps: activeBrand
                ? [
                    ...androidBrands[activeBrand as keyof typeof androidBrands].map((stepText) => ({
                        title: stepText,
                        description: "Follow this on your phone's screen."
                    })),
                    {
                        title: "Enter Protection Address",
                        description: "Type in your unique address into the input field:",
                        copyText: dotHostname,
                        copyLabel: "Protection Address"
                    },
                    {
                        title: "Save",
                        description: "Tap 'Save'. Protection is now active on all Wi-Fi and mobile networks."
                    }
                ]
                : [
                    {
                        title: "Open DNS Settings",
                        description: "Open Settings on your child's phone and search for 'Private DNS' in the top search bar.",
                    },
                    {
                        title: "Enter Protection Address",
                        description: "Select 'Private DNS provider hostname' and type in your unique address:",
                        copyText: dotHostname,
                        copyLabel: "Protection Address"
                    },
                    {
                        title: "Save",
                        description: "Tap 'Save'. Protection is now active on all Wi-Fi and mobile networks."
                    }
                ]
        },
        ios: {
            name: "iPhone",
            icon: Smartphone,
            steps: [
                {
                    title: "Install Protection Profile",
                    description: "Tap below to open Apple's secure setup page. This will download a small configuration file to your device.",
                    linkUrl: configProfileUrl,
                    linkText: "Download Profile"
                },
                {
                    title: "Enable in Settings",
                    description: "Once downloaded, open Settings → Profile Downloaded (near the top) → Tap 'Install' and follow the prompts."
                },
                {
                    title: "Finish Setup",
                    description: "You're all set! All apps and websites on this device are now guarded by Safeari."
                }
            ]
        },
        windows: {
            name: "Windows",
            icon: Monitor,
            steps: [
                {
                    title: "Download Desktop App",
                    description: "Download and install our setup utility for Windows PCs.",
                    linkUrl: "https://nextdns.io/download/windows/stable",
                    linkText: "Download for Windows"
                },
                {
                    title: "Enter Configuration ID",
                    description: "After installing, right-click the shield icon in your taskbar → Settings → Enter your unique ID:",
                    copyText: dnsDetails?.id || "",
                    copyLabel: "Configuration ID"
                },
                {
                    title: "Activate",
                    description: "Right-click the icon again and select 'Enable'. Your PC is now fully secured."
                }
            ]
        },
        mac: {
            name: "macOS",
            icon: Monitor,
            steps: [
                {
                    title: "Run Setup Command",
                    description: "Open the 'Terminal' app on your Mac and copy/paste this automated setup command:",
                    copyText: 'sh -c "$(curl -sL https://nextdns.io/install)"',
                    copyLabel: "Setup Command"
                },
                {
                    title: "Follow Prompts",
                    description: "The automated installer will guide you through a few simple choices. Just follow along."
                },
                {
                    title: "Secure",
                    description: "Your Mac is now fully protected against harmful content."
                }
            ]
        },
        linux: {
            name: "Linux",
            icon: Monitor,
            steps: [
                {
                    title: "Install Service",
                    description: "Open your terminal and run the following command to begin protection setup:",
                    copyText: 'sh -c "$(curl -sL https://nextdns.io/install)"',
                    copyLabel: "Setup Command"
                },
                {
                    title: "Complete Setup",
                    description: "Follow the guided process in your terminal to finish the installation."
                },
                {
                    title: "Guarded",
                    description: "Safeari protection is now active on your Linux system."
                }
            ]
        },
        router: {
            name: "Router",
            icon: Network,
            steps: [
                {
                    title: "Notice",
                    description: "Router setup is slightly more technical and varies by brand. We recommend getting help from our team."
                },
                {
                    title: "Get Expert Help",
                    description: "Message our support team on WhatsApp for step-by-step guidance for your specific router model.",
                    linkUrl: WHATSAPP_LINK,
                    linkText: "WhatsApp Support"
                },
            ]
        }
    }), [configProfileUrl, dotHostname, dnsDetails?.id, activeBrand]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">You're just one step away from providing your child with a safer internet experience...</p>
            </div>
        );
    }

    if (!profile || !dnsDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Setup Configuration Unavailable</h3>
                <p className="text-muted-foreground max-w-md mb-8">We couldn't retrieve the setup details for this profile. Please try refreshing the page.</p>
                <Button onClick={() => navigate("/dashboard")} className="h-12 px-8 rounded-full font-bold">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl lg:max-w-7xl mx-auto space-y-12 pb-24">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Set up {profile.display_name}'s Device</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                        Follow these simple steps on {profile.display_name}'s device to enable full parental filtering.
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowHelp(!showHelp)}
                        className="bg-primary/5 hover:bg-primary/10 border-none h-9 px-4 text-primary font-bold transition-all rounded-full self-start"
                    >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {showHelp ? "Hide Help" : "Need Help?"}
                    </Button>
                </div>
            </div>

            {/* Help Alert */}
            {showHelp && (
                <div className="bg-primary/5 border-y border-primary/10 animate-in slide-in-from-top-4 duration-300 -mx-4 sm:mx-0">
                    <div className="p-6 max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg tracking-tight">Need a hand with setup?</h3>
                                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                                    Our support team is ready to guide you through the process for any device.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button asChild variant="outline" className="h-9 px-4 rounded-full font-bold bg-background/50 hover:bg-background border-border/40 transition-all text-xs">
                                    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                                        <SiWhatsapp className="h-3.5 w-3.5 mr-2 text-[#25D366]" />
                                        WhatsApp
                                    </a>
                                </Button>
                                <Button asChild variant="outline" className="h-9 px-4 rounded-full font-bold bg-background/50 hover:bg-background border-border/40 transition-all text-xs">
                                    <a href="tel:0114399034">
                                        <Phone className="h-3.5 w-3.5 mr-2" />
                                        Call Support
                                    </a>
                                </Button>
                                <Button asChild variant="outline" className="h-9 px-4 rounded-full font-bold bg-background/50 hover:bg-background border-border/40 transition-all text-xs">
                                    <a href="mailto:support@safeari.co.ke">
                                        <Mail className="h-3.5 w-3.5 mr-2" />
                                        Email
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Status Section - Compact & Clean */}
            <div className={cn(
                "transition-all duration-500 border-y -mx-4 sm:mx-0",
                connectionStatus === "connected" ? "bg-green-500/5 border-green-500/10" :
                    connectionStatus === "not-setup" ? "bg-amber-500/5 border-amber-500/10" :
                        "bg-card/20 border-border/40"
            )}>
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors duration-500",
                        connectionStatus === "connected" ? "bg-green-500 text-white" :
                            connectionStatus === "not-setup" ? "bg-amber-500 text-white" :
                                "bg-primary/10 text-primary"
                    )}>
                        {connectionStatus === "connected" && <CheckCircle2 className="h-5 w-5" />}
                        {connectionStatus === "not-setup" && <AlertCircle className="h-5 w-5" />}
                        {(connectionStatus === "idle" || connectionStatus === "testing") &&
                            <Shield className={cn("h-5 w-5", connectionStatus === "testing" && "animate-pulse")} />
                        }
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-bold text-sm tracking-tight">
                                {connectionStatus === "connected" ? "Connection Active" :
                                    connectionStatus === "not-setup" ? "Awaiting Connection" :
                                        connectionStatus === "testing" ? "Verifying..." : "Connection Status"}
                            </h3>
                            {connectionStatus === "connected" && (
                                <Badge className="w-fit self-center sm:self-auto bg-green-500/20 hover:bg-green-500/20 text-green-600 border-none font-bold uppercase text-[9px] tracking-widest px-1.5 h-4">
                                    Protected
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground text-[13px] leading-relaxed max-w-2xl">
                            {connectionStatus === "connected" ? `${profile.display_name} is now protected.` :
                                connectionStatus === "not-setup" ? "Follow the steps below, then check status." :
                                    "Checking for connection signals..."}
                        </p>
                    </div>

                    <Button
                        onClick={() => testConnection(false)}
                        disabled={connectionStatus === "testing"}
                        variant={connectionStatus === "connected" ? "outline" : "default"}
                        className="w-full sm:w-auto min-w-[120px] h-9 rounded-full font-bold shadow-sm transition-all text-[11px] uppercase tracking-wider"
                    >
                        {connectionStatus === "testing" ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            connectionStatus === "connected" ? "Re-Verify" : "Check Status"
                        )}
                    </Button>
                </div>
            </div>

            {/* Setup Instructions Section */}
            <SeamlessSection
                title="Device Selection"
                description="Choose the device you want to protect to see specific instructions."
                bleeding={false}
            >
                <div className="p-1 sm:p-0">
                    <Tabs
                        value={activePlatform}
                        onValueChange={(val) => {
                            setActivePlatform(val);
                            setHasSelectedPlatform(true);
                        }}
                        className="w-full"
                    >
                        <TabsList className="w-full h-auto p-0 bg-transparent grid grid-cols-3 sm:grid-cols-6 mb-12 overflow-x-auto no-scrollbar gap-2">
                            {Object.entries(platforms).map(([key, platform]) => {
                                const Icon = platform.icon;
                                const isActive = activePlatform === key;
                                return (
                                    <TabsTrigger
                                        key={key}
                                        value={key}
                                        className={cn(
                                            "py-3 px-2 flex flex-col items-center gap-2 rounded-md transition-all h-full border border-transparent",
                                            "data-[state=active]:bg-accent/40 data-[state=active]:border-border/40 data-[state=active]:text-primary",
                                            "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                                        )}
                                    >
                                        <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{platform.name}</span>
                                            {key === "router" && (
                                                <span className="text-[8px] font-black text-primary px-1 rounded-sm bg-primary/10 leading-none py-0.5">BETA</span>
                                            )}
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {Object.entries(platforms).map(([key, platform]) => (
                            <TabsContent key={key} value={key} className="mt-0 space-y-8 animate-in fade-in duration-200">
                                {platform.hasBrands && (
                                    <div className="space-y-6 pb-4">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-sm font-bold tracking-tight">Step 1: Check your phone brand (Optional)</h4>
                                            <p className="text-xs text-muted-foreground">This helps us show you exactly which buttons to press.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant={activeBrand === null ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setActiveBrand(null)}
                                                className={cn(
                                                    "rounded-md px-4 h-8 text-xs font-bold transition-all",
                                                    activeBrand === null && "bg-primary/10 text-primary hover:bg-primary/20"
                                                )}
                                            >
                                                General Android
                                            </Button>
                                            {Object.keys(androidBrands).map((brand) => (
                                                brand !== "other" && (
                                                    <Button
                                                        key={brand}
                                                        variant={activeBrand === brand ? "secondary" : "ghost"}
                                                        size="sm"
                                                        onClick={() => setActiveBrand(brand)}
                                                        className={cn(
                                                            "capitalize rounded-md px-4 h-8 text-xs font-bold transition-all",
                                                            activeBrand === brand && "bg-primary/10 text-primary hover:bg-primary/20"
                                                        )}
                                                    >
                                                        {brand}
                                                    </Button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="max-w-4xl">
                                    {platform.steps.map((step, index) => (
                                        <InstructionStepRow
                                            key={index}
                                            number={index + 1}
                                            {...step}
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </SeamlessSection>

            {/* Bottom Actions - Aligned Right on Desktop */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-end pt-10 border-t border-border/40 gap-4">
                <Button
                    variant="ghost"
                    size="default"
                    className="w-full sm:w-auto h-10 px-6 rounded-full font-bold text-muted-foreground hover:text-foreground transition-all text-xs"
                    onClick={() => navigate("/dashboard")}
                >
                    Setup Later
                </Button>
                <Button
                    size="lg"
                    className="w-full sm:w-auto h-10 px-8 rounded-full font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-2 text-xs"
                    onClick={() => {
                        toast({
                            title: "✓ Configuration Complete",
                            description: `You can now monitor ${profile.display_name}'s safety from the dashboard.`,
                        });
                        navigate("/dashboard");
                    }}
                >
                    <Check className="h-5 w-5" />
                    I've Finished Setup
                </Button>
            </div>
        </div>
    );
};

export default SetupPage;