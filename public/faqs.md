# Frequently Asked Questions (FAQs)

## General Questions

### What is Safeari?

Safeari is a DNS-based internet filtering and parental control platform that helps families manage and monitor internet access across all their devices. We provide an easy-to-use dashboard where parents can configure content filtering, set time restrictions, block specific services, and view usage analytics.

### How is Safeari different from other parental control apps?

Great question! Safeari takes a fundamentally different approach:

**We're Built on Open Standards**: Unlike proprietary parental control solutions, Safeari is built on open-source APIs and DNS filtering standards. We don't use secret, black-box technology - our approach is transparent and based on proven, open technologies.

**We Integrate with NextDNS**: Instead of building our own DNS infrastructure, we integrate with NextDNS via their API, a well-established and trusted DNS service. This means you benefit from battle-tested filtering technology while using our user-friendly interface.

**No Software Installation Required**: Most parental control apps require you to install software on every device. Safeari works at the DNS level, so you just change a network setting and protection applies to all devices on that network.

**Privacy-Focused**: We collect only what's necessary to provide the service. Your DNS queries are handled by NextDNS (which has its own strong privacy policy), and we don't track or sell your data.

**Transparent About Limitations**: We're upfront that DNS filtering isn't foolproof. Tech-savvy users can bypass it. We don't make unrealistic promises - we provide a reasonable layer of protection that works for most families.

### What does "DNS-based filtering" mean?

When any device accesses the internet, it first needs to translate website names (like "google.com") into IP addresses. This translation is done by DNS (Domain Name System) servers.

DNS-based filtering works by:
1. Configuring your devices to use specific DNS servers (provided by NextDNS)
2. When a device requests a website, the DNS server checks your filtering rules
3. If the website is blocked, the DNS server refuses to provide its IP address
4. The device can't access the blocked site

**Benefits**: Works on any device, no software needed, protects entire networks.

**Limitations**: Doesn't block specific pages (only whole domains), can be bypassed by users who know how to change DNS settings.

### Do I need to install software on my devices?

No! That's one of the key advantages. You just need to:
- Configure your router's DNS settings (protects all devices on your home network), OR
- Configure DNS settings on individual devices

We provide step-by-step guides for both approaches.

## Trust and Transparency

### Why should I trust Safeari?

**Open-Source Foundation**: We're built on open-source technologies and standards. This means our approach can be independently verified and audited.

**Established Infrastructure**: We use NextDNS for DNS infrastructure - a company with a strong reputation and transparent privacy practices. We're not asking you to trust some unknown proprietary technology.

**Transparent About What We Are**: We clearly explain that we're a user interface and configuration tool for DNS filtering. We don't pretend to be more than we are.

**No Shady Data Practices**: We don't sell your data. We don't track you across the internet. We collect only what's needed to provide the service, and we're transparent about it in our Privacy Policy.

**Real Limitations**: We're honest about what DNS filtering can and can't do. We don't make exaggerated claims about perfect protection.

### What data do you collect?

We collect two types of data:

**Account Data (Collected by Safeari)**:
- Your email, name, and account settings
- Profile configurations (names, filtering preferences, time restrictions)
- Subscription and billing information
- Usage of our dashboard features

**DNS Query Data (Collected by NextDNS)**:
- When devices use the DNS servers we configure, those DNS queries go to NextDNS
- NextDNS processes these queries according to your filtering rules
- NextDNS may log queries for analytics (you can configure retention settings)
- We receive aggregated analytics from NextDNS to show in your dashboard

**We do NOT**:
- Sell your data to third parties
- Track your browsing activity outside of DNS queries
- Store your DNS queries directly (NextDNS handles this)
- Collect data from your children without your consent

See our Privacy Policy for full details.

### Is my data secure?

We implement industry-standard security measures:
- All data transmission is encrypted (HTTPS/TLS)
- Passwords are hashed using bcrypt (we never store plain-text passwords)
- Authentication tokens are securely stored
- Limited employee access to data
- Regular security updates

NextDNS also implements strong security measures for DNS traffic, including support for DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT).

### What's the relationship between Safeari and NextDNS?

**Safeari**: Provides the user interface, account management, profile configuration, and analytics dashboard. We're the "front end" that makes DNS filtering easy to use.We created this to solve the problem where non technical users/parents are unable to use platforms such as nextdns due to the technical details.

**NextDNS**: Provides the DNS infrastructure and filtering technology. They're the "back end" that actually processes DNS queries and applies your filtering rules.

**Think of it like**: Safeari is the steering wheel and dashboard of a car, while NextDNS is the engine. You use our interface to control what NextDNS does.

**Why this approach?**: Instead of building everything from scratch, we integrate with a proven DNS provider via their API. This gives you the best of both worlds: professional DNS infrastructure + a user-friendly parental control interface.

## Technical Questions

### What devices and platforms does Safeari work with?

Safeari works with any device that can use custom DNS servers, including:
- iPhones and iPads (iOS)
- Android phones and tablets
- Windows PCs
- Mac computers
- Chromebooks
- Smart TVs
- Gaming consoles (PlayStation, Xbox, Nintendo Switch)
- IoT devices

### Can I use Safeari on my home network?

Yes! The easiest way to use Safeari is to configure your router's DNS settings. This protects all devices connected to your home Wi-Fi automatically.

We provide setup guides for popular router brands.

### Can Safeari be bypassed?

Yes, we need to be honest about this. DNS filtering can be bypassed by:
- Changing DNS settings on a device to use different DNS servers
- Using a VPN that has its own DNS servers
- Accessing websites by IP address instead of domain name
- Using cellular data instead of your home Wi-Fi (if filtering is only configured on your router)

**What this means**: Safeari provides a reasonable layer of protection that works for most families. It's not a perfect solution for extremely tech-savvy teenagers who are determined to bypass it,although we are actively working on mitigating this.

**For younger children and typical use cases**, DNS filtering is very effective.

### What happens if Safeari or NextDNS goes down?

If our dashboard goes down, your filtering continues to work. The filtering rules are already configured with NextDNS, so they don't depend on Safeari being online. You just can't change settings until we're back up.

If NextDNS goes down, devices may:
- Fall back to their default DNS settings (if configured)
- Be unable to resolve domain names (if NextDNS is the only configured DNS)

NextDNS has a strong uptime record and multiple redundant servers worldwide.

### Does Safeari slow down my internet?

DNS filtering adds minimal latency - typically just a few milliseconds. You won't notice any slowdown in browsing, streaming, or gaming.

NextDNS has servers distributed globally, so DNS queries are answered quickly from a nearby location.

## Features and Usage

### What can I block with Safeari?

You can block:

**Content Categories**:
- Adult content (pornography, explicit material)
- Gambling
- Dating sites
- Drugs, alcohol, tobacco content
- Violence and weapons
- Hate speech
- Piracy and copyright infringement
- Social media (as a category)

**Specific Services**:
- TikTok
- YouTube
- Instagram
- Facebook
- Twitter/X
- Snapchat
- Discord
- Roblox
- Fortnite
- And many more

**Security Threats**:
- Malware domains
- Phishing sites
- Cryptojacking
- Newly registered domains (often used for scams)

**Trackers and Ads**:
- Ad networks
- Analytics trackers
- Third-party cookies

**Custom Lists**:
- Add specific domains to your allowlist or denylist
- Block or allow entire TLDs (like .xxx domains)

### Can I set time restrictions?

Yes! You can configure "Recreation Time" schedules for each profile. For example:
- Block social media during school hours (8 AM - 3 PM)
- Block gaming services during homework time (4 PM - 6 PM)
- Allow everything on weekends

Time-based restrictions can be applied to specific services or categories.

### Can I create different profiles for different family members?

Absolutely! This is one of Safeari's core features. You can create profiles for:
- Young children (with strict filtering)
- Teenagers (with more lenient settings)
- Parents (with no filtering)
- Guest network (with basic protection)

Each profile gets its own DNS configuration, and you can assign devices to profiles.

### How do I see what my kids are accessing online?

The Analytics Dashboard shows:
- Total queries and blocked queries
- Top blocked domains
- Queries by category
- Activity over time (hourly, daily, weekly)
- Which categories are being blocked most often

**Important**: You see what domains are being accessed, not the specific pages or content of those visits. For example, you'd see "youtube.com" but not which specific videos were watched.

### Can I temporarily disable filtering?

Yes! You can:
- Pause filtering for a specific profile
- Add domains to an allowlist (if something is blocked by mistake)
- Adjust filtering levels up or down

Changes take effect within minutes.

### What subscription tiers do you offer?

We offer multiple subscription tiers with different features and limits. See our pricing page for current details and available options.

## Getting Started

### How do I get started with Safeari?

1. **Sign up**: Create an account at safeari.com
2. **Choose a subscription**: Start with Free or pick a paid plan
3. **Create profiles**: Set up profiles for different family members
4. **Configure devices**: Follow our setup guides to point devices to your Safeari DNS servers
5. **Customize settings**: Adjust filtering rules, time restrictions, and preferences
6. **Monitor**: Check the dashboard to see analytics and activity

We provide detailed setup guides for every step.

### Do I need technical knowledge to use Safeari?

No! We've designed Safeari to be user-friendly for non-technical parents. The setup process involves:
- Following step-by-step guides
- Copy/pasting DNS server addresses
- Clicking toggles to enable/disable features

If you can change Wi-Fi settings on your phone, you can set up Safeari.

### What if I need help?

We offer:
- Comprehensive documentation and setup guides
- Email support (support@safeari.com)
- FAQ and knowledge base
- Video tutorials (coming soon)
- Priority support for paid plans

### Can I try Safeari before committing to a paid plan?

Yes! We offer a free tier that lets you test the core functionality. You can upgrade anytime if you need more features. Check our pricing page for details.

## Privacy and Safety

### Are you monitoring my family's internet activity?

**What we see**: We see aggregated analytics about DNS queries - which domains are being accessed and blocked. This is presented in your dashboard.

**What we DON'T see**: We don't see the specific pages visited, the content of communications, or any data transmitted over HTTPS connections.

**Your data**: We don't sell your data or use it for advertising. We collect only what's needed to provide the service.

**NextDNS**: DNS queries are processed by NextDNS according to their privacy policy. They have strong privacy protections and don't sell data either.

### Is Safeari compliant with privacy laws?

Yes. We comply with:
- COPPA (Children's Online Privacy Protection Act) in the US
- GDPR (General Data Protection Regulation) in Europe
- CCPA (California Consumer Privacy Act) in California

However, YOU (the parent) are responsible for:
- Ensuring you have the legal authority to monitor your children
- Complying with any applicable monitoring disclosure laws in your jurisdiction
- Informing monitored individuals as required by law

### Can my child see that they're being monitored?

If a website is blocked, they'll see a block page indicating the site is filtered. This makes it clear that filtering is active.

Whether they know you're viewing analytics depends on what you tell them. We recommend being transparent with children about monitoring, both for legal/ethical reasons and because it's more effective when kids understand the boundaries.

### What if a website is blocked by mistake?

False positives can happen with any filtering system. If a legitimate site is blocked:
1. Go to your profile settings
2. Add the domain to your custom allowlist
3. The site will be accessible within a few minutes

You can also adjust category sensitivity (e.g., make "adult content" filtering less aggressive).

## Comparison Questions

### How does Safeari compare to router-based parental controls?

**Router Built-in Controls** (like Circle, Disney Circle, etc.):
- Tied to a specific router brand
- Often require hardware purchase
- Limited to home network
- May have ongoing subscription fees

**Safeari**:
- Works with any router or device
- No hardware purchase needed
- Can protect devices outside the home (by configuring device-level DNS)
- Flexible subscription tiers including a free option
- For device level setups it works on both mobile data and wifi so your child is always protected either way

### How does Safeari compare to device-specific apps?

**Device Apps** (like Bark, Qustodio, Net Nanny):
- Require installation on every device
- May require device-specific versions
- Can monitor more detailed activity (like social media messages)
- Can take screenshots and track location
- More invasive

**Safeari**:
- No software installation needed
- Works the same on all devices
- More privacy-friendly (only monitors DNS)
- Less invasive but also less comprehensive

**Best use case**: Safeari is ideal for families who want reasonable protection without invasive monitoring software. If you need to monitor social media messages or track location, you'll need a device-specific app.

### How does Safeari compare to just using "Google SafeSearch" or "YouTube Restricted Mode"?

**SafeSearch/Restricted Mode**:
- Only works within specific services (Google, YouTube)
- Can be easily disabled
- Free
- No analytics or reporting

**Safeari**:
- Works across the entire internet
- Harder to disable (requires changing DNS settings)
- Can include SafeSearch enforcement as part of filtering
- Provides analytics and reporting
- Blocks entire sites, not just search results

**Bottom line**: SafeSearch is a starting point, but Safeari provides much more comprehensive protection.

### Can I use Safeari together with other parental control tools?

Yes! Safeari can complement other tools:
- Use Safeari for DNS-level blocking across all devices
- Use device-specific apps for detailed monitoring on phones/tablets
- Use screen time controls built into iOS/Android
- Use router controls for additional features

Just be aware that multiple filtering layers might occasionally conflict or create confusing behavior.

## Troubleshooting

### A website isn't being blocked even though I enabled the category.

Possible reasons:
- DNS settings on the device might not be configured correctly
- The device might be using a VPN or alternate DNS
- The website might not be categorized in our blocklists (you can add it manually)
- Changes can take a few minutes to propagate

Try:
1. Verify DNS settings on the device
2. Add the specific domain to your custom denylist
3. Contact support if issues persist

### My child says a school website is blocked.

Education sites are occasionally miscategorized. To fix:
1. Add the domain to your custom allowlist
2. Let us know so we can improve our categorization

We prioritize fixing false positives for educational content.

### How do I know if DNS filtering is working?

1. Check the Analytics Dashboard - you should see query data
2. Try accessing a site you've blocked - it should show a block page
3. Try accessing a safe site - it should work normally

We provide a test tool in the dashboard to verify filtering is active.

## Contact and Support

### How do I contact support?

- **Email**: support@safeari.com
- **Knowledge Base**: [Your documentation URL]
- **Response time**: Typically within 24 hours (faster for paid plans)

### Where can I find setup guides?

Setup guides are available in your dashboard under "Setup" or "Help". We provide guides for:
- Popular router brands
- iOS devices
- Android devices
- Windows PCs
- Macs
- Gaming consoles

### Can I request new features?

Absolutely! We love user feedback. Email us at support@safeari.com with your suggestions.

### Is there a community forum?

We're working on building a community! For now, reach out via email or follow us on social media for updates and tips.

---

## Still Have Questions?

If your question wasn't answered here, please contact us at support@safeari.com. We're here to help!

**Remember**: Safeari is a tool to assist with parental controls, but it's not a substitute for open communication with your children about internet safety. Technology works best when combined with education and trust.
