import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, Check, ArrowRight, MessageCircle, Phone, Mail
} from "lucide-react";
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
  <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
    {badge && (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
        <badge.icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">{badge.text}</span>
      </div>
    )}
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{title}</h2>
    {subtitle && (
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
        {subtitle}
      </p>
    )}
  </div>
);

export const WhySection = () => {
  return (
    <section id="why" className="py-16 md:py-24 border-t bg-gradient-to-b from-primary/5 to-background px-4 md:px-6">
      <div className="container">
        <SectionHeader
          badge={{ icon: Shield, text: "Why Choose Safeari?" }}
          title="The Protection That Actually Works"
          subtitle="Not just another app blocker. Safeari protects at the internet level—before harmful content even reaches your family's devices."
        />

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {WHY_CARDS.map((card, index) => (
            <InfoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const SetupSection = () => {
  const setupRef = useFadeIn();
  
  return (
    <section id="setup" ref={setupRef} className="py-16 md:py-24 border-t bg-muted/30 px-4 md:px-6">
      <div className="container">
        <SectionHeader
          title="Simple setup process"
          subtitle="Get started in minutes with our guided setup"
        />
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
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
    <section id="features" ref={featuresRef} className="py-20 bg-muted/20 border-t">
      <div className="container text-center space-y-14">
        <SectionHeader
          badge={{ icon: Shield, text: "Powerful Features, Simple Interface" }}
          title="Complete Protection, Total Control"
          subtitle="Professional-grade filtering built for real parents. Simple enough to set up in minutes, powerful enough to protect what matters most."
        />
        <div className="grid gap-8 sm:grid-cols-2">
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
  );
};

const ComparisonCell = ({ value }: { value: boolean | string }) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-6 w-6 text-green-600 mx-auto" />
    ) : (
      <span className="text-red-500 text-xl">✕</span>
    );
  }
  return <span className={typeof value === "string" && value.includes("3-5") ? "text-green-600 font-semibold" : "text-muted-foreground"}>{value}</span>;
};

export const ComparisonSection = () => {
  return (
    <section id="comparison" className="py-16 md:py-24 border-t bg-gradient-to-b from-muted/30 to-background px-4 md:px-6">
      <div className="container max-w-6xl mx-auto">
        <SectionHeader
          badge={{ icon: Check, text: "The Smart Choice" }}
          title="Why Safeari Beats The Rest"
          subtitle="Not all parental controls are created equal. Here's why Safeari's internet-level protection works better than browser extensions or apps."
        />

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
              {COMPARISON_ROWS.map((row, index) => (
                <tr key={index} className={`border-t ${index % 2 === 1 ? 'bg-muted/20' : ''} hover:bg-muted/30 transition-colors`}>
                  <td className="p-4 md:p-6 font-medium">{row.feature}</td>
                  <td className="text-center p-4 md:p-6"><ComparisonCell value={row.safeari} /></td>
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
    <section id="faq" className="py-16 md:py-24 border-t bg-background px-4 md:px-6">
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
            <a href="mailto:support@safeari.co.ke">
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
  );
};

export const WhatsAppSection = () => {
  return (
    <section className="py-16 md:py-24 border-t bg-muted/30 px-4 md:px-6">
      <div className="container max-w-4xl mx-auto">
        <WhatsAppCTA variant="landing" />
      </div>
    </section>
  );
};

export const ContactSection = () => {
  const contactCards = [
    {
      icon: MessageCircle,
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
    <section id="contact" className="py-16 md:py-24 border-t bg-gradient-to-b from-primary/5 to-muted/20 px-4 md:px-6">
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
  );
};

export const FinalCTASection = ({ isAuthenticated }) => {
  return (
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
              {FINAL_CTA_BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
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
  );
};