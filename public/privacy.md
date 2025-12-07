# Privacy Policy

**Last Updated: November 6, 2025**

At Safeari, we take your privacy seriously. This Privacy Policy explains how we collect, use, share, and protect your information when you use our DNS-based parental control and internet filtering service.

## Understanding Our Architecture

Before diving into the details, it's important to understand how Safeari works:

**Safeari's Role**: We provide the user interface, account management, profile configuration, and analytics dashboard. We store your account information, profile settings, and filtering preferences.

**NextDNS's Role**: We integrate with NextDNS via their API, a third-party DNS service provider, to handle the actual DNS query processing and filtering. When devices use the DNS servers we configure for your profiles, those DNS queries are processed by NextDNS.

**What This Means**: There are two distinct data flows:
1. **Data we collect directly**: Account info, settings, preferences
2. **Data NextDNS collects**: DNS queries, which are governed by NextDNS's privacy policy

## 1. Information We Collect

### Information You Provide Directly

**Account Information**:
- Email address
- Name (if provided)
- Google account information (when using Google OAuth sign-in)
- Password (hashed and encrypted - we never store plain-text passwords)

**Profile Information**:
- Profile names you create (e.g., "Johnny's Devices", "Living Room TV")
- Device names and descriptions
- Age presets and content filtering preferences
- Custom allowlists and denylists
- Time restriction settings
- Security and privacy feature selections

**Subscription Information**:
- Subscription tier
- Payment information (processed by our payment provider - we do not store full credit card numbers)
- Billing history

**Support Communications**:
- Any messages, questions, or feedback you send us
- Support ticket history

### Information We Collect Automatically

**Usage Information**:
- Login times and frequency
- Features you use within the dashboard
- Settings changes you make
- Browser type and version
- Operating system
- IP address (for security and fraud prevention)

**Analytics Data**:
- Aggregated statistics about your DNS filtering effectiveness
- Number of queries blocked by category
- Top blocked domains
- Usage patterns and trends

**Cookies and Tracking**:
- Authentication tokens (stored in your browser's local storage)
- Session information
- Preference cookies

## 2. DNS Query Data (Handled by NextDNS)

**What Happens to DNS Queries**:

When you configure devices to use Safeari's DNS servers (which are actually NextDNS servers configured with your filtering rules):
- Each DNS query (e.g., "what's the IP address of example.com?") is sent to NextDNS
- NextDNS processes the query according to your Safeari settings
- NextDNS may log these queries for analytics and troubleshooting purposes

**Important Clarifications**:

- **We do not directly collect or store your DNS queries** - NextDNS handles this
- **NextDNS's Privacy Policy Applies**: DNS query data is subject to NextDNS's privacy policy (https://nextdns.io/privacy)
- **Analytics Derivation**: The analytics we show you in Safeari are derived from data provided by NextDNS
- **Data Retention**: NextDNS controls how long DNS query logs are retained (you can configure this in some NextDNS plans)

**What DNS Queries Reveal**:

DNS queries can reveal:
- What websites/services devices are attempting to access
- When devices are active online
- General browsing patterns

While DNS queries don't show:
- The specific pages visited on a website
- The content of communications
- Data transmitted over HTTPS connections

## 3. How We Use Your Information

We use the information we collect to:

**Provide the Service**:
- Create and manage your account
- Configure DNS filtering rules according to your preferences
- Display analytics and reports about internet usage
- Provide customer support

**Improve the Service**:
- Understand how users interact with Safeari
- Identify and fix bugs
- Develop new features
- Optimize performance

**Communicate with You**:
- Send service-related notifications (account changes, security alerts)
- Respond to your questions and support requests
- Send important updates about terms or features (with option to opt out of non-essential communications)

**Security and Fraud Prevention**:
- Detect and prevent unauthorized access
- Protect against abuse and malicious activity
- Comply with legal obligations

**Marketing** (with your consent):
- Send promotional emails about new features or offers
- You can opt out at any time

## 4. How We Share Your Information

We do not sell your personal information. We share information only in these limited circumstances:

**With NextDNS**:
- Profile configurations and filtering rules (so they can be applied to DNS queries)
- DNS profile identifiers
- Your DNS queries are sent to NextDNS as part of the core service

**With Service Providers**:
- Payment processors (for subscription billing)
- Email service providers (for transactional emails)
- Analytics providers (for aggregated usage statistics)
- Cloud hosting providers (we may use services like AWS, Google Cloud, etc.)

**These providers are contractually required to protect your data and use it only for the services they provide to us.**

**For Legal Reasons**:
- To comply with laws, regulations, or legal processes
- To protect rights, property, or safety of Safeari, our users, or the public
- To enforce our Terms and Conditions

**With Your Consent**:
- If you explicitly agree to share information with third parties

**Business Transfers**:
- If Safeari is acquired or merged, your information may be transferred to the new entity

## 5. Data Security

We implement industry-standard security measures to protect your information:

**Technical Safeguards**:
- Encryption of data in transit (HTTPS/TLS)
- Encryption of sensitive data at rest
- Secure password hashing (bcrypt)
- Regular security updates and patches

**Access Controls**:
- Limited employee access to personal data
- Multi-factor authentication for internal systems
- Regular security audits

**However**: No method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.

## 6. Data Retention

**Account Data**: We retain your account information and settings as long as your account is active.

**After Account Deletion**:
- Most personal data is deleted within 30 days
- Some data may be retained for legal or business purposes (e.g., billing records, support tickets)
- Anonymized data may be retained indefinitely for analytics

**DNS Query Data**: Retention is controlled by NextDNS. Refer to NextDNS's privacy policy for their retention practices.

## 7. Your Rights and Choices

You have the following rights regarding your personal information:

**Access**: Request a copy of the personal information we hold about you.

**Correction**: Update or correct inaccurate information through your account settings or by contacting us.

**Deletion**: Request deletion of your account and personal data. Some data may be retained as required by law.

**Opt-Out**: Unsubscribe from marketing emails using the link in each email or through account settings.

**Data Portability**: Request your data in a portable format.

**California Residents**: Have additional rights under the California Consumer Privacy Act (CCPA). Contact us for details.

**European Residents**: Have rights under the General Data Protection Regulation (GDPR), including the right to object to processing and lodge complaints with supervisory authorities.

**To Exercise Your Rights**: Contact us at privacy@safeari.com.

## 8. Children's Privacy

**Designed for Parental Monitoring**: Safeari is designed to be used by parents/guardians to monitor and protect children's internet access.

**Accounts Must Be Created by Adults**: You must be 18+ to create a Safeari account.

**Children's Data**: When you create profiles for children and monitor their internet usage:
- You are responsible for obtaining any required consents
- You must comply with applicable children's privacy laws (like COPPA in the US)
- DNS queries from children's devices are processed by NextDNS according to their privacy policy

**We Do Not Knowingly Collect From Children**: We do not knowingly collect personal information directly from children under 13 without verifiable parental consent.

## 9. International Data Transfers

The services we utilize (including NextDNS infrastructure and other service providers) are based in the United States. If you access our service from outside the US:
- Your information may be transferred to and processed in the US
- We comply with applicable data transfer frameworks and regulations
- By using Safeari, you consent to this transfer

## 10. Third-Party Links and Services

Our service may contain links to third-party websites or integrate with third-party services:

**We Are Not Responsible**: For the privacy practices of these third parties.

**Read Their Policies**: We encourage you to review the privacy policies of any third-party services you use.

**Key Third Parties**:
- NextDNS: https://nextdns.io/privacy
- Google (OAuth): https://policies.google.com/privacy

## 11. Open-Source Components

Safeari incorporates various open-source libraries and APIs:
- We use these in accordance with their respective licenses
- Some components may have their own data handling practices
- We vet open-source components for security and privacy considerations

## 12. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. When we do:
- We'll update the "Last Updated" date at the top
- For material changes, we'll notify you via email or dashboard notification
- Continued use of Safeari after changes constitutes acceptance of the new policy

## 13. Do Not Track

Some browsers have "Do Not Track" (DNT) features. We currently do not respond to DNT signals as there is no industry standard for compliance.

## 14. Your Consent

By using Safeari, you consent to:
- This Privacy Policy
- The collection and use of information as described
- The sharing of DNS configuration with NextDNS
- The processing of DNS queries by NextDNS

## 15. Contact Us

If you have questions about this Privacy Policy or how we handle your data:

**Email**: privacy@safeari.com
**Support**: support@safeari.com
**Mailing Address**: [Your business address]

For specific concerns about DNS query data, you may also contact NextDNS directly through their support channels.

---

## Quick Reference: Who Collects What?

| Data Type | Collected By | Purpose |
|-----------|--------------|---------|
| Email, name, account info | Safeari | Account management, authentication |
| Profile names, settings | Safeari | Service configuration |
| Payment information | Payment processor | Subscription billing |
| DNS queries | NextDNS | Filtering, analytics |
| Analytics summaries | Derived by Safeari from NextDNS data | Dashboard display |
| Usage of dashboard features | Safeari | Service improvement |

**Bottom Line**: We handle your account and preferences. NextDNS handles the actual DNS traffic. Both are committed to protecting your privacy.
