import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, Zap, Shield, Check } from "lucide-react";
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
  FinalCTASection,
  SocialProofSection,
  DemoSection
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg shadow-sm" role="banner">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
          <a href="#top" className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-105 duration-300">
            <img src={SafeariLogo} alt="Safeari" className="h-14 w-14 md:h-16 md:w-16" />
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

      {/* Hero Section - Refined with Professional Mobile Background Optimization */}
      <main>
        <section id="top" className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden" aria-labelledby="hero-heading">
          {/* Extended Right-Side Glow */}
          <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[50vw] h-[120%] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Hero Background - High Visibility in All Modes */}
          <div className="lg:hidden absolute inset-0 -z-10">
            <img
              src={heroDashboard}
              alt=""
              className="w-full h-full object-cover opacity-[0.18] dark:opacity-[0.45] saturate-[1.3] brightness-[1.05] dark:brightness-[0.9] transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/20 dark:via-background/40 to-background" />
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                {/* Hero Hook */}

                {/* Specific Daily struggle Hook - Non-slanting */}
                <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
                  Stop fighting about <br className="hidden md:block" />
                  <span className="text-primary">TikTok & Social Media.</span>
                </h1>

                {/* Subheadline - Immediate Relief */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-90">
                  Block specific apps, set healthy limits, and keep them safe from hidden threats—without the constant workarounds or fights. Setup in 5 minutes.
                </p>

                {/* Key Benefits - Scannable & Aggressive */}
                <div className="flex flex-col gap-3 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary font-bold" />
                    </div>
                    <span><strong className="text-foreground">Impossible to bypass</strong> — blocks VPNs kids use to cheat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary font-bold" />
                    </div>
                    <span><strong className="text-foreground">Universal protection</strong> — phones, tablets, smart TVs & consoles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary font-bold" />
                    </div>
                    <span><strong className="text-foreground">Setup once, protected 24/7</strong> — in less than 5 minutes</span>
                  </div>
                </div>

                {/* CTAs */}
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
                        <Button size="lg" className="h-14 px-8 font-semibold text-base rounded-md shadow-md bg-primary hover:bg-primary/90 transition-all duration-200 w-full">
                          Start Protecting for Free
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/login" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="h-14 px-8 font-semibold text-base rounded-md border-border text-foreground hover:bg-muted transition-all duration-200 w-full">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>


              </div>

              {/* Desktop Hero Image - Floating UI Window with Ambient Glow */}
              <div className="relative hidden lg:block w-full max-w-xl lg:max-w-none mx-auto group pl-10 perspective-1000">

                {/* Soft Ambient Glow (Anchoring) */}
                <div className="absolute -inset-10 bg-primary/30 blur-[120px] rounded-full opacity-40 animate-pulse-slow pointer-events-none" />

                {/* Floating UI Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-3xl shadow-primary/20 transition-all duration-700 hover:scale-[1.01] hover:shadow-primary/30 bg-background transform rotate-y-[-2deg] hover:rotate-0">
                  <img
                    src={heroDashboard}
                    alt="Safeari Dashboard Interface"
                    loading="eager"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Other Sections */}
        <SocialProofSection />
        <WhySection />
        <DemoSection />
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
            <img src={SafeariLogo} alt="Safeari" className="h-8 md:h-10 w-auto" />
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