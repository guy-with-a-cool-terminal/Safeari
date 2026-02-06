import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ReferenceDataProvider } from "@/contexts/ReferenceDataContext";
import { queryClient } from "@/lib/queryClient";
import Landing from "./components/landing/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Terms from "./pages/Terms";
import Privacy from "./pages/PrivacyPolicies";
import SubscriptionSelection from "./pages/SubscriptionSelection";
import Dashboard from "./pages/Dashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ParentalControls from "./pages/ParentalControls";
import SecuritySettings from "./pages/SecuritySettings";
import PrivacySettings from "./pages/PrivacySettings";
import CustomLists from "./pages/CustomLists";
import Settings from "./pages/ProfileSettings";
import Profiles from "./pages/Profiles";
import AccountSubscription from "./pages/AccountSubscription";
import UsageBilling from "./pages/UsageBilling";
import NotFound from "./pages/NotFound";
import PaymentCallback from "./pages/PaymentCallback";
import { RateLimitProvider } from "./contexts/RateLimitContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <ReferenceDataProvider>
                <RateLimitProvider>
                  <ProfileProvider>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route
                        path="/onboarding/subscription"
                        element={
                          <ProtectedRoute>
                            <SubscriptionSelection />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/payment/callback"
                        element={
                          <ProtectedRoute>
                            <PaymentCallback />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profiles"
                        element={
                          <ProtectedRoute>
                            <Profiles />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account/subscription"
                        element={
                          <ProtectedRoute>
                            <AccountSubscription />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<ParentalControls />} />
                        <Route path="analytics" element={<AnalyticsDashboard />} />
                        <Route path="parental" element={<ParentalControls />} />
                        <Route path="security" element={<SecuritySettings />} />
                        <Route path="privacy" element={<PrivacySettings />} />
                        <Route path="lists" element={<CustomLists />} />
                        <Route path="usage-billing" element={<UsageBilling />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProfileProvider>
                </RateLimitProvider>
              </ReferenceDataProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;