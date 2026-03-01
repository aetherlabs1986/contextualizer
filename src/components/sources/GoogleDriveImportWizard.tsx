"use client";

import { useState } from "react";
import { Plus, X, Search, FileText, CheckCircle2 } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface GoogleDriveImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

export function GoogleDriveImportWizard({ isOpen, onClose, onImportComplete }: GoogleDriveImportWizardProps) {
    const { activeProjectId } = useProject();
    const [connecting, setConnecting] = useState(false);
    const [step, setStep] = useState<"connect" | "select" | "uploading">("connect");
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConnect = async () => {
        setConnecting(true);
        setErrorMsg(null);
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/drive.readonly');

            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token) {
                setAccessToken(token);
                setStep("select");
                fetchFiles(token);
            } else {
                setErrorMsg("No se obtuvo el token de acceso.");
            }
        } catch (err: any) {
            console.error("Google Auth Error", err);
            setErrorMsg(err.message || "Error al conectar con Google Drive.");
        }
        setConnecting(false);
    };

    const fetchFiles = async (token: string, query: string = "") => {
        setLoadingFiles(true);
        setErrorMsg(null);
        try {
            // Fetch docs, sheets, slides, pdfs, txts
            const q = query ? `name contains '${query}'` : "(mimeType contains 'application/vnd.google-apps' or mimeType contains 'pdf' or mimeType contains 'text/')";

            const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime)&pageSize=30&orderBy=modifiedTime desc`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (data.files) {
                setFiles(data.files);
            } else if (data.error) {
                setErrorMsg(data.error.message);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMsg("Error al obtener archivos de Drive.");
        }
        setLoadingFiles(false);
    };

    const handleImportSelected = async () => {
        if (!selectedFileId || !accessToken) return;
        setStep("uploading");
        setErrorMsg(null);

        try {
            const fileMeta = files.find(f => f.id === selectedFileId);
            if (!fileMeta) throw new Error("File metadata not found");

            let fetchUrl = `https://www.googleapis.com/drive/v3/files/${selectedFileId}?alt=media`;
            let isExport = false;

            if (fileMeta.mimeType.includes("vnd.google-apps.document")) {
                fetchUrl = `https://www.googleapis.com/drive/v3/files/${selectedFileId}/export?mimeType=text/plain`;
                isExport = true;
            } else if (fileMeta.mimeType.includes("vnd.google-apps")) {
                fetchUrl = `https://www.googleapis.com/drive/v3/files/${selectedFileId}/export?mimeType=application/pdf`;
                isExport = true;
            }

            const res = await fetch(fetchUrl, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) throw new Error(`Google API responded with ${res.status}`);

            const blob = await res.blob();
            let finalName = fileMeta.name;
            if (isExport && fileMeta.mimeType.includes("document")) finalName += ".txt";
            else if (isExport) finalName += ".pdf";

            const fileObj = new File([blob], finalName, { type: blob.type });

            const formData = new FormData();
            formData.append("file", fileObj);
            formData.append("type", "document");
            if (activeProjectId) formData.append("projectId", activeProjectId);

            const uid = auth.currentUser?.uid || "1";
            formData.append("userId", uid);

            const uploadRes = await fetch("/api/extract", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.error || "Error extrayendo texto del archivo");
            }

            const extractData = await uploadRes.json();
            const extractedText = extractData.extractedText || "";

            // Now save to sources
            const sourceRes = await fetch("/api/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_type: "document",
                    title: finalName,
                    project_id: activeProjectId || null,
                    importance: "normal",
                    extracted_text: extractedText,
                    user_id: uid
                })
            });

            if (!sourceRes.ok) {
                throw new Error("Error guardando la fuente en la base de datos");
            }

            onImportComplete();
        } catch (e: any) {
            console.error("Import error", e);
            setErrorMsg(e.message || "Fallo crítico al importar el archivo.");
            setStep("select");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {step === "connect" ? "Conectar Google Drive" : "Seleccionar Archivos de Drive"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors hover:bg-slate-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {errorMsg && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            {errorMsg}
                        </div>
                    )}

                    {step === "connect" ? (
                        <div className="text-center py-6">
                            <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <img alt="Google Drive Logo" className="size-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGG-k4juYo1cxzdDLAoDU2ZBZijFte1OG6M89s4XP5JtjhKcIdXSoHFe4CYN83MYzeKoq0xqoiOwhw8m4Bu8RCbXp8osvzEYd4IP3YOYt7LfF9lfVY-dWp4YwxV9Ry44Qyc2_p0_4YcgVE1ssuQo9737Gqy-SaDaUWVc-GGmxMFFcT5Oaxu43l5fYIwITY3uRTKMnjcw_y2KRDA-9bpVATVeQSHWHXPZX6LI1lP7DdzfQ60h64Kcqxd_xsI9FXE27HfU1M_hDz1IOl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Sincroniza tu Drive</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                                Conecta tu cuenta de Google Drive para buscar e importar documentos, PDFs y presentaciones directamente a tu motor de contexto.
                            </p>

                            <button
                                onClick={handleConnect}
                                disabled={connecting}
                                className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                            >
                                {connecting ? (
                                    <><span className="material-symbols-outlined animate-spin text-[20px]">refresh</span> Conectando...</>
                                ) : (
                                    "Conectar con Google"
                                )}
                            </button>
                        </div>
                    ) : step === "uploading" ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse mb-4">
                                <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Importando Archivo...</h3>
                            <p className="text-slate-500 text-sm">Descargando desde Drive y procesando el contexto.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div className="relative mb-4">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar en Drive..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    onChange={(e) => {
                                        if (e.target.value.length > 2 || e.target.value.length === 0) {
                                            if (accessToken) fetchFiles(accessToken, e.target.value);
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
                                {loadingFiles ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                                        <span className="text-sm">Buscando documentos...</span>
                                    </div>
                                ) : files.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <FileText className="w-8 h-8 opacity-50" />
                                        <span className="text-sm">No se encontraron archivos compatibles.</span>
                                    </div>
                                ) : (
                                    files.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => setSelectedFileId(file.id)}
                                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selectedFileId === file.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50/50'}`}
                                        >
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-500 shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${selectedFileId === file.id ? 'text-blue-900' : 'text-slate-700'}`}>{file.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{new Date(file.modifiedTime).toLocaleDateString()}</p>
                                            </div>
                                            {selectedFileId === file.id && (
                                                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {step === "select" && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                        <span className="text-sm text-slate-500 font-medium">
                            {selectedFileId ? "1 archivo seleccionado" : "Selecciona un archivo"}
                        </span>
                        <button
                            disabled={!selectedFileId}
                            onClick={handleImportSelected}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
                        >
                            Importar Seleccionado
                            <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
