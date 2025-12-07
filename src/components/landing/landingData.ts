import { Users, Settings, Smartphone, Shield, Eye, Clock } from "lucide-react";
import SafeariIconLogo from "@/assets/favicon.svg";
import companiesImage from "@/assets/companies.png";
import kidsImage from "@/assets/3kids.jpg";
import motherAndChildImage from "@/assets/motherandchild.jpg";

export const NAV_ITEMS = [
  { id: "why", label: "Why Safeari" },
  { id: "setup", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Plans" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" }
];

export const WHY_CARDS = [
  {
    icon: Shield,
    title: "Works Everywhere, Automatically",
    description: "Protection follows your child across all devices, apps, and browsers. No software to install on every device. Set it once, protected forever.",
    glowColor: "from-blue-500/5"
  },
  {
    icon: Users,
    title: 'Impossible to "Just Turn Off"',
    description: "Unlike apps kids can delete or browsers they can switch, Safeari protects the entire internet connection. Kids can't just uninstall it. Bypass protection included.",
    glowColor: "from-green-500/5"
  },
  {
    icon: Clock,
    title: "Zero Performance Impact",
    description: "Safeari works before sites even load—no slowdowns whatsoever. Actually makes browsing faster by blocking ads and trackers before they download.",
    glowColor: "from-purple-500/5"
  },
  {
    icon: Users,
    title: "Different Kids, Different Rules",
    description: "Your 7-year-old and teenager need different protections. Create separate profiles with age-appropriate presets. No one-size-fits-all approach.",
    glowColor: "from-orange-500/5"
  },
  {
    icon: Eye,
    title: "Privacy-First Design",
    description: "We only log domain names, never full URLs or personal data. Your family's browsing stays private. No selling data to advertisers—ever.",
    glowColor: "from-red-500/5"
  },
  {
    icon: Shield,
    title: "Setup in 5 Minutes",
    description: "Simple step-by-step guides for every device. Most parents are fully protected in one sitting. Support available via WhatsApp, phone, or email if you need help.",
    glowColor: "from-cyan-500/5"
  }
];

export const SETUP_STEPS = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up in 30 seconds. No credit card required for the free plan. Start with one profile, upgrade anytime as your family grows.",
    Icon: Users,
  },
  {
    number: 2,
    title: "Choose Age-Appropriate Protection",
    description: "Select from pre-configured age presets: Young Kids (6-9), Tweens (10-12), Teens (13-17), or Young Adults (18+). Or customize every detail yourself.",
    Icon: Settings,
  },
  {
    number: 3,
    title: "Follow Simple Device Setup",
    description: "Get step-by-step instructions for your devices. Copy, paste, done. Works on phones, tablets, computers, and routers. Setup takes 3-5 minutes per device.",
    Icon: Smartphone,
  }
];

export const FEATURES = [
  {
    iconSrc: SafeariIconLogo,
    title: "Stop Inappropriate Content Cold",
    description: "Block adult sites, violence, and gambling before your kids can stumble on them. Works on every device automatically.",
    image: companiesImage,
    imageAlt: "Popular platforms and websites that can be filtered and controlled with Safeari parental controls",
    glowColor: "from-blue-500/10"
  },
  {
    Icon: Users,
    title: "Different Rules for Different Ages",
    description: "Your 7-year-old and 14-year-old don't need the same restrictions. Age presets make it simple - no guesswork.",
    image: kidsImage,
    imageAlt: "Three children of different ages using devices safely with age-appropriate Safeari protection settings",
    glowColor: "from-green-500/10"
  },
  {
    Icon: Eye,
    title: "Block TikTok, Snapchat, or YouTube With One Click",
    description: "Tired of arguing about apps? Block them completely or limit to specific times. You decide, not algorithms.",
    image: motherAndChildImage,
    imageAlt: "Mother and child using tablet together with Safeari app blocking and screen time management features",
    glowColor: "from-purple-500/10"
  },
  {
    Icon: Clock,
    title: "Smart Screen Time Management",
    description: "Set schedules for specific apps and websites. Weekends can be more flexible while school nights stay focused.",
    glowColor: "from-orange-500/10"
  }
];

export const COMPARISON_ROWS = [
  {
    feature: "Works on all apps & browsers",
    safeari: true,
    browserExt: false,
    deviceApps: true
  },
  {
    feature: "Kids can't easily bypass",
    safeari: true,
    browserExt: false,
    deviceApps: false
  },
  {
    feature: "No software per device",
    safeari: true,
    browserExt: false,
    deviceApps: false
  },
  {
    feature: "Zero performance impact",
    safeari: true,
    browserExt: true,
    deviceApps: false
  },
  {
    feature: "Works on router (whole home)",
    safeari: true,
    browserExt: false,
    deviceApps: false
  },
  {
    feature: "Protects guest devices",
    safeari: true,
    browserExt: false,
    deviceApps: false
  },
  {
    feature: "Setup time per device",
    safeari: "3-5 min",
    browserExt: "2-3 min",
    deviceApps: "10-15 min"
  }
];

export const FAQS = [
  {
    question: "How does Safeari protect my kids online?",
    answer: "Safeari blocks harmful websites before they even load on your child's device. Protection works across all apps and browsers automatically—no software to install on every device. You configure it once in your device settings, and you're protected forever."
  },
  {
    question: "Is it difficult to set up?",
    answer: "No! Setup takes just 5 minutes. We provide step-by-step instructions for every device type (phones, tablets, computers, routers). Most parents have it running in one sitting. Our support team is also available via WhatsApp, phone, or email if you need help."
  },
  {
    question: "Can my tech-savvy kid bypass Safeari?",
    answer: "Safeari includes bypass protection that blocks VPNs and proxy services kids use to get around filters. While no system is 100% foolproof, Safeari's internet-level protection is much harder to bypass than browser extensions or apps kids can just delete. We also provide alerts if bypass attempts are detected."
  },
  {
    question: "Will this slow down my internet?",
    answer: "No. Safeari works before websites even start loading, so there's zero impact on speed. Actually, it makes browsing faster because ads and trackers are blocked before they download."
  },
  {
    question: "What's the difference between the Free and paid plans?",
    answer: "The Free plan includes all core protection features but limits you to 1 profile and 1 day of analytics history. Paid plans offer multiple profiles (great for families), longer analytics retention (7-90 days), and Premium includes custom allow/deny lists for advanced control. All plans include the same filtering technology."
  },
  {
    question: "Can I try it before committing to a paid plan?",
    answer: "Absolutely! Start with our Free tier—no credit card required. You get full access to all filtering features. When you're ready to add more profiles or need longer analytics history, you can upgrade anytime from your dashboard."
  },
  {
    question: "Does Safeari work on all devices?",
    answer: "Yes! Safeari works on iOS (iPhone/iPad), Android, Windows, Mac, Linux, and even at the router level to protect your entire home network. Once configured, protection follows your child across all their devices automatically."
  },
  {
    question: "How is my family's privacy protected?",
    answer: "We take privacy seriously. Safeari only logs domain names (like 'facebook.com'), not full URLs or personal data. Analytics are encrypted and never sold to third parties. You maintain full control over your data and can export or delete it anytime."
  }
];

export const FINAL_CTA_BENEFITS = [
  { text: "Free forever plan", bold: true, suffix: " with complete protection" },
  { text: "No credit card required", bold: true, suffix: " to start" },
  { text: "Setup in 5 minutes", bold: true, suffix: " with step-by-step guides" },
  { text: "Support available", bold: true, suffix: " via WhatsApp, phone, and email" }
];