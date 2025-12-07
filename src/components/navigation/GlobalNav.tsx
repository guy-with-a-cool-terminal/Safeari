import { ChevronLeft, Home, CreditCard, BarChart3, Menu, MessageSquare } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/profiles": "Profiles",
  "/account/subscription": "Subscription",
  "/usage-billing": "Usage & Billing",
  "/settings": "Settings",
  "/dashboard/parental": "Parental Controls",
  "/dashboard/security": "Security",
  "/dashboard/privacy": "Privacy",
  "/dashboard/lists": "Custom Lists",
  "/dashboard/settings": "Settings",
};

export const GlobalNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments: BreadcrumbSegment[] = [];
    const pathParts = location.pathname.split("/").filter(Boolean);

    // Always start with home
    segments.push({ label: "Home", href: "/" });

    // Build breadcrumb trail
    let currentPath = "";
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = routeMap[currentPath] || part.charAt(0).toUpperCase() + part.slice(1);
      
      // Last item is current page (no link)
      if (index === pathParts.length - 1) {
        segments.push({ label });
      } else {
        segments.push({ label, href: currentPath });
      }
    });

    return segments;
  };

  const breadcrumbs = generateBreadcrumbs();
  const canGoBack = window.history.length > 1;

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Back Button - Always visible on mobile */}
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-2 md:mr-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-1">Back</span>
          </Button>
        )}

        {/* Breadcrumbs */}
        <Breadcrumb className="hidden md:flex flex-1">
          <BreadcrumbList>
            {breadcrumbs.map((segment, index) => (
              <div key={segment.href || segment.label} className="flex items-center">
                <BreadcrumbItem>
                  {segment.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={segment.href}>{segment.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile: Current Page Title */}
        <div className="flex-1 md:hidden">
          <p className="font-semibold truncate">{breadcrumbs[breadcrumbs.length - 1]?.label}</p>
        </div>

        {/* Desktop: Quick Access Links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {/* Only show these when NOT on dashboard */}
          {!location.pathname.startsWith('/dashboard') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  location.pathname === "/dashboard" && "bg-accent"
                )}
              >
                <Link to="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  location.pathname === "/dashboard/usage-billing" && "bg-accent"
                )}
              >
                <Link to="/dashboard/usage-billing">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Usage & Billing
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  location.pathname === "/account/subscription" && "bg-accent"
                )}
              >
                <Link to="/account/subscription">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscription
                </Link>
              </Button>
            </>
          )}
          {/* Always show Help & Feedback */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeedbackModalOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Help & Feedback
          </Button>
        </div>

        {/* Mobile: Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden ml-2">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 mt-6">
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "justify-start",
                  location.pathname === "/dashboard" && "bg-accent"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "justify-start",
                  location.pathname === "/dashboard/usage-billing" && "bg-accent"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/dashboard/usage-billing">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Usage & Billing
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "justify-start",
                  location.pathname === "/account/subscription" && "bg-accent"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/account/subscription">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscription
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackModalOpen(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Help & Feedback
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
      />
    </nav>
  );
};
