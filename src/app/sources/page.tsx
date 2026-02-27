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
            case "done": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "processing": return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
            case "queued": return <Clock className="w-4 h-4 text-gray-400" />;
            case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sources</h1>
                    <p className="text-muted-foreground mt-1">Manage all ingested context files, links, and chats.</p>
                </div>
                <Link href="/sources/add" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Source
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">All Sources</h2>
                    <button onClick={fetchSources} className="text-muted-foreground hover:text-foreground">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-secondary rounded w-full"></div>
                        <div className="h-10 bg-secondary rounded w-full"></div>
                        <div className="h-10 bg-secondary rounded w-full"></div>
                    </div>
                ) : sources.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No sources added yet. Click &quot;Add Source&quot; to begin.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                    <th className="pb-3 font-medium">Title</th>
                                    <th className="pb-3 font-medium">Type</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map((src) => (
                                    <tr key={src.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="py-4 font-medium max-w-[300px] truncate pr-4" title={src.title}>{src.title}</td>
                                        <td className="py-4 text-muted-foreground capitalize">{src.source_type}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon status={src.processing_status} />
                                                <span className="capitalize">{src.processing_status}</span>
                                                {src.processing_status === "failed" && (
                                                    <span className="text-xs text-red-400" title={src.processing_error || ""}>Error</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-muted-foreground">
                                            {formatDistanceToNow(new Date(src.created_at), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
