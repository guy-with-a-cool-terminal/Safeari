import { Users, Settings, Smartphone, Shield, Eye, Clock, Unlock } from "lucide-react";
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
    icon: Unlock,
    title: 'Impossible to "Just Delete"',
    description: "Unlike apps kids can easily bypass or delete, Safeari protects the entire connection. Even tech-savvy kids can't just 'turn it off' to hide their activity.",
    glowColor: "from-red-500/5"
  },
  {
    icon: Shield,
    title: "One Shield, Every Device",
    description: "Protection follows your child across phones, tablets, gaming consoles, and even smart TVs. No software to install on every single gadget.",
    glowColor: "from-blue-500/5"
  },
  {
    icon: Clock,
    title: 'No more "Slow Internet" Fights',
    description: "Safeari stops harmful sites before they even start loading. It actually makes browsing faster by blocking heavy ads and trackers automatically.",
    glowColor: "from-purple-500/5"
  },
  {
    icon: Users,
    title: "Custom Protection for Each Child",
    description: "Your 7-year-old and teenager have different needs. Create separate profiles with age-appropriate presets so everyone stays safe.",
    glowColor: "from-green-500/5"
  },
  {
    icon: Eye,
    title: "Your Privacy is Non-Negotiable",
    description: "We only log domain names, never personal data or full URLs. Your family's business stays your business. We never sell your data—ever.",
    glowColor: "from-cyan-500/5"
  },
  {
    icon: Smartphone,
    title: "Protected in 5 Minutes",
    description: "Simple step-by-step guides for every device. Most parents are fully set up in one sitting. Support available via WhatsApp if you get stuck.",
    glowColor: "from-orange-500/5"
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
    image: companiesImage, // Placeholder for layout consistency
    imageAlt: "Dashboard illustrating screen time limits and schedule management",
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
    question: "Can my tech-savvy kid bypass Safeari?",
    answer: "Unlike apps kids can just delete or VPNs they use to hide, Safeari blocks those very workarounds at the internet level. While no system is 100% foolproof, Safeari's DNS-level protection is significantly harder to bypass. We even send you alerts if we detect bypass attempts."
  },
  {
    question: "How is my family's privacy protected?",
    answer: "We take privacy seriously. Safeari only logs domain names (like 'google.com'), never full URLs, personal data, or content. Your data is encrypted and we have a strict policy: we never sell your family's browsing data to third parties."
  },
  {
    question: "What's the difference between the Free and paid plans?",
    answer: "The Free plan includes our full filtering technology but is limited to 1 profile and 1 day of history. Paid plans allow for multiple child profiles (Family plan), up to 90 days of analytics, and custom blocklists. We keep the core protection free so every child can stay safe."
  },
  {
    question: "How does Safeari actually work?",
    answer: "Safeari acts as a filter for your home's internet. It stops harmful sites from even reaching your child's phone, tablet, or laptop. Because it works at the connection level, it protects every app and browser automatically—no software per device required."
  },
  {
    question: "Is it difficult to set up?",
    answer: "Not at all. Most parents finish setup in under 5 minutes. We provide clear, step-by-step guides for every device. If you're really stuck, our team is available via WhatsApp to walk you through it."
  },
  {
    question: "Will this slow down my internet?",
    answer: "Actually, it might make it faster. Safeari blocks ads and hidden trackers before they even download, which can reduce data usage and improve page load speeds. There's zero lag on your connection."
  },
  {
    question: "Can I try it before paying anything?",
    answer: "Yes! Start with our Free tier—no credit card needed. You get the same world-class protection as our paid plans. When your family grows and you need more profiles, you can upgrade anytime from your dashboard."
  },
  {
    question: "Does it work on all devices?",
    answer: "Yes! Safeari works on iOS (iPhone/iPad), Android, Windows, Mac, and even directly on your Wi-Fi router. Once set up, the protection follows your child wherever they go."
  }
];

export const FINAL_CTA_BENEFITS = [
  { text: "Free forever plan", bold: true, suffix: " with complete protection" },
  { text: "No credit card required", bold: true, suffix: " to start" },
  { text: "Setup in 5 minutes", bold: true, suffix: " with step-by-step guides" },
  { text: "Support available", bold: true, suffix: " via WhatsApp, phone, and email" }
];