import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, Check, ArrowRight, MessageCircle, Phone, Mail, Info, Star, Play, CreditCard
} from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SafeariIconLogo from "@/assets/favicon.svg";
import { TierCard } from "@/components/subscription/TierCard";
import { WhatsAppCTA, WHATSAPP_LINK } from "@/components/feedback/WhatsAppCTA";
import {
  WHY_CARDS,
  SETUP_STEPS,
  FEATURES,
  COMPARISON_ROWS,
  FAQS,
  FINAL_CTA_BENEFITS
} from "./landingData";
import { SetupStep, FeatureCard, InfoCard, ContactCard, useFadeIn } from "./LandingComponents";

interface SectionHeaderProps {
  badge?: { icon: React.ComponentType<any>; text: string };
  title: string;
  subtitle?: string;
}

const SectionHeader = ({ badge, title, subtitle }: SectionHeaderProps) => (
  <div className="text-center space-y-4 mb-16">
    {badge && (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
        <badge.icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">{badge.text}</span>
      </div>
    )}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">{title}</h2>
    {subtitle && (
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
        {subtitle}
      </p>
    )}
  </div>
);

export const WhySection = () => {
  return (
    <section id="why" className="py-16 md:py-24 bg-secondary px-4 md:px-6">
      <div className="container">
        <SectionHeader
          badge={{ icon: Shield, text: "Why Choose Safeari?" }}
          title="The Protection That Actually Works"
          subtitle="Not just another app kids can delete. Safeari protects your family at the source, keeping them safe on every app and device automatically."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {WHY_CARDS.map((card, index) => (
            <InfoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const SocialProofSection = () => {
  return (
    <section className="py-10 border-y border-border/40 bg-muted/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full opacity-90">
          <div className="flex items-center gap-1 text-primary">
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
            <Star className="h-5 w-5 fill-primary" />
          </div>
          <span className="font-semibold text-lg text-foreground">2,000+ Families Protected</span>
        </div>
      </div>
    </section>
  );
};

export const DemoSection = () => {
  const CALENDLY_URL = "https://calendly.com/njugunabriian/safeari-demo";

  return (
    <section id="demo" className="py-24 bg-background px-4 md:px-6 border-t border-border/40">
      <div className="container max-w-3xl mx-auto text-center space-y-10">
        <div className="space-y-6">
          <h3 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
            See Safeari in Action.
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Not sure yet? Book a quick 10-minute live demo. We'll show you exactly how to block apps, set limits, and protect your home—no sales pressure.
          </p>
        </div>
        <div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1 gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Book a Live Demo Now
            </Button>
          </a>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mt-6">
            Free 10-minute walkthrough
          </p>
        </div>
      </div>
    </section>
  );
};

export const SetupSection = () => {
  const setupRef = useFadeIn();

  return (
    <section id="setup" ref={setupRef} className="py-16 md:py-24 bg-background px-4 md:px-6">
      <div className="container">
        <SectionHeader
          title="Simple setup process"
          subtitle="Get started in minutes with our guided setup"
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {SETUP_STEPS.map((step, index) => (
            <SetupStep key={index} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  const featuresRef = useFadeIn();

  return (
    <section id="features" ref={featuresRef} className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <SectionHeader
          badge={{ icon: Shield, text: "Powerful Features, Simple Interface" }}
          title="Complete Protection, Total Control"
          subtitle="Professional-grade filtering built for real parents. Simple enough to set up in minutes, powerful enough to protect what matters most."
        />
        <div className="grid gap-8 sm:grid-cols-2 max-w-6xl mx-auto">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const PricingSection = ({ tiers, tiersLoading, handleTierSelect }) => {
  const pricingRef = useFadeIn();

  return (
    <section id="pricing" ref={pricingRef} className="py-16 md:py-24 bg-secondary px-4 md:px-6">
      <div className="container text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            Choose your plan
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 font-medium">
            Start free. Upgrade as your family grows.
          </p>

          <div className="max-w-2xl mx-auto p-4 rounded-xl bg-card border border-border text-sm text-muted-foreground shadow-sm">
            <strong className="text-primary font-semibold">Why we offer a free plan:</strong> We believe every child deserves protection, regardless of family budget. Our free tier includes full filtering—paid plans just add more profiles and analytics history.
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground px-4 py-2 border border-border/20 inline-block rounded-lg bg-background/50">
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

        <div className="pt-16 border-t border-border/10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground/30 mb-12">Supported Secure Payments</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {/* Floating M-PESA Full-Name Icon */}
            <div className="group flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-center h-12 px-2 transition-transform group-hover:scale-110">
                <div className="text-[#00A651] font-black text-3xl tracking-tighter filter drop-shadow-sm">M-PESA</div>
              </div>
              <span className="text-[10px] font-black tracking-widest text-[#00A651] uppercase opacity-60 group-hover:opacity-100 transition-opacity">STK Push</span>
            </div>

            {/* Floating AIRTEL Full-Name Icon */}
            <div className="group flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-center h-12 px-2 transition-transform group-hover:scale-110">
                <div className="text-[#FF0000] font-black text-3xl tracking-tighter filter drop-shadow-sm">AIRTEL</div>
              </div>
              <span className="text-[10px] font-black tracking-widest text-[#FF0000] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Airtel Money</span>
            </div>

            {/* Icon-Only Card Support */}
            <div className="group flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-center h-12 px-2 transition-transform group-hover:scale-110">
                <CreditCard className="h-12 w-12 text-slate-800 dark:text-slate-200 opacity-80 group-hover:opacity-100 transition-opacity filter drop-shadow-sm" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase">Visa/Master</span>
            </div>
          </div>
        </div>

        <p className="text-base text-muted-foreground mt-12 font-semibold tracking-tight text-primary/60">
          That's less than your child's daily lunch money
        </p>
      </div>
    </section>
  );
};

const ComparisonCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-6 w-6 text-green-600 mx-auto" />
    ) : (
      <span className="text-red-500 text-xl opacity-40">✕</span>
    );
  }
  return <span className={typeof value === "string" && value.includes("3-5") ? "text-green-600 font-semibold" : "text-muted-foreground"}>{value}</span>;
};

export const ComparisonSection = () => {
  return (
    <section id="comparison" className="py-16 md:py-24 bg-background px-4 md:px-6">
      <div className="container max-w-6xl mx-auto">
        <SectionHeader
          badge={{ icon: Check, text: "The Smart Choice" }}
          title="Why Safeari Beats The Rest"
          subtitle="Not all parental controls are created equal. Here's why Safeari's internet-level protection works better than browser extensions or apps."
        />

        <div className="overflow-x-auto rounded-2xl border border-border shadow-lg bg-card scrollbar-hide">
          <table className="w-full border-collapse min-w-[600px] md:min-w-0">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-4 md:p-6 font-semibold text-sm md:text-base sticky left-0 bg-secondary md:relative z-10 w-1/3">Feature</th>
                <th className="text-center p-4 md:p-6 font-semibold text-sm md:text-base border-x border-border bg-white shadow-sm">
                  <div className="flex flex-col items-center gap-2">
                    <img src={SafeariIconLogo} alt="" className="h-8 w-8" />
                    <span className="text-primary font-semibold leading-tight">Safeari<br /><span className="text-[10px] font-medium opacity-70">Best for Trust</span></span>
                  </div>
                </th>
                <th className="text-center p-4 md:p-6 font-semibold text-xs md:text-sm text-muted-foreground">Browser<br />Extensions</th>
                <th className="text-center p-4 md:p-6 font-semibold text-xs md:text-sm text-muted-foreground">Device<br />Apps</th>
              </tr>
            </thead>
            <tbody className="text-sm md:text-base">
              {COMPARISON_ROWS.map((row, index) => (
                <tr key={index} className={`border-t border-border/10 ${index % 2 === 1 ? 'bg-muted/10' : ''} hover:bg-muted/20 transition-colors`}>
                  <td className="p-4 md:p-6 font-medium sticky left-0 bg-inherit md:relative z-10">{row.feature}</td>
                  <td className="text-center p-4 md:p-6 border-x border-primary/10 bg-primary/5"><ComparisonCell value={row.safeari} /></td>
                  <td className="text-center p-4 md:p-6"><ComparisonCell value={row.browserExt} /></td>
                  <td className="text-center p-4 md:p-6"><ComparisonCell value={row.deviceApps} /></td>
                </tr>
              ))}
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
  );
};

export const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-background px-4 md:px-6">
      <div className="container max-w-4xl mx-auto">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about protecting your family online"
        />

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl px-5 md:px-6 bg-card shadow-sm hover:shadow-md transition-all duration-300"
            >
              <AccordionTrigger className="text-left py-4 md:py-5 hover:no-underline text-sm md:text-base font-semibold text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-4 md:pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10 md:mt-12 p-6 md:p-8 rounded-xl bg-secondary border border-border text-foreground">
          <p className="text-sm md:text-base text-muted-foreground mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:support@safeari.co.ke">
              <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white hover:bg-white/80">
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
  );
};

export const WhatsAppSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background px-4 md:px-6">
      <div className="container max-w-4xl mx-auto">
        <WhatsAppCTA variant="landing" />
      </div>
    </section>
  );
};

export const ContactSection = () => {
  const contactCards = [
    {
      icon: SiWhatsapp,
      title: "WhatsApp Support",
      description: "Join our parent community for instant help and tips from other families",
      buttonText: "Join WhatsApp Group",
      buttonHref: WHATSAPP_LINK,
      buttonVariant: "default" as const,
      buttonClassName: "bg-green-600 hover:bg-green-700 text-white",
      glowColor: "from-green-500/5",
      isExternal: true
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our support team during business hours",
      buttonText: "0114399034",
      buttonHref: "tel:0114399034",
      buttonVariant: "outline" as const,
      glowColor: "from-blue-500/5"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Prefer email? We typically respond within 24 hours",
      buttonText: "support@safeari.co.ke",
      buttonHref: "mailto:support@safeari.co.ke",
      buttonVariant: "outline" as const,
      glowColor: "from-purple-500/5"
    }
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-secondary px-4 md:px-6">
      <div className="container max-w-5xl mx-auto">
        <SectionHeader
          badge={{ icon: MessageCircle, text: "We're Here to Help" }}
          title="Get in Touch"
          subtitle="Questions about setup? Need help choosing a plan? Our team is ready to assist you."
        />

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {contactCards.map((card, index) => (
            <ContactCard key={index} {...card} />
          ))}
        </div>

        <div className="rounded-xl bg-card border border-border p-6 md:p-8 shadow-sm">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Need Help?</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our team is here to assist you. Whether you have questions about setup, features, or billing, we're just a message away.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FinalCTASection = ({ isAuthenticated }) => {
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden px-4 md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="container space-y-8 max-w-4xl mx-auto relative z-10 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">Your Kids Are Online Right Now.<br /><span className="text-primary italic">Are They Protected?</span></h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Join thousands of parents who've stopped worrying about bypasses and workarounds.
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-xl bg-muted/30 backdrop-blur-sm p-8 space-y-6">
          <div className="space-y-4">
            {FINAL_CTA_BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 text-left">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>{benefit.text}</strong>{benefit.suffix}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-base bg-primary hover:bg-primary/90 text-primary-foreground">
                  Return to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/register" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-base bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Protecting for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Takes less time than making a cup of coffee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};