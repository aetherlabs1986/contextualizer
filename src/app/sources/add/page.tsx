"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentImportWizard } from "@/components/sources/DocumentImportWizard";
import { AudioImportWizard } from "@/components/sources/AudioImportWizard";
import { TextImportWizard } from "@/components/sources/TextImportWizard";

export default function AddSourcePage() {
    const router = useRouter();
    const [wizardState, setWizardState] = useState<"none" | "document" | "audio" | "text">("none");

    // Close any wizard and go back to selection
    const closeWizard = () => setWizardState("none");

    const onImportComplete = () => {
        router.push("/sources");
    };

    return (
        <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
            <div className="w-full max-w-[960px] flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <button onClick={() => router.push("/sources")} className="flex items-center gap-2 text-primary mb-1 hover:opacity-80 transition-opacity w-fit">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span className="text-sm font-bold uppercase tracking-wide">Back to Sources</span>
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Add Context Source</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Connect data streams to train your custom AI models.</p>
                </div>

                {/* Show selection grid if no wizard is active */}
                {wizardState === "none" && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                        {/* Section 1: Upload Files */}
                        <section className="flex flex-col gap-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">folder_open</span>
                                </div>
                                <h2 className="text-xl font-bold">Upload Files</h2>
                            </div>
                            <div
                                onClick={() => setWizardState("document")}
                                className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary transition-colors px-6 py-12 bg-background-light/50 dark:bg-background-dark/50 group cursor-pointer"
                            >
                                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-900 dark:text-white text-lg font-bold">Drag & Drop files here</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Supports PDF, CSV, TXT (Max 50MB)</p>
                                </div>
                                <button className="mt-2 h-10 px-6 rounded-lg bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold border border-border-light dark:border-border-dark shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        </section>

                        {/* Grid for Voice & Text Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Section 2: Voice & Audio */}
                            <section className="flex flex-col gap-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <span className="material-symbols-outlined">mic</span>
                                        </div>
                                        <h2 className="text-xl font-bold">Voice & Audio</h2>
                                    </div>
                                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">MP3, WAV</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-between gap-6">
                                    {/* Visualizer Placeholder */}
                                    <div className="h-24 w-full flex items-center justify-center gap-1 opacity-50">
                                        {Array.from({ length: 13 }).map((_, i) => (
                                            <div key={i} className={`w-1 bg-primary rounded-full animate-pulse ${['h-4', 'h-8', 'h-12', 'h-6', 'h-10', 'h-16'][i % 6]}`} style={{ animationDelay: `${(i % 3) * 75}ms` }}></div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setWizardState("audio")} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 font-bold text-sm">
                                            <span className="material-symbols-outlined text-lg">radio_button_checked</span>
                                            Record
                                        </button>
                                        <button onClick={() => setWizardState("audio")} className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-surface-light dark:bg-background-dark text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-border-light dark:border-border-dark font-medium text-sm">
                                            <span className="material-symbols-outlined text-lg">upload_file</span>
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Text & Links */}
                            <section className="flex flex-col gap-4 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">link</span>
                                    </div>
                                    <h2 className="text-xl font-bold">Text & Links</h2>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {/* URL Input */}
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-lg">public</span>
                                        </span>
                                        <input className="w-full h-10 pl-10 pr-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-not-allowed" disabled placeholder="https://example.com/article" type="text" />
                                        <button disabled className="absolute right-1 top-1 h-8 px-3 bg-primary text-slate-900 rounded text-xs font-bold hover:bg-blue-400 transition-colors disabled:opacity-50">Scrape</button>
                                    </div>
                                    {/* Text Area trigger */}
                                    <button
                                        onClick={() => setWizardState("text")}
                                        className="w-full h-32 rounded-lg bg-background-light dark:bg-background-dark border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary transition-colors flex flex-col items-center justify-center text-slate-500"
                                    >
                                        <span className="material-symbols-outlined text-3xl mb-2">edit_note</span>
                                        <span>Click to open Text editor</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* Render active wizard in full container */}
                {wizardState !== "none" && (
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        {wizardState === "document" && <DocumentImportWizard />}
                        {wizardState === "audio" && <div className="h-full"><AudioImportWizard /></div>}
                        {wizardState === "text" && <div className="h-full"><TextImportWizard /></div>}

                        <div className="flex justify-end gap-4 border-t border-border-light dark:border-border-dark mt-8 pt-6">
                            <button
                                onClick={closeWizard}
                                className="h-12 px-8 rounded-lg bg-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Cancel Import
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
