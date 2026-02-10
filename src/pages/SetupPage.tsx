import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Copy, CheckCircle2, Shield, Smartphone, Monitor, ChevronDown, ChevronUp, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SafeariLogo from "@/assets/favicon.svg";
import { useToast } from "@/hooks/use-toast";

interface InstructionStep {
    title: string;
    description: string;
    copyText?: string;
    copyLabel?: string;
    linkUrl?: string;
    linkText?: string;
}

const SetupPage = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("android");
    const [showManualAndroid, setShowManualAndroid] = useState(false);
    const [isAndroidAndDeepLinkSupported, setIsAndroidAndDeepLinkSupported] = useState(false);
    const { toast } = useToast();

    const dnsId = searchParams.get("dns");
    const profileName = searchParams.get("name") || "Device";

    // Handle the setup flow: Copy -> Toast -> Open Settings
    const handleStartSetup = () => {
        // 1. Copy the hostname to clipboard
        if (dnsId) {
            navigator.clipboard.writeText(`${dnsId}.dns.nextdns.io`);
            toast({
                title: "Address Copied!",
                description: "Paste this in the Private DNS settings",
            });
        }

        // 2. Wait a moment then open settings
        setTimeout(() => {
            window.location.href = "intent:#Intent;action=android.settings.PRIVATE_DNS_SETTINGS;end";
        }, 500);

        // 3. Show manual backup after a delay
        setTimeout(() => {
            setShowManualAndroid(true);
        }, 3000);
    };

    // Only check OS, do NOT auto-trigger
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        const isAndroid = ua.includes("android");
        setIsAndroidAndDeepLinkSupported(isAndroid);

        if (isAndroid) {
            setActiveTab("android");
        } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
            setActiveTab("ios");
        } else if (ua.includes("mac")) {
            setActiveTab("mac");
        } else if (ua.includes("windows")) {
            setActiveTab("windows");
        } else {
            setActiveTab("android");
        }
    }, []);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} copied to clipboard`,
        });
    };

    const InstructionStep = ({ number, title, description, copyText, copyLabel, linkUrl, linkText }: InstructionStep & { number: number }) => (
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border animate-in fade-in slide-in-from-top-1">
            <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {number}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-muted-foreground text-sm">{description}</p>

                {linkUrl && (
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto h-11 sm:h-9">
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
                        <Button size="sm" variant="outline" onClick={() => handleCopy(copyText, copyLabel || "Text")} className="flex-shrink-0 h-10 w-10 p-0">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    if (!dnsId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md text-center p-6">
                    <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-amber-600" />
                    </div>
                    <h1 className="text-xl font-bold mb-2">Invalid Setup Link</h1>
                    <p className="text-muted-foreground">Please check the link and try again.</p>
                </Card>
            </div>
        );
    }

    const dotHostname = `${dnsId}.dns.nextdns.io`;
    const configProfileUrl = `https://apple.nextdns.io/?profile=${dnsId}`;

    return (
        <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="w-full max-w-lg space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <img src={SafeariLogo} alt="Safeari" className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Protect {profileName}</h1>
                    <p className="text-muted-foreground text-sm">
                        {activeTab === 'android' && !showManualAndroid
                            ? "Opening settings..."
                            : "Follow steps to enable protection blocks"}
                    </p>
                </div>

                {/* Protection Status Card - Simplified for Mobile */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium text-sm text-primary">Setup Protection</p>
                            <p className="text-xs text-muted-foreground">Blocks harmful content 24/7</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} value={activeTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="android"><Smartphone className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="ios"><Smartphone className="h-4 w-4" /><sup className="ml-0.5" style={{ fontSize: '0.6rem' }}>iOS</sup></TabsTrigger>
                        <TabsTrigger value="windows"><Monitor className="h-4 w-4" /></TabsTrigger>
                        <TabsTrigger value="mac"><Monitor className="h-4 w-4" /></TabsTrigger>
                    </TabsList>

                    <TabsContent value="android" className="space-y-4 mt-4">
                        {isAndroidAndDeepLinkSupported && (
                            <div className="space-y-6">
                                {!showManualAndroid && (
                                    <div className="flex flex-col items-center py-6 space-y-6 animate-in fade-in zoom-in-95">
                                        <div className="text-center space-y-2 max-w-xs mx-auto">
                                            <p className="text-sm font-medium">Ready to protect?</p>
                                            <p className="text-xs text-muted-foreground">Tap below to copy the address and open settings automatically.</p>
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full h-14 text-lg font-semibold shadow-lg animate-pulse hover:animate-none"
                                            onClick={handleStartSetup}
                                        >
                                            Start Setup
                                        </Button>
                                    </div>
                                )}

                                {showManualAndroid && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                                        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg text-center space-y-3 border border-amber-100 dark:border-amber-900">
                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Did settings not open?</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-amber-200 text-amber-900 hover:bg-amber-100"
                                                onClick={() => window.location.href = "intent:#Intent;action=android.settings.PRIVATE_DNS_SETTINGS;end"}
                                            >
                                                Try Opening Settings Again
                                            </Button>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background px-2 text-muted-foreground">Or Setup Manually</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(!isAndroidAndDeepLinkSupported || showManualAndroid) && (
                            <div className="space-y-3">
                                <InstructionStep
                                    number={1}
                                    title="Open Settings"
                                    description="Go to Settings → Network & internet → Private DNS"
                                />
                                <InstructionStep
                                    number={2}
                                    title="Enter Address"
                                    description="Select 'Private DNS provider hostname' and paste this:"
                                    copyText={dotHostname}
                                    copyLabel="Protection Address"
                                />
                                <InstructionStep
                                    number={3}
                                    title="Save"
                                    description="Tap Save. You're protected!"
                                />
                            </div>
                        )}

                        {/* Test Connection Button */}
                        <div className="pt-4 border-t mt-4">
                            <Button variant="ghost" className="w-full text-xs text-muted-foreground" asChild>
                                <a href="https://test.nextdns.io" target="_blank" rel="noopener noreferrer">
                                    Verify Protection Status
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                </a>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="ios" className="space-y-3 mt-4">
                        <InstructionStep
                            number={1}
                            title="Download Profile"
                            description="Tap below to get the protection profile."
                            linkUrl={configProfileUrl}
                            linkText="Download Profile"
                        />
                        <InstructionStep
                            number={2}
                            title="Install"
                            description="Go to Settings → Profile Downloaded → Install."
                        />
                        <InstructionStep
                            number={3}
                            title="Done!"
                            description="Your device is now filtering harmful content."
                        />
                    </TabsContent>

                    <TabsContent value="windows" className="space-y-3 mt-4">
                        <InstructionStep
                            number={1}
                            title="Download App"
                            description="Get the protection app for Windows."
                            linkUrl="https://nextdns.io/download/windows/stable"
                            linkText="Download"
                        />
                        <InstructionStep
                            number={2}
                            title="Enter ID"
                            description="Right-click tray icon → Settings → Enter ID:"
                            copyText={dnsId}
                            copyLabel="Setup ID"
                        />
                        <InstructionStep
                            number={3}
                            title="Enable"
                            description="Right-click tray icon → Enable."
                        />
                    </TabsContent>

                    <TabsContent value="mac" className="space-y-3 mt-4">
                        <InstructionStep
                            number={1}
                            title="Run Command"
                            description="Open Terminal and paste:"
                            copyText='sh -c "$(curl -sL https://nextdns.io/install)"'
                            copyLabel="Command"
                        />
                        <InstructionStep
                            number={2}
                            title="Follow Steps"
                            description="The installer will guide you."
                        />
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
};

export default SetupPage;
