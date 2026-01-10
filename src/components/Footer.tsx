import React from 'react';
import { Link } from 'react-router-dom';
import SafeariFullLogo  from "@/assets/logofull.svg";

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
            <img src={SafeariFullLogo} alt="Safeari" className="h-6 w-auto" />
            <span className="text-sm text-muted-foreground">© 2026 Safeari. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
