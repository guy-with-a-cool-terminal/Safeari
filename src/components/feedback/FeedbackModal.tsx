import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Send } from "lucide-react";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { useProfile } from "@/contexts/ProfileContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Feedback Modal Component
 *
 * Features:
 * - FormBold integration for feedback submission
 * - Auto-captures user context (tier, profile, page)
 * - WhatsApp community link for urgent help
 * - Success state after submission
 */
export const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { currentProfile } = useProfile();
  const { subscription } = useSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create form data with user context
    const formData = new FormData();
    formData.append("category", category);
    formData.append("message", message);
    if (urgency) formData.append("urgency", urgency);
    if (email) formData.append("email", email);

    // Auto-capture context
    formData.append("user_context", JSON.stringify({
      tier: subscription?.tier || "unknown",
      profile: currentProfile?.display_name || "none",
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    }));

    try {
      await fetch("https://formbold.com/s/3dkxG", {
        method: "POST",
        body: formData,
      });

      setIsSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setCategory("");
        setMessage("");
        setUrgency("");
        setEmail("");
        setIsSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Feedback submission failed:", error);
      // Optionally show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setCategory("");
    setMessage("");
    setUrgency("");
    setEmail("");
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          // Success state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Thanks for your feedback!</DialogTitle>
            <DialogDescription className="text-base">
              We read every message and use your feedback to make Safeari better for families.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Send Us Feedback</DialogTitle>
              <DialogDescription>
                Let us know what's working, what's not, or what you'd like to see. Your input helps us protect families better.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  What's this about? <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Something's broken</SelectItem>
                    <SelectItem value="feature">Feature request</SelectItem>
                    <SelectItem value="confusing">Confusing/unclear</SelectItem>
                    <SelectItem value="general">General feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">
                  Tell us more <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Be as detailed as you like. Screenshots, steps to reproduce, or just your thoughts - it all helps."
                  className="min-h-[120px] resize-y"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We automatically include your subscription tier and current profile to help us understand the context.
                </p>
              </div>

              {/* Urgency (optional) */}
              <div className="space-y-2">
                <Label htmlFor="urgency">How urgent is this? (optional)</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Not urgent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Just a thought</SelectItem>
                    <SelectItem value="medium">Annoying but manageable</SelectItem>
                    <SelectItem value="high">Blocking me from using Safeari</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email (optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Your email (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  We'll only use this to follow up on your feedback if needed.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !category || !message}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>

            {/* WhatsApp CTA */}
            <div className="mt-6 pt-6 border-t">
              <WhatsAppCTA variant="dashboard" />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
