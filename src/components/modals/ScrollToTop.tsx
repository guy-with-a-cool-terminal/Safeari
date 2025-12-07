import React, { useEffect, useState } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showDownArrow, setShowDownArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Show scroll to top after 300px scroll
      setIsVisible(scrolled > 300);

      // Hide down arrow after user starts scrolling
      setShowDownArrow(scrolled < 100);

      // Calculate scroll progress (0 to 1)
      const totalScroll = docHeight - windowHeight;
      const progress = scrolled / totalScroll;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    handleScroll(); // Run on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate color based on progress (gamification)
  const getProgressColor = () => {
    if (scrollProgress < 0.25) return "#ef4444"; // red-500 - just started
    if (scrollProgress < 0.5) return "#f59e0b"; // amber-500 - getting there
    if (scrollProgress < 0.75) return "#3b82f6"; // blue-500 - halfway
    return "#10b981"; // green-500 - almost done!
  };

  const progressColor = getProgressColor();
  const circumference = 2 * Math.PI * 16; // r=16
  const offset = circumference - (scrollProgress * circumference);

  return (
    <>
      {/* Down Arrow - Only on large screens when at top */}
      {showDownArrow && (
        <div className="hidden lg:block fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">Scroll to explore</p>
            <div className="flex flex-col gap-1">
              <ChevronDown className="h-6 w-6 text-primary opacity-75" />
              <ChevronDown className="h-6 w-6 text-primary opacity-50 -mt-3" />
              <ChevronDown className="h-6 w-6 text-primary opacity-25 -mt-3" />
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button with Progress Circle */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-background/95 backdrop-blur-md border-2 border-border/60 shadow-2xl hover:shadow-primary/20 hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center justify-center"
          aria-label="Scroll to top"
          style={{
            boxShadow: `0 0 20px ${progressColor}40, 0 10px 25px -5px rgba(0,0,0,0.1)`
          }}
        >
          {/* Background circle (empty state) */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-muted/20"
            />
          </svg>

          {/* Progress circle (fills as you scroll) */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={progressColor}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 0 4px ${progressColor})`
              }}
            />
          </svg>

          {/* Progress percentage text (small, shows commitment) */}
          {scrollProgress > 0.1 && (
            <span
              className="absolute text-[10px] font-bold bottom-0 right-0 bg-background rounded-full w-5 h-5 flex items-center justify-center border border-border/60"
              style={{ color: progressColor }}
            >
              {Math.round(scrollProgress * 100)}
            </span>
          )}

          {/* Arrow icon */}
          <ArrowUp
            className="h-5 w-5 md:h-6 md:w-6 relative z-10 group-hover:scale-110 transition-transform duration-200"
            style={{ color: progressColor }}
          />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
