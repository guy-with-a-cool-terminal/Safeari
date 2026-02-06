import React, { useEffect, useRef } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export const useFadeIn = (threshold = 0.2) => {
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

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  glowColor?: string;
}

export const InfoCard = ({ icon: Icon, title, description, glowColor = "from-primary/5" }: InfoCardProps) => (
  <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-card hover:-translate-y-1">
    <div className="space-y-4">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  </div>
);

interface SetupStepProps {
  number: number;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export const SetupStep = ({ number, title, description, Icon }: SetupStepProps) => (
  <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-card">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
        <span className="font-bold text-primary text-lg">{number}</span>
      </div>
      <div className="space-y-2 flex-1">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

interface FeatureCardProps {
  Icon?: LucideIcon;
  iconSrc?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  glowColor?: string;
}

export const FeatureCard = ({ Icon, iconSrc, title, description, image, imageAlt, glowColor = "from-primary/10" }: FeatureCardProps) => (
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
            alt={imageAlt || title}
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </div>
    )}
  </Card>
);

interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  buttonVariant?: "default" | "outline";
  buttonClassName?: string;
  glowColor?: string;
  isExternal?: boolean;
}

export const ContactCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonHref,
  buttonVariant = "outline",
  buttonClassName = "",
  glowColor = "from-primary/5",
  isExternal = false
}: ContactCardProps) => {
  const Button = ({ children, className }: { children: React.ReactNode; className: string }) => (
    <a
      href={buttonHref}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full ${className}`}
    >
      {children}
    </a>
  );

  return (
    <div className="group relative rounded-xl bg-card/50 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:bg-card hover:-translate-y-1">
      <div className="space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <Button className={buttonVariant === "default" ? `bg-primary text-primary-foreground hover:bg-primary/90 ${buttonClassName}` : `border-2 hover:border-primary hover:bg-primary/5 ${buttonClassName}`}>
          {buttonText}
          <Icon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};