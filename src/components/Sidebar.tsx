"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar() {
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
        <aside className="w-20 bg-white border-r border-slate-100 flex-col items-center py-8 gap-6 hidden sm:flex shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)] z-20">
            <nav className="flex flex-col gap-3 w-full px-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "nav-link w-full aspect-square flex items-center justify-center rounded-2xl transition-all",
                                isActive ? "active" : "text-slate-400 hover:bg-slate-50"
                            )}
                            title={item.name}
                        >
                            <span className="material-symbols-outlined nav-icon text-2xl">
                                {item.icon}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto flex flex-col gap-4 w-full items-center px-3">
                <button className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary-soft transition-colors">
                    <span className="material-symbols-outlined">help</span>
                </button>
            </div>
        </aside>
    );
}
