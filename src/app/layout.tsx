import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Contextualizer",
  description: "Personal Context Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans selection:bg-primary/30 relative">
        <div className="fixed inset-0 bg-noise opacity-[0.4] pointer-events-none z-50 mix-blend-overlay"></div>
        <div className="light-leak top-[-20%] left-[-10%] opacity-60 bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)]"></div>
        <div className="light-leak bottom-[-20%] right-[-10%] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)]"></div>

        <LanguageProvider>
          <UserProfileProvider>
            <ProjectProvider>
              <div className="flex h-screen w-full overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <TopBar />
                  <main className="flex-1 overflow-y-auto p-6">
                    {children}
                  </main>
                </div>
              </div>
            </ProjectProvider>
          </UserProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
