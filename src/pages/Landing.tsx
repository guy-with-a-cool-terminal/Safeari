import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Users, Check, Menu, X, ArrowRight, Eye, Clock,
  Youtube, Facebook, Instagram, Twitch, MessageCircle, Video, Gamepad,
  Settings, Smartphone, Phone, Mail,Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SafeariLogo from "@/assets/favicon.svg";
import SafeariIconLogo from "@/assets/favicon.svg";
import { TierCard } from "@/components/subscription/TierCard";
import { useSubscriptionTiers } from "@/hooks/useSubscriptionTiers";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppCTA, WHATSAPP_LINK } from "@/components/feedback/WhatsAppCTA";
import heroDashboard from "@/assets/childontab.webp";
import companiesImage from "@/assets/companies.png";
import kidsImage from "@/assets/3kids.jpg";
import motherAndChildImage from "@/assets/motherandchild.jpg";
import ScrollToTop from "@/components/modals/ScrollToTop";

const useFadeIn = (threshold = 0.2) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("animate-fadeInUp");
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
};

const PlatformFilterAnimation = () => {
  const [platforms, setPlatforms] = useState([
    { id: 1, name: "YouTube", icon: Youtube, filtered: false },
    { id: 2, name: "TikTok", icon: Video, filtered: false },
    { id: 3, name: "Facebook", icon: Facebook, filtered: false },
    { id: 4, name: "Instagram", icon: Instagram, filtered: false },
    { id: 5, name: "Fortnite", icon: Gamepad, filtered: false },
    { id: 6, name: "Twitch", icon: Twitch, filtered: false },
    { id: 7, name: "Snapchat", icon: MessageCircle, filtered: false },
    { id: 8, name: "Netflix", icon: Video, filtered: false },
    { id: 9, name: "Adult Sites", icon: Shield, filtered: false },
    { id: 10, name: "Roblox", icon: Gamepad, filtered: false },
  ]);

  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let interval;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        interval = setInterval(() => {
          setPlatforms((current) => {
            const nextToFilter = current.find((p) => !p.filtered);
            if (nextToFilter) {
              return current.map((p) =>
                p.id === nextToFilter.id ? { ...p, filtered: true } : p
              );
            }
            return current.map((p) => ({ ...p, filtered: false }));
          });
        }, 800);
      } else clearInterval(interval);
    });
    observer.observe(el);
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="text-center">
        <p className="text-sm md:text-base text-muted-foreground font-medium">
          Give your child a focused digital environment
        </p>
      </div>
      {/* <div
        ref={containerRef}
        className="group relative h-32 sm:h-36 md:h-40 bg-gradient-to-b from-muted/40 to-background rounded-xl md:rounded-2xl border border-border/40 p-4 md:p-5 overflow-hidden hover:border-primary/30 transition-all duration-300"
      >
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center h-full">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg border transition-all duration-500 ${
                platform.filtered
                  ? "bg-destructive/10 border-destructive/30 scale-75 opacity-0 -translate-y-4"
                  : "bg-background border-border/60 hover:border-primary/40 hover:shadow-md"
              }`}
              title={platform.filtered ? `${platform.name} - Blocked` : `${platform.name} - Allowed`}
            >
              <platform.icon className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">{platform.name}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

const SetupStep = ({ number, title, description, Icon }) => (
  <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative h-48 md:h-56 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-b overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/20">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <p className="text-xs font-medium text-muted-foreground px-4 text-center">
          Simple {number}-minute setup
        </p>
      </div>
    </div>
    <CardHeader className="relative z-10 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm border border-primary/20">
          <span className="font-bold text-primary text-lg">{number}</span>
        </div>
        <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
      </div>
      <CardDescription className="text-sm md:text-base leading-relaxed">
        {description}
      </CardDescription>
    </CardHeader>
  </Card>
);

const FeatureCard = ({ Icon, iconSrc, title, description, image, glowColor = "from-primary/10" }: any) => (
  <Card className="group relative border border-border/40 hover:border-primary/30 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl md:rounded-2xl overflow-hidden">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${glowColor} to-transparent transition-opacity duration-500`} />
    <CardHeader className="relative z-10 space-y-3 md:space-y-4 p-5 md:p-6">
      <div className="h-11 w-11 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-md">
        {iconSrc ? (
          <img src={iconSrc} alt="" className="h-6 w-6 md:h-7 md:w-7" />
        ) : (
          Icon && <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        )}
      </div>
      <div className="space-y-2">
        <CardTitle className="text-base md:text-lg lg:text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base leading-relaxed">{description}</CardDescription>
      </div>
    </CardHeader>
    {image && (
      <div className="relative z-10">
        <div className="border-t border-border/30">
          <img
            src={image}
            alt={title}
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </div>
    )}
  </Card>
);

const SETUP_STEPS = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up in 30 seconds. No credit card required for the free plan. Start with one profile, upgrade anytime as your family grows.",
    Icon: Users,
  },
  {
    number: 2,
    title: "Choose Age-Appropriate Protection",
    description: "Select from pre-configured age presets: Young Kids (6-9), Tweens (10-12), Teens (13-17), or Young Adults (18+). Or customize every detail yourself.",
    Icon: Settings,
  },
  {
    number: 3,
    title: "Follow Simple Device Setup",
    description: "Get step-by-step instructions for your devices. Copy, paste, done. Works on phones, tablets, computers, and routers. Setup takes 3-5 minutes per device.",
    Icon: Smartphone,
  }
];

const FEATURES = [
  {
    iconSrc: SafeariIconLogo,
    title: "Stop Inappropriate Content Cold",
    description: "Block adult sites, violence, and gambling before your kids can stumble on them. Works on every device automatically.",
    image: companiesImage,
    glowColor: "from-blue-500/10"
  },
  {
    Icon: Users,
    title: "Different Rules for Different Ages",
    description: "Your 7-year-old and 14-year-old don't need the same restrictions. Age presets make it simple - no guesswork.",
    image: kidsImage,
    glowColor: "from-green-500/10"
  },
  {
    Icon: Eye,
    title: "Block TikTok, Snapchat, or YouTube With One Click",
    description: "Tired of arguing about apps? Block them completely or limit to specific times. You decide, not algorithms.",
    image: motherAndChildImage,
    glowColor: "from-purple-500/10"
  },
  {
    Icon: Clock,
    title: "Smart Screen Time Management",
    description: "Set schedules for specific apps and websites. Weekends can be more flexible while school nights stay focused.",
    glowColor: "from-orange-500/10"
  }
];

const FAQS = [
  {
    question: "How does Safeari protect my kids online?",
    answer: "Safeari blocks harmful websites before they even load on your child's device. Protection works across all apps and browsers automatically—no software to install on every device. You configure it once in your device settings, and you're protected forever."
  },
  {
    question: "Is it difficult to set up?",
    answer: "No! Setup takes just 5 minutes. We provide step-by-step instructions for every device type (phones, tablets, computers, routers). Most parents have it running in one sitting. Our support team is also available via WhatsApp, phone, or email if you need help."
  },
  {
    question: "Can my tech-savvy kid bypass Safeari?",
    answer: "Safeari includes bypass protection that blocks VPNs and proxy services kids use to get around filters. While no system is 100% foolproof, Safeari's internet-level protection is much harder to bypass than browser extensions or apps kids can just delete. We also provide alerts if bypass attempts are detected."
  },
  {
    question: "Will this slow down my internet?",
    answer: "No. Safeari works before websites even start loading, so there's zero impact on speed. Actually, it makes browsing faster because ads and trackers are blocked before they download."
  },
  {
    question: "What's the difference between the Free and paid plans?",
    answer: "The Free plan includes all core protection features but limits you to 1 profile and 1 day of analytics history. Paid plans offer multiple profiles (great for families), longer analytics retention (7-90 days), and Premium includes custom allow/deny lists for advanced control. All plans include the same filtering technology."
  },
  {
    question: "Can I try it before committing to a paid plan?",
    answer: "Absolutely! Start with our Free tier—no credit card required. You get full access to all filtering features. When you're ready to add more profiles or need longer analytics history, you can upgrade anytime from your dashboard."
  },
  {
    question: "Does Safeari work on all devices?",
    answer: "Yes! Safeari works on iOS (iPhone/iPad), Android, Windows, Mac, Linux, and even at the router level to protect your entire home network. Once configured, protection follows your child across all their devices automatically."
  },
  {
    question: "How is my family's privacy protected?",
    answer: "We take privacy seriously. Safeari only logs domain names (like 'facebook.com'), not full URLs or personal data. Analytics are encrypted and never sold to third parties. You maintain full control over your data and can export or delete it anytime."
  }
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const { tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const { isAuthenticated } = useAuth();
  const featuresRef = useFadeIn();
  const pricingRef = useFadeIn();
  const setupRef = useFadeIn();

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

      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
          <a href="#top" className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-105 duration-300">
            <img src={SafeariLogo} alt="Safeari" className="h-7 w-7 md:h-9 md:w-9" />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Safeari</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: "why", label: "Why Safeari" },
              { id: "setup", label: "How It Works" },
              { id: "features", label: "Features" },
              { id: "pricing", label: "Plans" },
              { id: "faq", label: "FAQ" },
              { id: "contact", label: "Contact" }
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`text-xs lg:text-sm font-medium px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 ${
                  activeSection === id
                    ? "text-primary font-semibold bg-primary/10"
                    : "hover:text-primary hover:bg-primary/5"
                }`}
              >
                {label}
              </a>
            ))}
            <span className="mx-1 border-l h-6 border-border/40" />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg text-sm lg:text-base">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm" className="transition-all duration-300 hover:scale-105 rounded-lg text-sm lg:text-base">Sign In</Button></Link>
                <Link to="/register"><Button size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg text-sm lg:text-base">Get Started</Button></Link>
              </>
            )}
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

      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 md:hidden" 
            onClick={() => setMenuOpen(false)} 
          />
          <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-top duration-300 p-6 md:hidden">
            <button 
              className="absolute top-6 right-6 p-2 rounded-lg hover:bg-primary/10 active:scale-95 transition-all duration-200" 
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-7 w-7" />
            </button>
            
            <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom duration-500 delay-150">
              {[
                { id: "why", label: "Why Safeari" },
                { id: "setup", label: "How It Works" },
                { id: "features", label: "Features" },
                { id: "pricing", label: "Plans" },
                { id: "faq", label: "FAQ" },
                { id: "contact", label: "Contact" }
              ].map(({ id, label }, index) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-xl font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                    activeSection === id
                      ? "text-primary bg-primary/10 scale-105 shadow-lg"
                      : "hover:text-primary hover:bg-primary/5 hover:scale-105"
                  }`}
                  style={{ animationDelay: `${(index + 1) * 80}ms` }}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="pt-8 border-t border-border/40 space-y-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom duration-500 delay-300">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block">
                  <Button size="lg" className="w-full rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block">
                    <Button variant="outline" size="lg" className="w-full rounded-lg transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-md">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block">
                    <Button size="lg" className="w-full rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <section id="top" className="container py-12 md:py-20 lg:py-28 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-5 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mx-auto lg:mx-0 backdrop-blur-sm hover:bg-primary/15 transition-colors duration-300">
              <img src={SafeariIconLogo} alt="" className="h-4 w-4 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-primary">Trusted by parents in Nairobi, Mombasa, Kisumu & beyond</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
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

            <div className="hidden lg:block pt-4 md:pt-6">
              <PlatformFilterAnimation />
            </div>
          </div>

          <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
            <div className="absolute -inset-3 md:-inset-6 lg:-inset-8 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl md:blur-3xl opacity-60 md:opacity-70 animate-pulse" />
            <div className="relative rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden border border-primary/20 md:border-2 shadow-xl md:shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 bg-background/50 backdrop-blur-sm">
              <img
                src={heroDashboard}
                alt="Child safely browsing with Safeari protection - showing content filtering in action"
                loading="eager"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="lg:hidden w-full">
            <PlatformFilterAnimation />
          </div>
        </div>
      </section>

      <section id="why" className="py-16 md:py-24 border-t bg-gradient-to-b from-primary/5 to-background px-4 md:px-6">
        <div className="container">
          <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Why Choose Safeari?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">The Protection That Actually Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Not just another app blocker. Safeari protects at the internet level—before harmful content even reaches your family's devices.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Works Everywhere, Automatically</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Protection follows your child across all devices, apps, and browsers. No software to install on every device. Set it once, protected forever.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                  <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Impossible to "Just Turn Off"</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Unlike apps kids can delete or browsers they can switch, Safeari protects the entire internet connection. Kids can't just uninstall it. Bypass protection included.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Clock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Zero Performance Impact</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Safeari works before sites even load—no slowdowns whatsoever. Actually makes browsing faster by blocking ads and trackers before they download.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-300">
                  <Users className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">Different Kids, Different Rules</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Your 7-year-old and teenager need different protections. Create separate profiles with age-appropriate presets. No one-size-fits-all approach.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-300">
                  <Eye className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">Privacy-First Design</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  We only log domain names, never full URLs or personal data. Your family's browsing stays private. No selling data to advertisers—ever.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                  <Smartphone className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-xl">Setup in 5 Minutes</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Simple step-by-step guides for every device. Most parents are fully protected in one sitting. Support available via WhatsApp, phone, or email if you need help.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="setup" ref={setupRef} className="py-16 md:py-24 border-t bg-muted/30 px-4 md:px-6">
        <div className="container">
          <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Simple setup process</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">Get started in minutes with our guided setup</p>
          </div>
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {SETUP_STEPS.map((step, index) => (
              <SetupStep key={index} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section id="features" ref={featuresRef} className="py-20 bg-muted/20 border-t">
        <div className="container text-center space-y-14">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powerful Features, Simple Interface</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Complete Protection, Total Control
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Professional-grade filtering built for real parents. Simple enough to set up in minutes, powerful enough to protect what matters most.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" ref={pricingRef} className="py-16 md:py-24 border-t bg-background/95 backdrop-blur-md px-4 md:px-6">
        <div className="container text-center space-y-10 md:space-y-14">
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Choose your plan
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 font-medium">
              Start free. Upgrade as your family grows.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Cheaper than their monthly airtime
            </p>

                        <p className="text-xs sm:text-sm text-muted-foreground px-4 bg-background/80 rounded-lg py-2">
              Prices are shown in USD. Final amount will be calculated in your local currency at checkout.
            </p>

          </div>
          
          {tiersLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {tiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isRecommended={tier.name === 'Family'}
                  onSelect={handleTierSelect}
                  showAllFeatures={false}
                />
              ))}
            </div>
            
          )}
        <p className="text-sm text-muted-foreground mt-2 text-primary/80">
          That's less than your child's daily lunch money 🍔
        </p>

        </div>
      </section>

      <section id="comparison" className="py-16 md:py-24 border-t bg-gradient-to-b from-muted/30 to-background px-4 md:px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">The Smart Choice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Why Safeari Beats The Rest
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Not all parental controls are created equal. Here's why Safeari's internet-level protection works better than browser extensions or apps.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl overflow-hidden shadow-xl">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-4 md:p-6 font-semibold text-sm md:text-base">Feature</th>
                  <th className="text-center p-4 md:p-6 font-semibold text-sm md:text-base">
                    <div className="flex flex-col items-center gap-2">
                      <img src={SafeariIconLogo} alt="" className="h-8 w-8" />
                      <span className="text-primary">Safeari<br/>(Internet-Level)</span>
                    </div>
                  </th>
                  <th className="text-center p-4 md:p-6 font-semibold text-xs md:text-sm text-muted-foreground">Browser<br/>Extensions</th>
                  <th className="text-center p-4 md:p-6 font-semibold text-xs md:text-sm text-muted-foreground">Device-Level<br/>Apps</th>
                </tr>
              </thead>
              <tbody className="text-sm md:text-base">
                <tr className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 md:p-6 font-medium">Works on all apps & browsers</td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-t bg-muted/20 hover:bg-muted/40 transition-colors">
                  <td className="p-4 md:p-6 font-medium">Kids can't easily bypass</td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 md:p-6 font-medium">No software per device</td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="border-t bg-muted/20 hover:bg-muted/40 transition-colors">
                  <td className="p-4 md:p-6 font-medium">Zero performance impact</td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 md:p-6 font-medium">Works on router (whole home)</td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="border-t bg-muted/20 hover:bg-muted/40 transition-colors">
                  <td className="p-4 md:p-6 font-medium">Protects guest devices</td>
                  <td className="text-center p-4 md:p-6"><Check className="h-6 w-6 text-green-600 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4 md:p-6"><X className="h-6 w-6 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4 md:p-6 font-medium">Setup time per device</td>
                  <td className="text-center p-4 md:p-6 text-green-600 font-semibold">3-5 min</td>
                  <td className="text-center p-4 md:p-6 text-muted-foreground">2-3 min</td>
                  <td className="text-center p-4 md:p-6 text-muted-foreground">10-15 min</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group">
                <span className="relative z-10">Try Safeari for Free</span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free forever!
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-24 border-t bg-background px-4 md:px-6">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about protecting your family online
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-5 md:px-6 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left py-4 md:py-5 hover:no-underline text-sm md:text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-4 md:pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-10 md:mt-12 p-6 md:p-8 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm md:text-base text-muted-foreground mb-4">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:support@safeari.com">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Email Us
                </Button>
              </a>
              <a href="tel:0114399034">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Call: 0114399034
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t bg-muted/30 px-4 md:px-6">
        <div className="container max-w-4xl mx-auto">
          <WhatsAppCTA variant="landing" />
        </div>
      </section>

      <section id="contact" className="py-16 md:py-24 border-t bg-gradient-to-b from-primary/5 to-muted/20 px-4 md:px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">We're Here to Help</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Get in Touch</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Questions about setup? Need help choosing a plan? Our team is ready to assist you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                  <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl">WhatsApp Support</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Join our parent community for instant help and tips from other families
                  </CardDescription>
                </div>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                    Join WhatsApp Group
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl">Call Us</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Speak directly with our support team during business hours
                  </CardDescription>
                </div>
                <Button asChild variant="outline" className="w-full border-2 hover:border-primary hover:bg-primary/5">
                  <a href="tel:0114399034">
                    0114399034
                    <Phone className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardHeader>
            </Card>

            <Card className="group relative border-2 hover:border-primary/40 bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative z-10 space-y-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl">Email Support</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Prefer email? We typically respond within 24 hours
                  </CardDescription>
                </div>
                <Button asChild variant="outline" className="w-full border-2 hover:border-primary hover:bg-primary/5">
                  <a href="mailto:support@safeari.com">
                    support@safeari.com
                    <Mail className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardHeader>
            </Card>
          </div>

          <Card className="bg-primary/5 border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-base font-semibold">Need help with setup?</p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Our step-by-step guides work for 95% of users, but if you get stuck, we're here. Don't spend hours troubleshooting—reach out and we'll walk you through it.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a href="#setup">
                    <Button variant="outline" size="sm">
                      View Setup Guides
                    </Button>
                  </a>
                  <a href="#faq">
                    <Button variant="outline" size="sm">
                      Browse FAQ
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24 border-t bg-gradient-to-b from-primary/10 via-primary/5 to-background text-center px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="container space-y-6 md:space-y-8 max-w-4xl mx-auto relative z-10">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Your Kids Are Online Right Now. Are They Protected?</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Join thousands of parents who've taken control of their children's digital safety.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-2">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="grid gap-4 text-sm md:text-base text-left">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Free forever plan</strong> with complete protection</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>No credit card required</strong> to start</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Setup in 5 minutes</strong> with step-by-step guides</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Support available</strong> via WhatsApp, phone, and email</p>
                </div>
              </div>

              <div className="pt-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="inline-block w-full sm:w-auto">
                    <Button size="lg" className="h-14 px-10 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto text-base relative overflow-hidden group">
                      <span className="relative z-10">Go to Dashboard</span>
                      <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register" className="inline-block w-full sm:w-auto">
                    <Button size="lg" className="h-14 px-10 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto text-base relative overflow-hidden group">
                      <span className="relative z-10">Start Protecting for Free</span>
                      <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>
                  </Link>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  Takes less time than making a cup of coffee ☕
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-10 md:py-14 text-center text-sm md:text-base text-muted-foreground bg-muted/10 px-4">
        <div className="container space-y-4 md:space-y-6">
          <div className="flex justify-center items-center mb-4">
            <img src={SafeariLogo} alt="Safeari" className="h-7 md:h-8 w-auto" />
          </div>
          <p className="text-xs md:text-sm">© 2025 Safeari. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/70">
            A product by{" "}
            <a
              href="https://cnbcode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200 font-medium"
            >
              CNB Code
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-2">
            <Link to="/privacy" className="hover:text-foreground hover:scale-105 transition-all duration-200 text-xs md:text-sm">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground hover:scale-105 transition-all duration-200 text-xs md:text-sm">Terms of Service</Link>
            <a href="mailto:support@safeari.com" className="hover:text-foreground hover:scale-105 transition-all duration-200 text-xs md:text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;