import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Copy, CheckCircle2, Shield, Smartphone, Monitor, ExternalLink, Loader2, AlertCircle } from "lucide-react";
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
    const [verificationStatus, setVerificationStatus] = useState<"idle" | "checking" | "verified" | "failed">("idle");
    const [setupStarted, setSetupStarted] = useState(false);
    const { toast } = useToast();

    const dnsId = searchParams.get("dns");
    const profileName = searchParams.get("name") || "Device";

    // Auto-detect device type
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("android")) {
            setActiveTab("android");
        } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
            setActiveTab("ios");
        } else if (ua.includes("mac")) {
            setActiveTab("mac");
        } else if (ua.includes("windows")) {
            setActiveTab("windows");
        }
    }, []);

    // Auto-verify protection status when setup is started
    useEffect(() => {
        if (!setupStarted) return;

        let attempts = 0;
        const maxAttempts = 12; // 60 seconds total (12 * 5 seconds)

        const checkProtection = async () => {
            try {
                const response = await fetch('https://test.nextdns.io', { mode: 'cors' });
                const text = await response.text();

                // Check if NextDNS is active and it's our profile
                if (text.includes(dnsId || '')) {
                    setVerificationStatus("verified");
                    toast({
                        title: "🎉 Protection Active!",
                        description: `${profileName} is now protected from harmful content`,
                    });
                    return true;
                }
            } catch (error) {
                console.log("Verification check:", error);
            }
            return false;
        };

        const verifyInterval = setInterval(async () => {
            attempts++;
            setVerificationStatus("checking");

            const isVerified = await checkProtection();

            if (isVerified || attempts >= maxAttempts) {
                clearInterval(verifyInterval);
                if (!isVerified) {
                    setVerificationStatus("failed");
                }
            }
        }, 5000);

        // Initial check
        checkProtection();

        return () => clearInterval(verifyInterval);
    }, [setupStarted, dnsId, profileName, toast]);

    const handleStartSetup = () => {
        // Copy DNS address
        if (dnsId) {
            navigator.clipboard.writeText(`${dnsId}.dns.nextdns.io`);
            toast({
                title: "Address Copied!",
                description: "Paste this in Private DNS settings",
                duration: 3000,
            });
        }

        // Mark setup as started for verification
        setSetupStarted(true);

        // Try to open settings (may or may not work depending on browser)
        setTimeout(() => {
            window.location.href = "intent:#Intent;action=android.settings.PRIVATE_DNS_SETTINGS;end";
        }, 500);
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} copied to clipboard`,
        });
    };

    const InstructionStep = ({ number, title, description, copyText, copyLabel, linkUrl, linkText }: InstructionStep & { number: number }) => (
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
            <div className="h-7 w-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {number}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-muted-foreground text-sm">{description}</p>

                {linkUrl && (
                    <Button asChild variant="outline" size="sm" className="w-full h-11">
                        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                            {linkText || "Open Setup"}
                            <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
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
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(copyText, copyLabel || "Text")}
                            className="flex-shrink-0 h-10 w-10 p-0"
                        >
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
                    <div className="mx-auto h-12 w-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <h1 className="text-xl font-bold mb-2">Invalid Setup Link</h1>
                    <p className="text-muted-foreground text-sm">Please check the link and try again.</p>
                </Card>
            </div>
        );
    }

    const dotHostname = `${dnsId}.dns.nextdns.io`;
    const configProfileUrl = `https://apple.nextdns.io/?profile=${dnsId}`;
    const isAndroid = /android/i.test(navigator.userAgent);

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="w-full max-w-lg space-y-6">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <img src={SafeariLogo} alt="Safeari" className="w-9 h-9" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Protect {profileName}</h1>
                    <p className="text-muted-foreground text-sm">
                        Block harmful content in 3 simple steps
                    </p>
                </div>

                {/* Verification Status Card */}
                {verificationStatus !== "idle" && (
                    <Card className={
                        verificationStatus === "verified"
                            ? "bg-green-500/10 border-green-500/20 animate-in fade-in slide-in-from-top-2"
                            : verificationStatus === "checking"
                                ? "bg-blue-500/10 border-blue-500/20"
                                : "bg-amber-500/10 border-amber-500/20"
                    }>
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            {verificationStatus === "verified" && <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />}
                            {verificationStatus === "checking" && <Loader2 className="h-6 w-6 animate-spin text-blue-600 flex-shrink-0" />}
                            {verificationStatus === "failed" && <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />}

                            <div className="flex-1">
                                <p className="font-semibold text-sm">
                                    {verificationStatus === "verified" && "Protection Active!"}
                                    {verificationStatus === "checking" && "Checking Protection..."}
                                    {verificationStatus === "failed" && "Not Protected Yet"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {verificationStatus === "verified" && "Harmful content is being blocked"}
                                    {verificationStatus === "checking" && "Complete setup steps below"}
                                    {verificationStatus === "failed" && "Make sure you completed all steps"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Android Quick Setup (only show on Android devices) */}
                {isAndroid && !setupStarted && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6 pb-6 space-y-4">
                            <div className="text-center space-y-2">
                                <Shield className="h-10 w-10 text-primary mx-auto" />
                                <p className="font-medium">Quick Android Setup</p>
                                <p className="text-xs text-muted-foreground">
                                    We'll copy the address and try to open your settings
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="w-full h-12 text-base font-semibold"
                                onClick={handleStartSetup}
                            >
                                Start Setup
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Platform Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full h-auto p-1 bg-muted/50 grid grid-cols-4">
                        <TabsTrigger value="android" className="py-2.5 text-xs data-[state=active]:bg-background" aria-label="Android">
                            <Smartphone className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Android</span>
                        </TabsTrigger>
                        <TabsTrigger value="ios" className="py-2.5 text-xs data-[state=active]:bg-background" aria-label="iPhone/iPad">
                            <Smartphone className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">iOS</span>
                        </TabsTrigger>
                        <TabsTrigger value="windows" className="py-2.5 text-xs data-[state=active]:bg-background" aria-label="Windows">
                            <Monitor className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Windows</span>
                        </TabsTrigger>
                        <TabsTrigger value="mac" className="py-2.5 text-xs data-[state=active]:bg-background" aria-label="Mac">
                            <Monitor className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Mac</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="android" className="space-y-3 mt-6">
                        <InstructionStep
                            number={1}
                            title="Open Settings"
                            description="Go to Settings → Network & internet → Private DNS"
                        />
                        <InstructionStep
                            number={2}
                            title="Enter Address"
                            description="Select 'Private DNS provider hostname' and paste:"
                            copyText={dotHostname}
                            copyLabel="Protection Address"
                        />
                        <InstructionStep
                            number={3}
                            title="Save & Done!"
                            description="Tap Save. Protection will activate automatically."
                        />
                    </TabsContent>

                    <TabsContent value="ios" className="space-y-3 mt-6">
                        <InstructionStep
                            number={1}
                            title="Download Profile"
                            description="Tap below to download the protection profile"
                            linkUrl={configProfileUrl}
                            linkText="Download Profile"
                        />
                        <InstructionStep
                            number={2}
                            title="Install Profile"
                            description="Go to Settings → Profile Downloaded → Install"
                        />
                        <InstructionStep
                            number={3}
                            title="Done!"
                            description="Protection is now active on your device"
                        />
                    </TabsContent>

                    <TabsContent value="windows" className="space-y-3 mt-6">
                        <InstructionStep
                            number={1}
                            title="Download App"
                            description="Download the protection app for Windows"
                            linkUrl="https://nextdns.io/download/windows/stable"
                            linkText="Download for Windows"
                        />
                        <InstructionStep
                            number={2}
                            title="Enter Configuration ID"
                            description="Right-click tray icon → Settings → Enter ID:"
                            copyText={dnsId}
                            copyLabel="Configuration ID"
                        />
                        <InstructionStep
                            number={3}
                            title="Enable Protection"
                            description="Right-click tray icon → Enable"
                        />
                    </TabsContent>

                    <TabsContent value="mac" className="space-y-3 mt-6">
                        <InstructionStep
                            number={1}
                            title="Run Setup Command"
                            description="Open Terminal and paste this command:"
                            copyText='sh -c "$(curl -sL https://nextdns.io/install)"'
                            copyLabel="Setup Command"
                        />
                        <InstructionStep
                            number={2}
                            title="Follow Installer"
                            description="The installer will guide you through the setup"
                        />
                        <InstructionStep
                            number={3}
                            title="Done!"
                            description="Your Mac is now protected"
                        />
                    </TabsContent>
                </Tabs>

                {/* Footer Help */}
                <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4 text-center">
                        <p className="text-xs text-muted-foreground mb-2">Need help?</p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" asChild>
                                <a href="tel:0114399034">Call Support</a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href="mailto:support@safeari.co.ke">Email Us</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default SetupPage;