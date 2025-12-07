import { ReactNode } from "react";

interface SettingsSectionProps {
  id?: string;
  title: string | React.ReactNode;
  description?: string;
  children: ReactNode;
}

/**
 * Reusable section wrapper for grouped settings
 */
const SettingsSection = ({ id, title, description, children }: SettingsSectionProps) => {
  return (
    <div id={id} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
