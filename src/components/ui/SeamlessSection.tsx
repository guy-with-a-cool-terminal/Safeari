import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SeamlessSectionProps {
  id?: string;
  title: string | React.ReactNode;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /**
   * If true, applies the border-y and negative margins that allow 
   * the content to bleed to the edge of the container on smaller screens.
   */
  bleeding?: boolean;
}

/**
 * Premium borderless section component.
 * Provides a "floating" layout with clean dividers and responsive spacing.
 */
const SeamlessSection = ({
  id,
  title,
  description,
  headerAction,
  children,
  className,
  contentClassName,
  bleeding = true
}: SeamlessSectionProps) => {
  return (
    <section id={id} className={cn("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90">{title}</h2>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {/* Section Content Area */}
      <div className={cn(
        "divide-y divide-border/40",
        bleeding && "border-y border-border/40 -mx-4 sm:mx-0",
        contentClassName
      )}>
        {children}
      </div>
    </section>
  );
};

export default SeamlessSection;
