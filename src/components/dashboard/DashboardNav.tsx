import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick?: () => void;
}

interface DashboardNavProps {
  items: NavItem[];
  onFeedbackClick?: () => void;
}

const DashboardNav = ({ items, onFeedbackClick }: DashboardNavProps) => {
  return (
    <nav className="flex-1 p-4 space-y-2 flex flex-col">
      <div className="space-y-2 flex-1">
        {items.map((item) => {
          // Special handling for Help & Feedback
          if (item.href === "#feedback") {
            return (
              <button
                key={item.href}
                onClick={onFeedbackClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left",
                  "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          }

          // Regular nav link
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardNav;
