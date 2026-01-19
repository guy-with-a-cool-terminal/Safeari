import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, CheckCircle, Shield } from "lucide-react";
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
import SafeariFullLogo from "@/assets/favicon.svg";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-6">
          <img src={SafeariFullLogo} alt="Safeari" className="h-20 w-auto mx-auto" />
          <div className="space-y-3">
            <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-300">Setting up your account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show email verification message after registration
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-8">
            {/* Logo - slightly larger */}
            <div className="flex justify-center">
              <img src={SafeariFullLogo} alt="Safeari" className="h-24 w-auto" />
            </div>

            <Card className="border-slate-700 bg-slate-800/60 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-10 pb-8 px-6 sm:px-8">
                <div className="text-center space-y-6">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center ring-2 ring-cyan-500/20">
                      <Mail className="h-8 w-8 text-cyan-500" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white">Check your email</h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                      We've sent a verification link to
                    </p>
                    <p className="text-white font-medium text-sm sm:text-base break-all px-4">
                      {registeredEmail}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-slate-700/30 rounded-lg p-5 space-y-4 text-left">
                    <p className="text-sm font-medium text-white">Next steps:</p>
                    <ol className="space-y-3 text-sm text-slate-300">
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <span>Open the email we just sent you (check spam if needed)</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <span>Click the verification link</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <span>Complete your profile setup</span>
                      </li>
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-slate-400">
                      Didn't receive the email? Check your spam folder or contact support.
                    </p>
                    <Link to="/login" className="block">
                      <Button variant="outline" size="lg" className="w-full border-slate-600 hover:bg-slate-700/50">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-slate-400">
              Need help?{" "}
              <a href="mailto:support@safeari.co.ke" className="text-cyan-500 hover:text-cyan-400 underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Subtle ambient glow - simplified */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Back to Home Button - improved visibility */}
        <div className="container mx-auto px-4 py-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-100 hover:text-white hover:bg-slate-700/60">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 pb-8">
          <div className="w-full max-w-md space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={SafeariFullLogo} alt="Safeari" className="h-20 w-auto" />
            </div>

            {/* Registration Card - improved contrast and brightness */}
            <Card className="border-slate-600/50 bg-slate-800/80 backdrop-blur-sm shadow-2xl">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl text-center text-white">Start Protecting Your Family</CardTitle>
                <CardDescription className="text-center text-slate-300">
                  Create your account to keep your children safe online
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-100 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 bg-slate-900/60 border-slate-500 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-100 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-10 bg-slate-900/60 border-slate-500 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 ${errors.password ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-100 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-10 bg-slate-900/60 border-slate-500 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/20" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating your account..." : "Create Account"}
                  </Button>
                </form>

                {/* Trust indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-slate-700/30 rounded-lg py-3 px-4 border border-slate-600/30">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>Your data is encrypted and secure</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-3 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full border-slate-600 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-slate-400">Already have an account? </span>
                  <Link to="/login" className="text-cyan-500 hover:text-cyan-400 font-medium">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-cyan-500 hover:text-cyan-400 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-cyan-500 hover:text-cyan-400 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Register;