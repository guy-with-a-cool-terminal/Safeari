import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeariLogo from "@/assets/favicon.svg";
import SafeariIconLogo from "@/assets/favicon.svg";
import { useSubscriptionTiers } from "@/hooks/useSubscriptionTiers";
import { useAuth } from "@/contexts/AuthContext";
import heroDashboard from "@/assets/childontab.webp";
import ScrollToTop from "@/components/modals/ScrollToTop";
import { NAV_ITEMS } from "./landingData";
import {
  WhySection,
  SetupSection,
  FeaturesSection,
  PricingSection,
  ComparisonSection,
  FAQSection,
  WhatsAppSection,
  ContactSection,
  FinalCTASection
} from "./LandingSections";

interface NavLinksProps {
  activeSection: string;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const NavLinks = ({ activeSection, isMobile = false, onItemClick }: NavLinksProps) => {
  const baseClassName = isMobile 
    ? "block text-base font-medium py-3 px-4 rounded-lg transition-colors duration-200"
    : "text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200";
    
  const activeClassName = isMobile
    ? "text-primary bg-primary/10"
    : "text-primary bg-primary/10";
    
  const hoverClassName = "hover:text-primary hover:bg-primary/5";

  return (
    <>
      {NAV_ITEMS.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={onItemClick}
          className={`${baseClassName} ${activeSection === id ? activeClassName : hoverClassName}`}
        >
          {label}
        </a>
      ))}
    </>
  );
};

interface AuthButtonsProps {
  isAuthenticated: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const AuthButtons = ({ isAuthenticated, isMobile = false, onItemClick }: AuthButtonsProps) => {
  const buttonSize = isMobile ? "lg" : "sm";
  const containerClass = isMobile 
    ? "pt-6 border-t border-border/40 space-y-3 w-full"
    : "";
    
  const buttonClass = isMobile ? "w-full" : "";

  if (isAuthenticated) {
    return (
      <div className={containerClass}>
        <Link to="/dashboard" onClick={onItemClick} className={isMobile ? "block" : ""}>
          <Button 
            size={buttonSize} 
            className={`${buttonClass} bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-md`}
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={containerClass}>
        <Link to="/login" onClick={onItemClick} className="block">
          <Button variant="outline" size={buttonSize} className={`${buttonClass} font-medium border-2`}>
            Sign In
          </Button>
        </Link>
        <Link to="/register" onClick={onItemClick} className="block">
          <Button size={buttonSize} className={`${buttonClass} bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-md`}>
            Get Started Free
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/login">
        <Button variant="ghost" size={buttonSize} className="font-medium">
          Sign In
        </Button>
      </Link>
      <Link to="/register">
        <Button size={buttonSize} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-md">
          Get Started
        </Button>
      </Link>
    </>
  );
};

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const { tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const handleScroll = () => {
      let current = "top";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          current = section.id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTierSelect = (tier) => {
    if (tier.name.toLowerCase() !== 'free') {
      localStorage.setItem('redirect_after_login', '/onboarding/subscription');
      localStorage.setItem('selected_tier', tier.name);
    }
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollToTop />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg shadow-sm" role="banner">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
          <a href="#top" className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-105 duration-300">
            <img src={SafeariLogo} alt="Safeari" className="h-8 w-8 md:h-10 md:w-10" />
            <span className="text-xl md:text-2xl font-bold text-primary">Safeari</span>
          </a>

          <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="Main navigation">
            <NavLinks activeSection={activeSection} />
            <span className="mx-2 border-l h-6 border-border/40" />
            <AuthButtons isAuthenticated={isAuthenticated} />
          </nav>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors" 
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Simplified Mobile Menu - Side Drawer */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity" 
            onClick={() => setMenuOpen(false)} 
          />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] z-50 bg-background border-l border-border shadow-2xl md:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <img src={SafeariLogo} alt="Safeari" className="h-7 w-7" />
                  <span className="text-lg font-bold text-primary">Safeari</span>
                </div>
                <button 
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors" 
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-1">
                <NavLinks activeSection={activeSection} isMobile onItemClick={() => setMenuOpen(false)} />
              </nav>

              {/* Auth Buttons */}
              <div className="p-4">
                <AuthButtons isAuthenticated={isAuthenticated} isMobile onItemClick={() => setMenuOpen(false)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero Section - Refined */}
      <main>
        <section id="top" className="container py-16 md:py-24 lg:py-32 px-4 md:px-6" aria-labelledby="hero-heading">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mx-auto lg:mx-0">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Trusted by Kenyan families</span>
              </div>

              {/* Main Headline - Shorter, Punchier */}
              <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Keep your kids safe online
              </h1>

              {/* Subheadline - Less Fear, More Confidence */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Block harmful content, manage screen time, and protect every device—phones, tablets, computers, even smart TVs. Set it once, protected forever.
              </p>

              {/* Key Benefits - Scannable */}
              <div className="flex flex-col gap-2 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold">✓</span>
                  <span>Works on all devices—no app to delete</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold">✓</span>
                  <span>Setup in 5 minutes, protected 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-semibold">✓</span>
                  <span>Free plan available—no credit card needed</span>
                </div>
              </div>

              {/* CTAs - Consistent Styling */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="h-14 px-8 font-semibold text-base rounded-lg shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl transition-all duration-300 w-full">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button size="lg" className="h-14 px-8 font-semibold text-base rounded-lg shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-xl transition-all duration-300 w-full">
                        Start Protecting for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="h-14 px-8 font-semibold text-base rounded-lg border-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 w-full">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Link to Pricing */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                <a 
                  href="#pricing" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  View Plans & Pricing
                </a>
              </div>
            </div>

            {/* Hero Image - Cleaner Presentation */}
            <div className="relative w-full max-w-xl lg:max-w-none mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-3xl opacity-50" />
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src={heroDashboard}
                  alt="Child safely using a tablet with Safeari parental control protection"
                  loading="eager"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* All Other Sections */}
        <WhySection />
        <SetupSection />
        <FeaturesSection />
        <PricingSection 
          tiers={tiers} 
          tiersLoading={tiersLoading} 
          handleTierSelect={handleTierSelect} 
        />
        <ComparisonSection />
        <FAQSection />
        <WhatsAppSection />
        <ContactSection />
        <FinalCTASection isAuthenticated={isAuthenticated} />
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16 text-center text-muted-foreground bg-muted/5 px-4" role="contentinfo">
        <div className="container space-y-6">
          <div className="flex justify-center items-center mb-4">
            <img src={SafeariLogo} alt="Safeari - Parental Control and Internet Safety" className="h-8 md:h-10 w-auto" />
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Safeari. All rights reserved.</p>
          <p className="text-sm text-muted-foreground/70">
            A product by{" "}
            <a
              href="https://cnbcode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
            >
              CnB Code
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors text-sm">Terms of Service</Link>
            <a href="mailto:support@safeari.co.ke" className="hover:text-foreground transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;