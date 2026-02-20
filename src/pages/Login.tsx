import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api";
import { verifyCallback } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import SafeariFullLogo from "@/assets/favicon.svg";
import { Turnstile } from '@marsidev/react-turnstile';

/**
 * INTEGRATION NOTES
 * - Uses login() from API layer for authentication
 * - Tokens automatically stored in localStorage by API client
 * - Redirects to /dashboard on success
 * - Displays error toasts on failure
 */
const Login = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { refreshProfiles } = useProfile();
    const { refetch: refetchSubscription } = useSubscription();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthCallback, setIsOAuthCallback] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    // Detect OAuth callback immediately
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get('access_token')) {
            setIsOAuthCallback(true);
        }
    }, []);

    const validateEmail = (email: string) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const validateForm = () => {
        const newErrors = { email: "", password: "" };
        let isValid = true;

        if (!formData.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!turnstileToken) {
            toast({
                variant: "destructive",
                title: "Verification required",
                description: "Please complete the security check.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await login({
                email: formData.email,
                password: formData.password,
                turnstile_token: turnstileToken,
            });

            toast({
                title: "Welcome back!",
                description: "Successfully signed in to your account.",
            });

            // Load user data immediately after login
            await Promise.all([
                refreshProfiles(),      // Load profiles and restore last viewed
                refetchSubscription()   // Load subscription data
            ]);

            // Check if user came from subscription page
            const redirectTo = localStorage.getItem('redirect_after_login') || '/dashboard';
            localStorage.removeItem('redirect_after_login');

            navigate(redirectTo);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Sign in failed",
                description: error.response?.data?.message || "Invalid email or password. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/login`
                }
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Google Sign-In failed",
                description: error.message || "Failed to initiate Google Sign-In. Please try again.",
            });
            setIsLoading(false);
        }
    };

    // Handle OAuth callback - use subscription flag from backend
    useEffect(() => {
        const handleOAuthCallback = async () => {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const access_token = hashParams.get('access_token');
            const refresh_token = hashParams.get('refresh_token');

            if (access_token && refresh_token) {
                setIsLoading(true);
                try {
                    // Send Supabase OAuth tokens to backend, get back our JWT tokens
                    const authResponse = await verifyCallback({ access_token, refresh_token });

                    // Clear any Supabase session data from localStorage (security cleanup)
                    const supabaseKeys = Object.keys(localStorage).filter(key => key.startsWith('sb-'));
                    supabaseKeys.forEach(key => localStorage.removeItem(key));

                    // Backend tells us if user has subscription
                    if (authResponse.has_subscription) {
                        toast({
                            title: "Welcome back!",
                            description: "We're glad to have you back.",
                        });

                        // Load user data immediately after OAuth login
                        await Promise.all([
                            refreshProfiles(),      // Load profiles and restore last viewed
                            refetchSubscription()   // Load subscription data
                        ]);

                        navigate("/dashboard");
                    } else {
                        toast({
                            title: "Welcome!",
                            description: "Let's get your family protection set up.",
                        });
                        navigate("/onboarding/subscription");
                    }
                } catch (error: any) {
                    toast({
                        variant: "destructive",
                        title: "Authentication failed",
                        description: error.response?.data?.message || "Failed to complete Google Sign-In.",
                    });
                } finally {
                    setIsLoading(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        };

        handleOAuthCallback();
    }, [navigate, toast, refreshProfiles]);

    // Show loading screen during OAuth callback
    if (isOAuthCallback) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <img src={SafeariFullLogo} alt="Safeari" className="h-20 w-auto mx-auto animate-pulse" />
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse -z-10" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden mx-auto">
                            <div className="h-full bg-primary animate-loading-bar" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">Authenticating</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0, 50 0, 100 100" fill="none" stroke="currentColor" strokeWidth="0.1" />
                </svg>
            </div>

            {/* Top Bar - Minimal */}
            <div className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between z-10">
                <Link to="/" className="group flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                        <img src={SafeariFullLogo} alt="Safeari" className="h-6 w-auto" />
                    </div>
                    <span className="font-bold tracking-tight text-foreground hidden sm:inline-block">Safeari</span>
                </Link>
                <Link to="/">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                        <ArrowLeft className="mr-2 h-3 w-3" />
                        Back to Home
                    </Button>
                </Link>
            </div>

            {/* Main Content - Centered Card */}
            <div className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="w-full max-w-[400px] animate-fadeInUp">
                    <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                        <CardHeader className="space-y-1 pb-4 pt-6">
                            <CardTitle className="text-2xl font-bold text-center tracking-tight">Welcome Back</CardTitle>
                            <CardDescription className="text-center text-sm">
                                Manage your family's safety from one place
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 px-6 pb-8 pt-2">
                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`pl-10 h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all ${errors.email ? "border-destructive/50" : ""}`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-[10px] text-destructive font-medium mt-1 ml-1">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                                        <Link
                                            to="#"
                                            className="text-[11px] text-primary hover:text-primary/80 font-bold tracking-tight"
                                        >
                                            Forgot?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`pl-10 pr-10 h-11 bg-background/50 border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all ${errors.password ? "border-destructive/50" : ""}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[10px] text-destructive font-medium mt-1 ml-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Turnstile Challenge - Compact */}
                                <div className="flex justify-center pt-2 scale-90">
                                    <Turnstile
                                        siteKey="0x4AAAAAACYKWghgyX9hvUFu"
                                        onSuccess={(token) => setTurnstileToken(token)}
                                        onError={() => {
                                            toast({
                                                variant: "destructive",
                                                title: "Verification failed",
                                                description: "Please refresh the page and try again.",
                                            });
                                        }}
                                        options={{ theme: 'auto' }}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-bold shadow-lg shadow-primary/20 mt-2 transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="relative py-1">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/40" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                    <span className="bg-card px-3 text-muted-foreground/60">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 font-semibold border-border/40 hover:bg-accent/50 transition-all active:scale-[0.98]"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google Account
                            </Button>

                            <div className="text-center pt-2">
                                <p className="text-xs text-muted-foreground font-medium">
                                    New to Safeari?{" "}
                                    <Link to="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Minimal Bottom Info */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                            <a href="mailto:support@safeari.co.ke" className="hover:text-primary transition-colors">Support</a>
                        </div>
                        <p className="text-[10px] text-muted-foreground/30 font-medium">
                            &copy; {new Date().getFullYear()} Safeari. Protected by industry encryption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
