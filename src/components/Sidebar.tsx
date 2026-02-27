"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Library,
    User,
    Blocks,
    MessageSquare,
    Settings
} from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/contexts/LanguageContext";

export function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { name: t("nav.dashboard"), href: "/", icon: User },
        { name: t("nav.sources"), href: "/sources", icon: Library },
        { name: t("nav.packs"), href: "/packs", icon: Blocks },
        { name: t("nav.chat"), href: "/chat", icon: MessageSquare },
        { name: t("nav.settings"), href: "/settings", icon: Settings },
    ];

    return (
        <div className="w-64 bg-panel border-r border-border h-full flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-primary">CONTEXTUALIZER</h1>
                <p className="text-xs text-muted-foreground mt-1">{t("sidebar.subtitle")}</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-secondary text-primary"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <div className="text-xs text-muted-foreground flex justify-between">
                    <span>v1.0.0</span>
                    <span>{t("sidebar.status")}</span>
                </div>
            </div>
        </div>
    );
}
