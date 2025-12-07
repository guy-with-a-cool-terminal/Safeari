import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { login } from "@/lib/api";
import { verifyCallback } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import SafeariFullLogo from "@/assets/logofull.svg";

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

    setIsLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
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
        title: "Login failed",
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
              description: "You've been successfully signed in with Google.",
            });

            // Load user data immediately after OAuth login
            await Promise.all([
              refreshProfiles(),      // Load profiles and restore last viewed
              refetchSubscription()   // Load subscription data
            ]);

            navigate("/dashboard");
          } else {
            toast({
              title: "Welcome to Safeari!",
              description: "Let's set up your subscription.",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="text-center space-y-6">
          <img src={SafeariFullLogo} alt="Safeari" className="h-16 sm:h-20 w-auto mx-auto" />
          <div className="space-y-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Completing sign-in...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="hover:bg-background/60">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Full Logo */}
          <div className="flex justify-center">
            <Link to="/" className="block transition-transform hover:scale-105 duration-300">
              <img
                src={SafeariFullLogo}
                alt="Safeari"
                className="h-16 sm:h-20 md:h-24 w-auto"
              />
            </Link>
          </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="#" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;