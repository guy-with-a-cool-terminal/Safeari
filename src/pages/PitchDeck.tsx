import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, AlertTriangle, CheckCircle2, Zap, Settings, 
  BarChart3, Smartphone, CreditCard, Users, ArrowRight,
  ChevronLeft, ChevronRight, Play, Maximize2, X,
  Tablet, Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import SafeariFullLogo from "@/assets/logofull.svg";
import SafeariShieldLogo from "@/assets/favicon.svg";
import timelineImg from "@/assets/timeline.png";
import socialsImg from "@/assets/socials.png";
import safesearchImg from "@/assets/safesearch.png";
import listsImg from "@/assets/lists.png";
import categoriesImg from "@/assets/categories.png";

const SafeariIcon = ({ className }: { className?: string }) => (
  <img src={SafeariShieldLogo} alt="Safeari" className={cn("object-contain", className)} />
);

const ScreenshotsContent = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const footer = document.getElementById("pitch-footer");
    if (footer) {
      footer.style.display = selectedIndex !== null ? "none" : "flex";
    }
    return () => {
      if (footer) footer.style.display = "flex";
    };
  }, [selectedIndex]);

  const items = [
    { src: categoriesImg, caption: "Porn, gambling, dating, piracy — entire categories blocked with one toggle. You choose the risk level." },
    { src: timelineImg, caption: "Every threat blocked automatically — you see the full picture, your child sees nothing harmful." },
    { src: socialsImg, caption: "Every major app, one toggle. You choose what's allowed and what isn't." },
    { src: safesearchImg, caption: "Safe search enforced on every search engine. YouTube restricted. VPNs blocked." },
    { src: listsImg, caption: "Not in our categories? Type any URL and block it instantly. You're always in control." },
  ];

  const navigate = (direction: number) => {
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      const nextIndex = prev + direction;
      if (nextIndex < 0) return items.length - 1;
      if (nextIndex >= items.length) return 0;
      return nextIndex;
    });
  };

  return (
    <>
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
             <img src={items[selectedIndex].src} alt="Expanded view" className="max-h-[70vh] md:max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/10" />
             
             <div className="mt-8 text-center text-white max-w-2xl px-4">
                <p className="text-lg md:text-xl font-medium leading-relaxed">{items[selectedIndex].caption}</p>
             </div>
             
             {/* Modal Controls */}
             <Button variant="ghost" size="icon" className="absolute top-0 right-0 md:top-4 md:right-4 text-white hover:bg-white/20 rounded-full" onClick={() => setSelectedIndex(null)}>
                <X className="h-8 w-8" />
             </Button>
             
             <Button variant="ghost" size="icon" className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 md:h-16 md:w-16" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-8 w-8 md:h-12 md:w-12" />
             </Button>
             
             <Button variant="ghost" size="icon" className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 md:h-16 md:w-16" onClick={() => navigate(1)}>
                <ChevronRight className="h-8 w-8 md:h-12 md:w-12" />
             </Button>
          </div>
        </div>
      )}

      {/* Container: Carousel scroll on mobile, Grid on desktop */}
      <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-8 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {items.map((s, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-[85vw] md:w-auto flex flex-col gap-4 cursor-pointer snap-center group" 
            onClick={() => setSelectedIndex(i)}
          >
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 group-hover:border-primary/50 transition-all shadow-sm group-hover:shadow-md">
              <img src={s.src} alt={s.caption} className="w-full object-cover object-top aspect-[4/3] md:aspect-video md:max-h-64 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                 <div className="bg-primary text-primary-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                    <Maximize2 className="h-6 w-6" />
                 </div>
              </div>
            </div>
            <p className="text-sm md:text-base text-muted-foreground text-center px-2 line-clamp-2 md:line-clamp-none leading-relaxed font-medium">
              {s.caption}
            </p>
          </div>
        ))}
      </div>
      
      {/* Mobile Hint */}
      <div className="flex md:hidden justify-center items-center gap-2 mt-2 text-muted-foreground text-xs font-medium uppercase tracking-widest">
         <span>Swipe</span>
         <div className="flex gap-1">
            {items.map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-primary/20" />
            ))}
         </div>
      </div>
    </>
  );
};

// --- Presentation Data ---
const SLIDES = [
  {
    id: "cover",
    title: "Safeari",
    subtitle: "The internet came with their device. Safety didn't.",
    content: (
      <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-12 h-full">
        <div className="flex flex-col items-center gap-4">
          <img src={SafeariFullLogo} alt="Safeari" className="h-20 w-auto mb-4" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          The internet came with their device. Safety didn't.
        </h1>
        <p className="text-lg md:text-xl font-medium text-primary max-w-2xl">
          A parental protection tool that blocks harmful content on every device — automatically, and in a way your child can't turn off.
        </p>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
          Built in Kenya. Used by families. Starting free.
        </p>
      </div>
    )
  },
  {
    id: "audience",
    title: "Who is Safeari for?",
    subtitle: "Any parent who has ever handed a child a device.",
    content: (
      <div className="grid md:grid-cols-3 gap-6 h-full items-center">
        {[
          {
            label: "The worried parent",
            desc: "Found something disturbing in their child's browser history. Doesn't know how to stop it happening again."
          },
          {
            label: "The busy parent",
            desc: "No time to monitor every device every day. Needs protection that runs without daily supervision."
          },
          {
            label: "The school or church",
            desc: "Responsible for shared devices and WiFi. Needs one setup that protects every student, every session."
          }
        ].map((p, i) => (
          <div key={i} className="bg-card border rounded-3xl p-5 md:p-8 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow justify-center">
            <h3 className="text-xl font-bold">{p.label}</h3>
            <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    )
  },
  {
    id: "founder",
    title: "Why this exists",
    subtitle: "Built by someone who saw what happens when it doesn't.",
    content: (
      <div className="grid md:grid-cols-2 gap-12 items-center h-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Brian Njuguna</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Age 23. Nairobi.</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I've watched friends lose money they didn't have to online gambling. I've seen girls lose their sense of self-worth to content that taught them the wrong things. I watched a young man jump from a building — he had started gambling at 15, on an unrestricted phone.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            When my younger siblings got their first devices, I didn't want to just worry. I wanted to do something. I built Safeari for them first. Then I realised every Kenyan family needed it.
          </p>
          <p className="text-lg font-medium text-foreground">
            I can't solve every problem the internet creates. But if I can stop one child from going down those paths — that's worth building for.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col justify-center space-y-6 h-full">
          <p className="text-base text-muted-foreground">Have questions, want to partner, or just want to talk about what we're building?</p>
          
          <a
            href="https://wa.me/254114399034"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl hover:bg-green-500/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
              <SiWhatsapp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-foreground">WhatsApp Brian</p>
              <p className="text-sm text-muted-foreground">Tap to open a chat directly</p>
            </div>
          </a>
          
          <a
            href="mailto:support@safeari.co.ke"
            className="flex items-center gap-4 p-5 bg-card border rounded-2xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Email us</p>
              <p className="text-sm text-muted-foreground">support@safeari.co.ke</p>
            </div>
          </a>
        </div>
      </div>
    )
  },
  {
    id: "problem",
    title: "The Problem",
    subtitle: "The internet comes with every device. Safety doesn't.",
    content: (
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center h-full">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Devices are everywhere</h2>
            <p className="text-lg text-muted-foreground">Phones are cheap, data is everywhere — and your child has both. Nobody asked if the internet that came with it was safe for them.</p>
          </div>
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-5xl font-bold text-red-500 mb-2">1 in 10</p>
            <p className="text-lg text-red-400">Kenyan children have been targeted online.</p>
            <p className="text-base text-muted-foreground mt-2">Adult content, gambling, and predators — one wrong tap away.</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Current Tools Fail</h2>
            <ul className="space-y-2 text-lg text-muted-foreground">
              <li className="flex items-center gap-2">- Kids just delete the app.</li>
              <li className="flex items-center gap-2">- Switch browsers and it's gone.</li>
              <li className="flex items-center gap-2">- Router settings require an IT degree.</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
          {[
            { icon: Smartphone, label: "Phone" },
            { icon: Tablet, label: "Tablet" },
            { icon: Laptop, label: "Laptop" },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 w-full max-w-xs">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <d.icon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{d.label}</p>
                <p className="text-sm text-red-400">Unprotected by default</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "solution",
    title: "The Solution",
    subtitle: "Don't chase your child across every app. Cut it off at the source.",
    content: (
      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center h-full">
        <div className="bg-primary/5 rounded-3xl p-8 min-h-[280px] md:h-full flex items-center justify-center border border-primary/20 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
           <div className="relative z-10 text-center space-y-6">
              <SafeariIcon className="h-14 w-14 md:h-20 md:w-20 mx-auto drop-shadow-md" />
              <h3 className="text-2xl font-bold text-primary">Safeari</h3>
              <p className="text-muted-foreground text-lg leading-relaxed px-4">
                Works underneath every app, every browser, on every device — 
                so there's nothing for your child to find, delete, or trick.
              </p>
              <div className="flex flex-col gap-2 text-sm text-left mt-4 max-w-[220px] mx-auto">
                {["Android", "iPhone", "Windows", "Mac", "Home WiFi Router"].map(d => (
                  <div key={d} className="flex items-center gap-2 text-primary/80">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {d}
                  </div>
                ))}
              </div>
           </div>
        </div>
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-card border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0 flex items-center justify-center">
               <SafeariIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Stops it before it loads</h3>
              <p className="text-muted-foreground">Safeari sits between the internet and your child's device — harmful content is blocked before it ever appears on their screen.</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
               <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Nothing to delete. Nothing to trick.</h3>
              <p className="text-muted-foreground">It doesn't live on the device, so your child can't remove it, switch browsers to escape it, or use a trick to get around it.</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
               <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Every device in your home.</h3>
              <p className="text-muted-foreground">One setup covers phones, tablets, laptops — and any device that connects to your WiFi, including a friend's phone visiting.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "how-it-works",
    title: "Set up in 5 minutes. Runs forever.",
    subtitle: "No technical knowledge needed. Any device. Any network.",
    content: (
      <div className="flex flex-col justify-center h-full space-y-8 md:space-y-16">
        <div className="grid md:grid-cols-3 gap-8 relative">
           {/* Visual connection line */}
           <div className="absolute top-12 left-[16%] right-[16%] h-0.5 bg-border hidden md:block" />
           
           {[
             { step: 1, title: "Create your account", desc: "Free. No credit card. 30 seconds.", icon: Users },
             { step: 2, title: "Pick your child's age group", desc: "Young Kids, Tweens, or Teens — Safeari sets the right rules automatically.", icon: SafeariIcon },
             { step: 3, title: "Follow the guide", desc: "Simple steps for any device. Most parents are done in under 5 minutes.", icon: Smartphone }
           ].map((s) => (
             <div key={s.step} className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-lg">
                  <s.icon className="h-7 w-7 md:h-10 md:w-10 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Step {s.step}</div>
                  <h3 className="text-lg md:text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground text-lg px-4">{s.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    )
  },
  {
    id: "features",
    title: "What you're actually in control of",
    subtitle: "Everything a parent actually needs. Nothing they don't.",
    content: (
      <div className="grid md:grid-cols-2 gap-5 md:gap-8 h-full items-center">
         <div className="space-y-6">
            {[
              { title: "Block the apps that worry you", desc: "Block YouTube, TikTok, or Snapchat instantly. One toggle. Done." },
              { title: "Set a curfew for the internet", desc: "Decide when the internet turns off — like 9 PM on school nights. Automatically." },
              { title: "See what your child is doing online", desc: "A simple dashboard shows where time is spent — and what Safeari quietly blocked." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-3 md:p-5 rounded-xl hover:bg-muted/50 transition-colors">
                 <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                 <div>
                   <h3 className="text-lg font-bold">{f.title}</h3>
                   <p className="text-muted-foreground">{f.desc}</p>
                 </div>
              </div>
            ))}
         </div>
         <div className="flex flex-col justify-center gap-4 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="relative z-10 p-5 bg-card rounded-2xl border flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <SafeariIcon className="h-6 w-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold mb-1">10,000+ harmful sites blocked automatically</h3>
                <p className="text-sm text-muted-foreground">From day one. No setup required for the baseline protection.</p>
              </div>
            </div>

            <div className="relative z-10 p-5 bg-card rounded-2xl border flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold mb-1">Different rules for different children</h3>
                <p className="text-sm text-muted-foreground">Your 7-year-old and your 15-year-old don't need the same internet.</p>
              </div>
            </div>

            <div className="relative z-10 p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl border border-green-500/20 flex items-start gap-4">
               <Zap className="h-8 w-8 text-green-600 shrink-0" />
               <div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-500 mb-2">Bonus: your data lasts longer</h3>
                  <p className="text-green-800/80 dark:text-green-400/80">Because Safeari blocks ads before they download, your internet gets faster and your data bill gets smaller.</p>
               </div>
            </div>
         </div>
      </div>
    )
  },
  {
    id: "screenshots",
    title: "See it in action",
    subtitle: "Tap any screenshot to see it up close.",
    content: <ScreenshotsContent />
  },
  {
    id: "pricing",
    title: "Simple pricing. Start free.",
    subtitle: "Protecting your family costs less than one week of mobile data.",
    content: (
      <div className="flex flex-col h-full justify-center space-y-6 md:space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: "Free", price: "KES 0", desc: "Basic protection for 1 child.", highlight: false },
            { name: "Basic", price: "KES 390", desc: "Full protection + analytics for 1 child.", highlight: false },
            { name: "Family", price: "KES 780", desc: "Multiple profiles & advanced analytics.", highlight: true },
            { name: "Premium", price: "KES 1,170", desc: "Unlimited profiles & extended history.", highlight: false },
          ].map((tier) => (
            <div key={tier.name} className={cn(
              "p-4 md:p-6 rounded-2xl border flex flex-col text-center transition-transform hover:scale-105",
              tier.highlight ? "bg-primary text-primary-foreground shadow-xl ring-2 ring-primary ring-offset-2 ring-offset-background" : "bg-card"
            )}>
              <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">{tier.name}</div>
              <div className="text-2xl md:text-3xl font-bold mb-4">{tier.price}<span className="text-sm font-normal opacity-70">/mo</span></div>
              <p className={cn("text-sm", tier.highlight ? "text-primary-foreground/90" : "text-muted-foreground")}>{tier.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-muted p-6 text-center max-w-3xl mx-auto rounded-2xl">
           <p className="text-lg text-muted-foreground mb-4 font-medium">
             Most Kenyan families pay <span className="font-bold text-foreground">KES 3,000–5,000/month</span> for home fibre. Safeari's Family plan is <span className="font-bold text-primary">less than 20% of that</span> — protecting the very connection you're already paying for.
           </p>
           <div className="flex items-center justify-center gap-4">
             <CreditCard className="h-6 w-6 text-primary shrink-0" />
             <p className="text-md font-medium text-foreground">
               Payments powered natively by <span className="font-bold text-green-600">M-PESA</span>, <span className="font-bold text-red-600">Airtel Money</span>, and Card.
             </p>
           </div>
           <p className="text-sm text-muted-foreground mt-4 text-center">No contract. No credit card to start. Cancel any time.</p>
        </div>
      </div>
    )
  },
  {
    id: "moat",
    title: "Built for Kenya, not adapted for it",
    subtitle: "Designed around how you actually live.",
    content: (
      <div className="flex flex-col h-full justify-center space-y-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {[
            { title: "Pay with M-PESA or Airtel Money", desc: "No international card needed. Pay the way you already pay for everything else.", icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10" },
            { title: "Help via WhatsApp", desc: "Stuck during setup? Message us on WhatsApp. We're real people, not a ticketing system.", icon: SiWhatsapp, color: "text-green-500", bg: "bg-green-500/10" },
            { title: "We protect, we don't spy", desc: "Safeari sees which websites were visited — not your messages, not your passwords, not your private life.", icon: SafeariIcon, color: "", bg: "bg-primary/10" }
          ].map((item, i) => (
            <div key={i} className="bg-card border rounded-3xl p-5 md:p-8 h-full flex flex-col text-center hover:shadow-lg transition-shadow">
               <div className={cn("w-14 h-14 md:w-20 md:h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center", item.bg)}>
                  <item.icon className={cn("h-7 w-7 md:h-10 md:w-10", item.color)} />
               </div>
               <h3 className="text-lg md:text-2xl font-bold mb-4">{item.title}</h3>
               <p className="text-muted-foreground text-lg leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground text-base max-w-xl mx-auto">
          Compliant with Kenya's Child Online Protection Guidelines.
        </p>
      </div>
    )
  },
  {
    id: "traction",
    title: "Ready for your family today",
    subtitle: "Tested. Stable. Free to start.",
    content: (
      <div className="grid md:grid-cols-2 gap-12 items-center h-full">
         <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 min-h-[200px] flex flex-col justify-center relative overflow-hidden text-center">
            <img src={SafeariFullLogo} alt="Safeari" className="h-16 md:h-24 w-auto mx-auto mb-8" />
            <h3 className="text-xl md:text-3xl font-bold mb-4">safeari.co.ke</h3>
            <p className="text-lg text-muted-foreground">Open to anyone. Free to start. No waitlist, no waiting.</p>
         </div>
         <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold border-b pb-2">Tested across devices</h3>
              <p className="text-lg text-muted-foreground">Works on Android, iPhone, Windows, Mac, and home WiFi routers — verified across real devices before a single family was asked to use it.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold border-b pb-2">No barriers to getting started</h3>
              <p className="text-lg text-muted-foreground">No app to download, no technical setup, no credit card. If you have a device and five minutes, your child can be protected today.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold border-b pb-2">Built to scale</h3>
              <p className="text-lg text-muted-foreground">The infrastructure handles more families without slowing down — built for Kenya's scale from day one.</p>
            </div>
         </div>
      </div>
    )
  },
  {
    id: "cta",
    title: "Let's build this together",
    subtitle: "Make the internet safe for the next generation.",
    content: (
      <div className="flex flex-col items-center justify-center text-center h-full space-y-12">
         <div className="space-y-6 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              The internet isn't going anywhere. Neither is the problem.
            </h2>
            <p className="text-xl text-muted-foreground">Here's how you can be part of the solution:</p>
         </div>
         
         <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
            <div className="p-4 md:p-6 bg-card border rounded-2xl shadow-sm">
               <Users className="h-8 w-8 text-primary mb-4" />
               <h3 className="text-xl font-bold mb-2">Know a school or parents' group?</h3>
               <p className="text-muted-foreground">Help us get in front of PTAs, school admins, and church youth leaders — one introduction can protect hundreds of families.</p>
            </div>
            <div className="p-4 md:p-6 bg-card border rounded-2xl shadow-sm">
               <Zap className="h-8 w-8 text-primary mb-4" />
               <h3 className="text-xl font-bold mb-2">In telecoms, retail, or distribution?</h3>
               <p className="text-muted-foreground">Let's talk about bundling Safeari with home fibre, device sales, or data packages.</p>
            </div>
         </div>

         <div className="pt-8 flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mx-auto">
              <Button size="lg" asChild className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto">
                 <a href="https://safeari.co.ke" target="_blank" rel="noopener noreferrer">
                   Start free at safeari.co.ke <ArrowRight className="ml-2 h-5 w-5" />
                 </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-1 w-full sm:w-auto border-green-500/30 text-green-600 hover:text-green-700 hover:bg-green-500/5">
                 <a href="https://wa.me/254114399034" target="_blank" rel="noopener noreferrer">
                   <SiWhatsapp className="mr-2 h-5 w-5" /> WhatsApp Us
                 </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              or email <span className="text-primary font-medium">support@safeari.co.ke</span>
            </p>
         </div>
      </div>
    )
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none">
      
      {/* Header Controls */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:opacity-80 transition-opacity">
             <img src={SafeariFullLogo} alt="Safeari" className="h-6 w-auto" />
          </Link>
          <span className="text-muted-foreground text-sm font-medium border-l pl-3 ml-1 hidden sm:inline-block">
             Product Overview
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="hidden sm:flex text-muted-foreground hover:text-foreground">
             <Maximize2 className="h-4 w-4 mr-2" />
             {isFullscreen ? "Exit Fullscreen" : "Present"}
          </Button>
          <Button variant="ghost" size="icon" asChild className="ml-2">
             <Link to="/">
               <X className="h-5 w-5" />
             </Link>
          </Button>
        </div>
      </header>

      {/* Main Slide Area */}
      <main className="flex-1 relative flex flex-col items-center justify-start md:justify-center p-4 md:p-12 pt-12 md:pt-12 bg-gradient-to-br from-background via-background to-primary/5">
        
        {/* Slide Tracker Graphic */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50">
           {SLIDES.map((_, idx) => (
             <div 
                key={idx} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300", 
                  idx === currentSlide ? "w-8 bg-primary" : "w-1.5 bg-primary/20"
                )} 
             />
           ))}
        </div>

        {/* Slide Content Container */}
        <div 
          key={slide.id}
          className="w-full max-w-6xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24"
        >
           {/* Slide Headers (Hidden on title/cover slide) */}
           {slide.id !== "cover" && (
             <div className="mb-6 md:mb-16">
               <h1 className="text-2xl md:text-5xl font-bold tracking-tight mb-2">{slide.title}</h1>
               <p className="text-base md:text-xl text-primary font-medium">{slide.subtitle}</p>
             </div>
           )}
           
           <div className="flex-1">
             {slide.content}
           </div>
        </div>

      </main>

      {/* Navigation Footer */}
      <footer id="pitch-footer" className="sticky bottom-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-t bg-card/80 backdrop-blur z-50">
        <div className="text-sm font-medium text-muted-foreground">
           Slide {currentSlide + 1} of {SLIDES.length}
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
             variant="outline" 
             size="lg"
             onClick={prevSlide}
             disabled={currentSlide === 0}
             className="w-24 md:w-32"
          >
             <ChevronLeft className="mr-1 md:mr-2 h-4 w-4" /> <span className="text-sm md:text-base">Prev</span>
          </Button>
          <Button 
             variant="default" 
             size="lg"
             onClick={nextSlide}
             disabled={currentSlide === SLIDES.length - 1}
             className="w-24 md:w-32 bg-primary hover:bg-primary/90"
          >
             <span className="text-sm md:text-base">Next</span> <ChevronRight className="ml-1 md:ml-2 h-4 w-4" />
          </Button>
        </div>
      </footer>

    </div>
  );
}
