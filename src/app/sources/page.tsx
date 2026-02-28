"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { getSources } from "@/app/actions";
import Link from "next/link";
import { Plus, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Source = Awaited<ReturnType<typeof getSources>>[0];

export default function SourcesPage() {
    const { activeProjectId } = useProject();
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSources = () => {
        setLoading(true);
        getSources(activeProjectId).then((res) => {
            setSources(res);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchSources();
    }, [activeProjectId]);

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case "done": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case "processing": return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
            case "queued": return <Clock className="w-4 h-4 text-slate-400" />;
            case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">Sources</h1>
                    <p className="text-text-secondary mt-1 text-sm">Manage all ingested context files, links, and chats.</p>
                </div>
                <Link href="/sources/add" className="btn-primary flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                    <Plus className="w-4 h-4" /> Add Source
                </Link>
            </div>

            <div className="soft-card p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-text-main">All Sources</h2>
                    <button onClick={fetchSources} className="text-text-secondary hover:text-text-main p-1.5 rounded-full hover:bg-slate-50 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-slate-100 rounded-xl w-full" />
                        <div className="h-16 bg-slate-100 rounded-xl w-full" />
                        <div className="h-16 bg-slate-100 rounded-xl w-full" />
                    </div>
                ) : sources.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="size-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-300">folder_open</span>
                        </div>
                        <p className="text-text-secondary">No sources added yet. Click &quot;Add Source&quot; to begin.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-text-secondary">
                                        <th className="pb-3 font-semibold">Title</th>
                                        <th className="pb-3 font-semibold">Type</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold">Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sources.map((src) => (
                                        <tr key={src.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 font-medium text-text-main max-w-[300px] truncate pr-4" title={src.title}>{src.title}</td>
                                            <td className="py-4 text-text-secondary capitalize">{src.source_type}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <StatusIcon status={src.processing_status} />
                                                    <span className="capitalize text-text-main">{src.processing_status}</span>
                                                    {src.processing_status === "failed" && (
                                                        <span className="text-xs text-red-500 font-medium" title={src.processing_error || ""}>Error</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 text-text-secondary">
                                                {formatDistanceToNow(new Date(src.created_at), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="flex flex-col gap-3 sm:hidden">
                            {sources.map((src) => (
                                <div key={src.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="text-sm font-semibold text-text-main truncate flex-1">{src.title}</p>
                                        <StatusIcon status={src.processing_status} />
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                                        <span className="capitalize bg-white px-2 py-0.5 rounded-full border border-slate-100 font-medium">{src.source_type}</span>
                                        <span className="capitalize">{src.processing_status}</span>
                                        <span className="ml-auto">{formatDistanceToNow(new Date(src.created_at), { addSuffix: true })}</span>
                                    </div>
                                    {src.processing_status === "failed" && (
                                        <p className="text-[10px] text-red-500 mt-1.5 truncate">{src.processing_error || "Processing failed"}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
