/**
 * Onboarding Tooltip Component
 *
 * Hybrid design: translucent card + progress dots + clean layout
 * - NO glow effect
 * - Shield icon (small)
 * - Dismissible with localStorage tracking
 */

import { useEffect, useRef } from "react";
import { X, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OnboardingTooltipProps {
  // Content
  title: string;
  message: string;

  // Progress tracking
  step: number;           // Current step (1-based: 1, 2, 3...)
  totalSteps: number;     // Total number of steps

  // Positioning
  position?: "top" | "bottom" | "left" | "right";

  // Actions
  onNext?: () => void;
  onSkip?: () => void;
  onClose?: () => void;

  // Visibility
  visible?: boolean;

  // Optional customization
  className?: string;
}

export const OnboardingTooltip = ({
  title,
  message,
  step,
  totalSteps,
  position = "bottom",
  onNext,
  onSkip,
  onClose,
  visible = true,
  className = "",
}: OnboardingTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts (Escape to close, Arrow Right to advance)
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose, onNext]);

  // ✅ REMOVED: Click-outside dismissal
  // Tooltips now stay visible until user explicitly dismisses (Skip/X/Finish button)
  // This prevents accidental closure and tour progress loss

  if (!visible) return null;

  // Pointer classes based on position
  const pointerClasses = {
    top: "-bottom-2.5 left-6",
    bottom: "-top-2.5 left-6",
    left: "-right-2.5 top-3",
    right: "-left-2.5 top-3",
  };

  const pointerRotation = {
    top: "rotate-[225deg]",
    bottom: "rotate-45",
    left: "rotate-[315deg]",
    right: "rotate-[135deg]",
  };

  return (
    <div
      ref={tooltipRef}
      className={`z-[9999] animate-in fade-in slide-in-from-top-4 duration-500 w-full max-w-xs ${className}`}
      role="dialog"
      aria-labelledby="tooltip-title"
      aria-describedby="tooltip-description"
    >
      {/* Pointer */}
      <div
        className={`
          absolute w-5 h-5
          bg-gradient-to-br from-card to-card/90
          border-l-2 border-t-2 border-primary/40
          ${pointerRotation[position]}
          ${pointerClasses[position]}
        `}
      />

      {/* Tooltip card - Responsive sizing */}
      <div className="
        relative
        bg-gradient-to-br from-card to-card/90
        border-2 border-primary/40
        rounded-xl
        p-3 md:p-4 lg:p-5
        shadow-2xl
        w-full
        backdrop-blur-sm
        max-w-[90vw] md:max-w-xs
      ">
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-2 right-2
            p-1
            hover:bg-muted
            rounded-md
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary/50
          "
          aria-label="Close tooltip"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="space-y-3">
          {/* Header with shield icon */}
          <div className="flex items-center gap-2 pr-6">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3
              id="tooltip-title"
              className="font-semibold text-foreground leading-tight"
            >
              {title}
            </h3>
          </div>

          {/* Message */}
          <p
            id="tooltip-description"
            className="text-xs md:text-sm text-muted-foreground leading-relaxed"
          >
            {message}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1 pt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`
                  h-1 flex-1 rounded-full transition-all duration-300
                  ${i + 1 === step ? "bg-primary" : "bg-muted"}
                `}
                aria-label={`Step ${i + 1} of ${totalSteps}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {onSkip && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSkip}
                className="flex-1 h-8 text-xs"
              >
                Skip
              </Button>
            )}
            {onNext && (
              <Button
                size="sm"
                onClick={onNext}
                className="flex-1 h-8 text-xs"
              >
                {step === totalSteps ? "Finish" : "Next"}
                {step < totalSteps && <ChevronRight className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;
