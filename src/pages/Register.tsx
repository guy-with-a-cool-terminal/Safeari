import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { register } from "@/lib/api";
import { verifyCallback } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import SafeariFullLogo from "@/assets/logofull.svg";

/**
 * INTEGRATION NOTES
 * - Uses register() from API layer
 * - Only sends email and password (not confirmPassword)
 * - User auto-logged in after registration
 * - Redirects to /onboarding/subscription
 * - Displays error toasts on failure
 */
const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfiles } = useProfile();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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
    const newErrors = { email: "", password: "", confirmPassword: "" };
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await register({
        email: formData.email,
        password: formData.password,
      });

      // Show email verification screen
      setRegisteredEmail(formData.email);
      setShowVerificationMessage(true);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.response?.data?.message || "Unable to create account. Please try again.",
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
          redirectTo: `${window.location.origin}/register`
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

  // Handle OAuth callback - check subscription flag from backend
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

            await refreshProfiles();
            navigate("/dashboard");
          } else {
            toast({
              title: "Welcome!",
              description: "Account created successfully with Google.",
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

  // Show email verification message after registration
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            {/* Full Logo */}
            <div className="flex justify-center">
              <img src={SafeariFullLogo} alt="Safeari" className="h-16 sm:h-20 w-auto" />
            </div>

            <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
              <CardContent className="pt-12 pb-8 px-6">
                <div className="text-center space-y-6">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Mail className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold">Check your email</h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      We've sent a verification link to
                    </p>
                    <p className="text-foreground font-semibold text-sm sm:text-base break-all">
                      {registeredEmail}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-left">
                    <p className="text-sm font-semibold text-foreground">What's next?</p>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Check your inbox (and spam folder)</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Click the verification link in the email</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>You'll be redirected to complete your setup</span>
                      </li>
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <p className="text-xs text-muted-foreground">
                      Didn't receive the email? Check your spam folder or try registering again.
                    </p>
                    <Link to="/login" className="block">
                      <Button variant="outline" size="lg" className="w-full">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@safeari.co.ke" className="underline hover:text-foreground">
                support@safeari.co.ke
              </a>
            </p>
          </div>
        </div>
        <Footer />
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

        {/* Registration Card */}
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details below to get started
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
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
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;