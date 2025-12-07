import { MessageCircle, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WhatsAppCTAProps {
  variant: "landing" | "dashboard";
}

// Shared WhatsApp community link
export const WHATSAPP_LINK = "https://chat.whatsapp.com/HsoqV59zRYB4LPs3bUbc7K";

/**
 * WhatsApp Community CTA Component
 *
 * Reusable component that adapts messaging based on context:
 * - landing: Social proof for potential customers
 * - dashboard: Support-focused for active users
 */
export const WhatsAppCTA = ({ variant }: WhatsAppCTAProps) => {

  if (variant === "landing") {
    return (
      <Card className="border-2 border-green-500/30 bg-green-600/5 dark:bg-green-500/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Join Our Parent Community</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Connect with other parents using Safeari. Share tips, ask questions, and learn how families are protecting their kids online.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto flex-shrink-0"
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Join WhatsApp Group
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dashboard variant - more compact, support-focused
  return (
    <Card className="border-2 border-green-500/30 bg-green-600/5 dark:bg-green-500/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Need Instant Help?</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Join our WhatsApp community for quick support from other parents and our team.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-2 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-500/10"
            >
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Join WhatsApp Community
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
