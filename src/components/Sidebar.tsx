"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { name: t("nav.dashboard"), href: "/", icon: "dashboard" },
        { name: t("nav.sources"), href: "/sources", icon: "database" },
        { name: t("nav.packs"), href: "/packs", icon: "deployed_code" },
        { name: t("nav.chat"), href: "/chat", icon: "chat_bubble" },
        { name: t("nav.settings"), href: "/settings", icon: "settings" },
    ];

    return (
        <aside className="w-[72px] border-r border-white/[0.03] bg-os-bg/30 backdrop-blur-md flex-col items-center py-8 gap-8 hidden sm:flex z-40">
            <nav className="flex flex-col gap-8 w-full items-center mt-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "nav-link w-full h-12 flex items-center justify-center relative group",
                                isActive ? "active" : ""
                            )}
                            title={item.name}
                        >
                            <span className="material-symbols-outlined nav-icon text-slate-400 text-2xl group-hover:text-white transition-colors">
                                {item.icon}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto flex flex-col gap-6 w-full items-center">
                <Link href="/settings" className="w-full h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors group" title="Settings">
                    <span className="material-symbols-outlined font-light text-2xl group-hover:rotate-45 transition-transform duration-300">settings</span>
                </Link>
            </div>
        </aside>
    );
}
