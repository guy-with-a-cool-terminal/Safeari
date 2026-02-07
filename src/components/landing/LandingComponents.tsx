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
  <div className="group relative rounded-xl bg-card border border-border/80 shadow-sm hover:shadow-lg p-8 hover-lift">
    <div className="space-y-4">
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
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
  <div className="group relative p-6 transition-all duration-300">
    <div className="flex flex-col gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
        <span className="font-semibold text-primary group-hover:text-primary-foreground text-lg transition-colors duration-300">{number}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary/70" />
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        </div>
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

export const FeatureCard = ({ Icon, iconSrc, title, description, image, imageAlt, glowColor = "from-primary/10" }: FeatureCardProps) => {
  const hasImage = !!image;

  return (
    <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover-lift ${hasImage ? 'border-border/20 h-[320px]' : 'bg-card border-border/60 hover:border-primary/20 h-full'}`}>

      {/* Background Image & Overlay */}
      {hasImage && (
        <>
          <div className="absolute inset-0">
            <img
              src={image}
              alt={imageAlt || title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 saturate-[1.1]"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black group-hover:via-black/50 transition-colors duration-300" />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 p-8 h-full flex flex-col ${hasImage ? 'justify-end' : ''}`}>

        {/* Icon */}
        <div className={`mb-auto ${hasImage ? 'mb-4' : 'mb-5'}`}>
          <div className={`h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center transition-all duration-300 ${hasImage
            ? 'bg-white/10 backdrop-blur-md text-white border border-white/20'
            : 'bg-primary/5 group-hover:bg-primary/10 text-primary'
            }`}>
            {iconSrc ? (
              <img src={iconSrc} alt="" className="h-6 w-6 md:h-7 md:w-7" />
            ) : (
              Icon && <Icon className="h-6 w-6 md:h-7 md:w-7" />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h3 className={`text-xl font-bold tracking-tight ${hasImage ? 'text-white drop-shadow-xl' : 'text-foreground'}`}>
            {title}
          </h3>
          <p className={`text-base leading-relaxed ${hasImage ? 'text-white/95 drop-shadow-lg' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

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
      className={`inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all h-10 px-4 w-full ${className}`}
    >
      {children}
    </a>
  );

  return (
    <div className="group relative rounded-xl bg-card border border-border shadow-sm hover:shadow-md p-8 text-center hover-lift">
      <div className="space-y-5">
        <div className="mx-auto h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <Button className={buttonVariant === "default" ? `bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm ${buttonClassName}` : `border border-border bg-transparent hover:bg-muted text-foreground ${buttonClassName}`}>
          {buttonText}
          <Icon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};