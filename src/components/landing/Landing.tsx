import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, Zap } from "lucide-react";
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
    ? "block text-xl font-semibold py-3 px-6 rounded-lg transition-all duration-300"
    : "text-xs lg:text-sm font-medium px-2 lg:px-3 py-2 rounded-lg transition-all duration-300";
    
  const activeClassName = isMobile
    ? "text-primary bg-primary/10 scale-105 shadow-lg"
    : "text-primary font-semibold bg-primary/10";
    
  const hoverClassName = isMobile
    ? "hover:text-primary hover:bg-primary/5 hover:scale-105"
    : "hover:text-primary hover:bg-primary/5";

  return (
    <>
      {NAV_ITEMS.map(({ id, label }, index) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={onItemClick}
          className={`${baseClassName} ${activeSection === id ? activeClassName : hoverClassName}`}
          style={isMobile ? { animationDelay: `${(index + 1) * 80}ms` } : undefined}
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
    ? "pt-8 border-t border-border/40 space-y-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom duration-500 delay-300"
    : "";
    
  const buttonClass = isMobile ? "w-full rounded-lg" : "rounded-lg text-sm lg:text-base";

  if (isAuthenticated) {
    return (
      <div className={containerClass}>
        <Link to="/dashboard" onClick={onItemClick} className={isMobile ? "block" : ""}>
          <Button 
            size={buttonSize} 
            className={`${buttonClass} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
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
          <Button variant="outline" size={buttonSize} className={`${buttonClass} transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-md`}>
            Sign In
          </Button>
        </Link>
        <Link to="/register" onClick={onItemClick} className="block">
          <Button size={buttonSize} className={`${buttonClass} transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/login">
        <Button variant="ghost" size={buttonSize} className={`${buttonClass} transition-all duration-300 hover:scale-105`}>
          Sign In
        </Button>
      </Link>
      <Link to="/register">
        <Button size={buttonSize} className={`${buttonClass} transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <ScrollToTop />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-sm" role="banner">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
          <a href="#top" className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-105 duration-300">
            <img src={SafeariLogo} alt="Safeari" className="h-7 w-7 md:h-9 md:w-9" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Safeari</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2" role="navigation" aria-label="Main navigation">
            <NavLinks activeSection={activeSection} />
            <span className="mx-1 border-l h-6 border-border/40" />
            <AuthButtons isAuthenticated={isAuthenticated} />
          </nav>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 active:scale-95 transition-all duration-200" 
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 md:hidden" 
            onClick={() => setMenuOpen(false)} 
          />
          <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300 p-6 md:hidden" role="dialog" aria-label="Mobile menu">
            <button 
              className="absolute top-6 right-6 p-2 rounded-lg hover:bg-primary/10 active:scale-95 transition-all duration-200" 
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-7 w-7" />
            </button>
            
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom duration-500 delay-150">
              <NavLinks activeSection={activeSection} isMobile onItemClick={() => setMenuOpen(false)} />
            </div>

            <AuthButtons isAuthenticated={isAuthenticated} isMobile onItemClick={() => setMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Hero Section */}
      <main>
        <section id="top" className="container py-12 md:py-20 lg:py-28 px-4 md:px-6" aria-labelledby="hero-heading">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-5 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mx-auto lg:mx-0 backdrop-blur-sm hover:bg-primary/15 transition-colors duration-300">
              <img src={SafeariIconLogo} alt="Safeari logo icon" className="h-4 w-4 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-primary">Trusted by parents in Nairobi, Mombasa, Kisumu & beyond</span>
            </div>

            <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Protect your kids online and manage what they can access.
            </h1>

            <p className="text-base md:text-lg text-primary/80 font-medium">
              Every minute without protection is a minute they could stumble on harmful content.
            </p>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Protection that actually works. Block harmful content, inappropriate websites, and addictive apps across every device—phones, tablets, computers, even smart TVs.
              Set it once, protected forever. No app your child can delete.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 pt-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 px-6 sm:px-8 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full text-sm sm:text-base">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="h-12 px-6 sm:px-8 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full text-sm sm:text-base relative overflow-hidden group">
                      <span className="relative z-10">Start Protecting for Free</span>
                      <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="h-12 px-6 sm:px-8 font-semibold rounded-xl border-2 hover:border-primary hover:text-primary hover:bg-primary/5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full text-sm sm:text-base">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                ✓ Free forever! • No credit card required • Setup in 5 minutes
              </p>
              <a 
                href="#pricing" 
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <Zap className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                Jump to Plans
              </a>
            </div>
          </div>

          <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
            <div className="absolute -inset-3 md:-inset-6 lg:-inset-8 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl md:blur-3xl opacity-60 md:opacity-70 animate-pulse" />
            <div className="relative rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden border border-primary/20 md:border-2 shadow-xl md:shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 bg-background/50 backdrop-blur-sm">
              <img
                src={heroDashboard}
                alt="Child safely using a tablet with Safeari parental control protection enabled, showing filtered content and safe browsing environment"
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
      <footer className="border-t py-10 md:py-14 text-center text-sm md:text-base text-muted-foreground bg-muted/10 px-4" role="contentinfo">
        <div className="container space-y-4 md:space-y-6">
          <div className="flex justify-center items-center mb-4">
            <img src={SafeariLogo} alt="Safeari - Parental Control and Internet Safety" className="h-7 md:h-8 w-auto" />
          </div>
          <p className="text-xs md:text-sm">© {new Date().getFullYear()} Safeari. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/70">
            A product by{" "}
            <a
              href="https://cnbcode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200 font-medium"
            >
              CnB Code
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-2">
            <Link to="/privacy" className="hover:text-foreground hover:scale-105 transition-all duration-200 text-xs md:text-sm">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground hover:scale-105 transition-all duration-200 text-xs md:text-sm">Terms of Service</Link>
            <a href="mailto:support@safeari.co.ke" className="hover:text-foreground hover:scale-105 transition-all duration-200 text-xs md:text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;