"use client";

import { useState } from "react";
import { X, FileText, CheckCircle2 } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface GoogleDriveImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

const loadGooglePicker = () => {
    return new Promise<void>((resolve) => {
        if ((window as any).gapi?.picker) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
            (window as any).gapi.load('picker', { callback: resolve });
        };
        document.body.appendChild(script);
    });
};

export function GoogleDriveImportWizard({ isOpen, onClose, onImportComplete }: GoogleDriveImportWizardProps) {
    const { activeProjectId } = useProject();
    const [connecting, setConnecting] = useState(false);
    const [step, setStep] = useState<"connect" | "select" | "uploading">("connect");
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConnect = async () => {
        setConnecting(true);
        setErrorMsg(null);
        try {
            const provider = new GoogleAuthProvider();
            // Use drive.file to prevent total access warning & limit access securely
            provider.addScope('https://www.googleapis.com/auth/drive.file');

            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (token) {
                setAccessToken(token);
                await loadGooglePicker();
                showPicker(token);
            } else {
                setErrorMsg("No se obtuvo el token de acceso.");
                setConnecting(false);
            }
        } catch (err: any) {
            console.error("Google Auth Error", err);
            setErrorMsg(err.message || "Error al conectar con Google Drive.");
            setConnecting(false);
        }
    };

    const showPicker = (token: string) => {
        const google = (window as any).google;
        if (!google) {
            setErrorMsg("No se pudo cargar la API de Google.");
            setConnecting(false);
            return;
        }

        const docsView = new google.picker.DocsView(google.picker.ViewId.DOCS);
        docsView.setIncludeFolders(true);
        docsView.setMimeTypes("application/vnd.google-apps.document,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        const folderView = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
        folderView.setSelectFolderEnabled(true);
        folderView.setIncludeFolders(true);

        const developerKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

        const picker = new google.picker.PickerBuilder()
            .addView(docsView)
            .addView(folderView)
            .setOAuthToken(token)
            .setDeveloperKey(developerKey)
            .setCallback(async (data: any) => {
                if (data.action === google.picker.Action.PICKED) {
                    setStep("select");
                    await processPickerSelection(data.docs, token);
                } else if (data.action === google.picker.Action.CANCEL) {
                    setConnecting(false);
                }
            })
            .build();

        picker.setVisible(true);
    };

    const processPickerSelection = async (selectedDocs: any[], token: string) => {
        setLoadingFiles(true);
        setErrorMsg(null);
        try {
            let directFiles: any[] = [];

            for (const doc of selectedDocs) {
                if (doc.mimeType === "application/vnd.google-apps.folder") {
                    // Fetch files inside the folder dynamically
                    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${doc.id}' in parents and trashed=false&fields=files(id,name,mimeType,modifiedTime)&pageSize=100`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.files) {
                        const validFiles = data.files.filter((f: any) =>
                            f.mimeType.includes("pdf") ||
                            f.mimeType.includes("text") ||
                            f.mimeType.includes("document") ||
                            f.mimeType.includes("vnd.google-apps.document")
                        );
                        directFiles = [...directFiles, ...validFiles];
                    }
                } else {
                    directFiles.push({
                        id: doc.id,
                        name: doc.name,
                        mimeType: doc.mimeType,
                        modifiedTime: doc.lastEditedUtc || new Date().toISOString()
                    });
                }
            }

            setFiles(directFiles);
        } catch (e: any) {
            console.error("Error fetching folder contents", e);
            setErrorMsg("No se pudieron resolver los archivos seleccionados.");
        }
        setLoadingFiles(false);
    };

    const handleImportAll = async () => {
        if (!accessToken || files.length === 0) return;
        setStep("uploading");
        setErrorMsg(null);

        try {
            const uid = auth.currentUser?.uid || "1";
            let importedCount = 0;

            for (const fileMeta of files) {
                try {
                    let fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileMeta.id}?alt=media`;
                    let isExport = false;

                    if (fileMeta.mimeType.includes("vnd.google-apps.document")) {
                        fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileMeta.id}/export?mimeType=text/plain`;
                        isExport = true;
                    } else if (fileMeta.mimeType.includes("vnd.google-apps")) {
                        fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileMeta.id}/export?mimeType=application/pdf`;
                        isExport = true;
                    }

                    const res = await fetch(fetchUrl, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });

                    if (!res.ok) continue;

                    const blob = await res.blob();
                    let finalName = fileMeta.name;
                    if (isExport && fileMeta.mimeType.includes("document")) finalName += ".txt";
                    else if (isExport) finalName += ".pdf";

                    const fileObj = new File([blob], finalName, { type: blob.type });

                    const formData = new FormData();
                    formData.append("file", fileObj);
                    formData.append("type", "document");
                    if (activeProjectId) formData.append("projectId", activeProjectId);
                    formData.append("userId", uid);

                    const uploadRes = await fetch("/api/extract", {
                        method: "POST",
                        body: formData,
                    });

                    if (uploadRes.ok) {
                        const extractData = await uploadRes.json();
                        const extractedText = extractData.extractedText || "";

                        await fetch("/api/sources", {
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
                        importedCount++;
                    }
                } catch (e) {
                    console.error("Fail import single file:", fileMeta.name, e);
                }
            }

            if (importedCount === 0) throw new Error("Ningún archivo pudo ser extraído con éxito.");

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
                        {step === "connect" ? "Conectar Google Drive" : "Archivos Encontrados"}
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
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Sincroniza Carpetas o Archivos</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                                Conecta tu cuenta con permiso restringido (Drive File scope). El motor solo tendrá acceso a los archivos y carpetas que tú elijas manualmente.
                            </p>

                            <button
                                onClick={handleConnect}
                                disabled={connecting}
                                className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                            >
                                {connecting ? (
                                    <><span className="material-symbols-outlined animate-spin text-[20px]">refresh</span> Abriendo Drive...</>
                                ) : (
                                    "Seleccionar Archivos de Drive"
                                )}
                            </button>
                        </div>
                    ) : step === "uploading" ? (
                        <div className="text-center py-10 flex flex-col items-center">
                            <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse mb-4">
                                <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Importando Archivos...</h3>
                            <p className="text-slate-500 text-sm">Descargando desde Drive y procesando el contexto en masa.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
                                {loadingFiles ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                                        <span className="text-sm">Analizando carpetas seleccionadas...</span>
                                    </div>
                                ) : files.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <FileText className="w-8 h-8 opacity-50" />
                                        <span className="text-sm text-center">No se encontraron archivos compatibles<br />en las carpetas o documentos seleccionados.</span>
                                    </div>
                                ) : (
                                    files.map((file, idx) => (
                                        <div
                                            key={`${file.id}-${idx}`}
                                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all bg-white border-slate-100`}
                                        >
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-500 shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate text-slate-700`}>{file.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{new Date(file.modifiedTime).toLocaleDateString()}</p>
                                            </div>
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {step === "select" && files.length > 0 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
                        <span className="text-sm text-slate-500 font-medium">
                            {files.length} archivo(s) listo(s)
                        </span>
                        <button
                            onClick={handleImportAll}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
                        >
                            Importar Todo
                            <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
