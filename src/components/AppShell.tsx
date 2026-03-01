"use client";

import { usePathname } from "next/navigation";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";

import { AuthProvider } from "@/contexts/AuthContext";

const APP_ROUTES = ["/", "/sources", "/packs", "/chat", "/settings", "/share", "/cv"];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isAppRoute = APP_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Public pages (e.g., /victortorres) - render without app shell
    if (!isAppRoute) {
        return (
            <AuthProvider>
                <LanguageProvider>
                    <UserProfileProvider>
                        {children}
                    </UserProfileProvider>
                </LanguageProvider>
            </AuthProvider>
        );
    }

    // App pages - render with full shell
    return (
        <AuthProvider>
            <LanguageProvider>
                <UserProfileProvider>
                    <ProjectProvider>
                        <div className="flex h-screen w-full overflow-hidden bg-os-bg">
                            <Sidebar />
                            <div className="flex-1 flex flex-col min-w-0">
                                <TopBar />
                                <main className={`flex-1 ${pathname.startsWith("/chat") ? "overflow-hidden flex flex-col p-0 pb-[56px] sm:pb-0" : "overflow-y-auto p-4 sm:p-6 lg:p-10 pb-[72px] sm:pb-6"} bg-os-bg relative`}>
                                    {children}
                                </main>
                            </div>
                            <MobileNav />
                        </div>
                    </ProjectProvider>
                </UserProfileProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
