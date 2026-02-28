"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useLanguage } from "@/contexts/LanguageContext";

export function MobileNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { name: t("nav.dashboard"), href: "/", icon: "space_dashboard" },
        { name: t("nav.sources"), href: "/sources", icon: "folder_open" },
        { name: t("nav.packs"), href: "/packs", icon: "deployed_code" },
        { name: t("nav.chat"), href: "/chat", icon: "chat_bubble" },
        { name: t("nav.settings"), href: "/settings", icon: "settings" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden items-center justify-around bg-white/90 backdrop-blur-xl border-t border-slate-100 px-2 py-1 safe-area-bottom shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px] relative",
                            isActive
                                ? "text-primary"
                                : "text-slate-400 active:text-slate-600"
                        )}
                    >
                        <span
                            className={clsx(
                                "material-symbols-outlined text-[22px] transition-all"
                            )}
                            style={{
                                fontVariationSettings: isActive
                                    ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                                    : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                            }}
                        >
                            {item.icon}
                        </span>
                        <span className={clsx(
                            "text-[9px] font-semibold tracking-wide truncate max-w-[60px]",
                            isActive ? "text-primary" : "text-slate-400"
                        )}>
                            {item.name}
                        </span>
                        {isActive && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
