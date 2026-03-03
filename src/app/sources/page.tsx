"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { getSources } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Source = Awaited<ReturnType<typeof getSources>>[0];

export default function SourcesPage() {
    const router = useRouter();
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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this source?")) return;
        try {
            await fetch(`/api/sources/${id}`, { method: 'DELETE' });
            fetchSources();
        } catch (error) {
            console.error("Failed to delete source", error);
        }
    };

    return (
        <div className="flex-grow flex justify-center py-6 sm:py-10 px-4 sm:px-12 w-full animate-in fade-in duration-500 bg-os-bg">
            <div className="flex flex-col max-w-[1200px] w-full gap-10">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sources</h1>
                        <p className="text-slate-500 mt-2 text-base">Manage the data streams that power your Personal Context Engine.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                            <input className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all" placeholder="Search connected sources..." type="text" />
                        </div>
                    </div>
                </div>

                {/* Quick Connect Grid */}
                <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        Quick Add Source
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* PDF Document Card */}
                        <div
                            onClick={() => router.push("/sources/add?type=document")}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col items-center text-center group cursor-pointer"
                        >
                            <div className="size-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-blue-500">
                                <span className="material-symbols-outlined text-4xl">description</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Document</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1 mb-4">PDFs, Word, Markdown</p>
                            <button className="mt-auto w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors">Import PDF</button>
                        </div>

                        {/* Audio Card */}
                        <div
                            onClick={() => router.push("/sources/add?type=audio")}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col items-center text-center group cursor-pointer"
                        >
                            <div className="size-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-purple-500">
                                <span className="material-symbols-outlined text-4xl">mic</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Audio File</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1 mb-4">MP3, WAV, Voice Notes</p>
                            <button className="mt-auto w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors">Upload Audio</button>
                        </div>

                        {/* Text Card */}
                        <div
                            onClick={() => router.push("/sources/add?type=text")}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col items-center text-center group cursor-pointer"
                        >
                            <div className="size-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-green-500">
                                <span className="material-symbols-outlined text-4xl">text_snippet</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Raw Text</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1 mb-4">Notes, code, text</p>
                            <button className="mt-auto w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold group-hover:bg-primary/10 group-hover:text-primary transition-colors">Write text</button>
                        </div>

                        {/* Google Drive Card */}
                        <div onClick={() => router.push("/sources/add?type=googledrive")} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col items-center text-center group cursor-pointer">
                            <div className="size-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                <img alt="Google Drive Logo" className="size-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGG-k4juYo1cxzdDLAoDU2ZBZijFte1OG6M89s4XP5JtjhKcIdXSoHFe4CYN83MYzeKoq0xqoiOwhw8m4Bu8RCbXp8osvzEYd4IP3YOYt7LfF9lfVY-dWp4YwxV9Ry44Qyc2_p0_4YcgVE1ssuQo9737Gqy-SaDaUWVc-GGmxMFFcT5Oaxu43l5fYIwITY3uRTKMnjcw_y2KRDA-9bpVATVeQSHWHXPZX6LI1lP7DdzfQ60h64Kcqxd_xsI9FXE27HfU1M_hDz1IOl" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Google Drive</h3>
                            <p className="text-orange-500 text-sm font-medium mt-1 mb-4 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">integration_instructions</span> Conectar
                            </p>
                            <button className="mt-auto w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">Manage Sync</button>
                        </div>
                    </div>
                </section>

                {/* Knowledge Base Table */}
                <section className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Your Knowledge Base</h2>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                            </button>
                            <button className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[18px]">sort</span> Sort
                            </button>
                            <button onClick={fetchSources} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[18px]">refresh</span> Reload
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Source Name</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Added Date</th>
                                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500">Loading sources...</td>
                                        </tr>
                                    ) : sources.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500">No sources found. Connect your first data stream above.</td>
                                        </tr>
                                    ) : sources.map((source) => {
                                        const isDone = source.processing_status === "done";
                                        const isFailed = source.processing_status === "failed";

                                        return (
                                            <tr key={source.id} className="group hover:bg-slate-50/80 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${source.source_type === 'audio' ? 'bg-purple-100 text-purple-600' : source.source_type === 'document' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                            <span className="material-symbols-outlined block">{source.source_type === 'audio' ? 'mic' : source.source_type === 'document' ? 'description' : 'text_snippet'}</span>
                                                        </div>
                                                        <div className="truncate max-w-[200px] sm:max-w-xs">
                                                            <p className="font-bold text-slate-900 text-sm truncate">{source.title}</p>
                                                            <p className="text-xs text-slate-500 truncate">Direct Upload</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                                                        {source.source_type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600">
                                                    {new Date(source.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`size-2 rounded-full ${isDone ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                                        <span className="text-sm font-medium text-slate-700 capitalize">{isDone ? 'Processed' : source.processing_status}</span>
                                                    </div>
                                                    {isFailed && <span className="text-xs text-red-500 block mt-1 truncate max-w-[150px]">{source.processing_error}</span>}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button onClick={() => handleDelete(source.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete Source">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

        </div>
    );
}
