import { cn } from "@/lib/utils";
import { ShieldAlert, Lock } from "lucide-react";
import * as SimpleIcons from '@icons-pack/react-simple-icons';

interface BrandLogoProps {
    id: string;
    name: string;
    className?: string;
}

/**
 * Component that renders a brand logo from the @icons-pack/react-simple-icons package.
 * Provides a reliable, performant alternative to the Simple Icons CDN.
 */
const BrandLogo = ({ id, name, className }: BrandLogoProps) => {
    // Mapping of service IDs to SimpleIcons component names and official colors
    const brandConfig: Record<string, { icon?: string, color?: string }> = {
        tiktok: { icon: "SiTiktok", color: "000000" },
        facebook: { icon: "SiFacebook", color: "1877f2" },
        instagram: { icon: "SiInstagram", color: "e4405f" },
        twitter: { icon: "SiX", color: "000000" },
        whatsapp: { icon: "SiWhatsapp", color: "25d366" },
        snapchat: { icon: "SiSnapchat", color: "fffc00" },
        reddit: { icon: "SiReddit", color: "ff4500" },
        tumblr: { icon: "SiTumblr", color: "36465d" },
        pinterest: { icon: "SiPinterest", color: "e60023" },
        youtube: { icon: "SiYoutube", color: "ff0000" },
        netflix: { icon: "SiNetflix", color: "e50914" },
        twitch: { icon: "SiTwitch", color: "9146ff" },
        spotify: { icon: "SiSpotify", color: "1db954" },
        discord: { icon: "SiDiscord", color: "5865f2" },
        telegram: { icon: "SiTelegram", color: "26a5e4" },
        messenger: { icon: "SiMessenger", color: "0084ff" },
        signal: { icon: "SiSignal", color: "3a76f0" },
        skype: { icon: "SiSkype", color: "00aff0" },
        zoom: { icon: "SiZoom", color: "2d8cff" },
        roblox: { icon: "SiRoblox", color: "000000" },
        minecraft: { icon: "SiMinecraft", color: "62b037" },
        steam: { icon: "SiSteam", color: "000000" },
        tinder: { icon: "SiTinder", color: "fe3c72" },
        amazon: { icon: "SiAmazon", color: "ff9900" },
        ebay: { icon: "SiEbay", color: "e53238" },
        chatgpt: { icon: "SiOpenai", color: "74aa9c" },
        openai: { icon: "SiOpenai", color: "412991" },
        hulu: { icon: "SiHulu", color: "3dbb3d" },
        disneyplus: { icon: "SiDisneyplus", color: "0063e5" },
        primevideos: { icon: "SiAmazon", color: "00a8e1" },
        hbomax: { icon: "SiHbo", color: "000000" },
        xbox: { icon: "SiXbox", color: "107c10" },
        blizzard: { icon: "SiBlizzard", color: "00b4ff" },
        vk: { icon: "SiVk", color: "0077ff" },
        "9gag": { icon: "Si9gag", color: "000000" },
        bereal: { icon: "SiBereal", color: "000000" },
        mastodon: { icon: "SiMastodon", color: "6364ff" },
        dailymotion: { icon: "SiDailymotion", color: "0066ff" },
        vimeo: { icon: "SiVimeo", color: "1ab7ea" },
        imgur: { icon: "SiImgur", color: "1bb76e" },
        googlechat: { icon: "SiGooglechat", color: "00897b" },
        fortnite: { icon: "SiFortnite", color: "000000" },
        leagueoflegends: { icon: "SiLeagueoflegends", color: "0a0a0c" },
        xboxlive: { icon: "SiXbox", color: "107c10" },
        playstationnetwork: { icon: "SiPlaystation", color: "003791" },

        // Categories mapping
        social: { icon: "SiFacebook", color: "1877f2" },
        "social-networks": { icon: "SiFacebook", color: "1877f2" },
        gaming: { icon: "SiSteam", color: "000000" },
        "online-gaming": { icon: "SiSteam", color: "000000" },
        video: { icon: "SiYoutube", color: "ff0000" },
        "video-streaming": { icon: "SiYoutube", color: "ff0000" },
        messaging: { icon: "SiWhatsapp", color: "25d366" },
        ai: { icon: "SiOpenai", color: "412991" },
        dating: { icon: "SiTinder", color: "fe3c72" },
        music: { icon: "SiSpotify", color: "1db954" },
        shopping: { icon: "SiAmazon", color: "ff9900" },
        piracy: { icon: "SiBittorrent", color: "000000" },

        // Sensitive placeholders
        pornhub: { icon: "lock", color: "ffa500" },
        pornography: { icon: "lock", color: "ffa500" },
        porn: { icon: "lock", color: "ffa500" },
        adult: { icon: "lock", color: "ffa500" },
        mature: { icon: "lock", color: "ffa500" },
        gambling: { icon: "lock", color: "ff0000" },
    };

    const brand = brandConfig[id.toLowerCase()] || brandConfig[name.toLowerCase()] || {};
    const iconName = brand.icon;
    const color = brand.color;

    // Handle fallbacks for sensitive or missing icons
    const isSensitive = iconName === 'lock' || name.toLowerCase().includes('adult') || name.toLowerCase().includes('porn');
    const IconComponent = iconName && (SimpleIcons as any)[iconName];

    if (!IconComponent) {
        return (
            <div
                className={cn("bg-primary/10 rounded-md flex items-center justify-center shrink-0", className)}
                style={{ backgroundColor: color ? `#${color}20` : undefined }}
            >
                {isSensitive ? (
                    <ShieldAlert className="h-5 w-5 opacity-60" style={{ color: color ? `#${color}` : 'currentColor' }} />
                ) : (
                    <span className="text-[10px] font-bold text-primary/40 leading-none px-1 text-center truncate">
                        {name.substring(0, 2).toUpperCase()}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex-shrink-0 flex items-center justify-center transition-transform hover:scale-110", className)}>
            <IconComponent
                color={color ? `#${color}` : 'currentColor'}
                size="100%"
                className="w-full h-full"
            />
        </div>
    );
};

export default BrandLogo;
