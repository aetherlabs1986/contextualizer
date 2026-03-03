"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Mic, Upload, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AudioImportWizard() {
    const router = useRouter();
    const { projects, activeProjectId } = useProject();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [transcript, setTranscript] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const [metadata, setMetadata] = useState({
        title: "",
        projectId: activeProjectId || "unassigned",
        importance: "normal",
        date: new Date().toISOString().split('T')[0]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setMetadata(prev => ({ ...prev, title: selected.name }));

        setIsTranscribing(true);

        // Simulate transcription delay
        setTimeout(() => {
            setTranscript(`[Transcripción de audio generado automáticamente de ${selected.name}]\n\n(En la versión final, aquí se usará Whisper API para transcribir el audio real. Por ahora, asumimos que este audio contiene contexto para el motor).`);
            setIsTranscribing(false);
            setStep(2);
        }, 2000);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const recordedFile = new File([blob], `Grabación-${new Date().getTime()}.webm`, { type: 'audio/webm' });

                // Stop all tracks to turn off microphone light
                stream.getTracks().forEach(track => track.stop());

                // Trigger file change mock
                setFile(recordedFile);
                setMetadata(prev => ({ ...prev, title: recordedFile.name }));
                setIsTranscribing(true);

                setTimeout(() => {
                    setTranscript(`[Transcripción de audio grabado desde el micrófono]\n\n(En la versión final, conectaremos Whisper API aquí. Por ahora, este archivo actúa como contexto).`);
                    setIsTranscribing(false);
                    setStep(2);
                }, 2000);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            // simple timer
            let time = 0;
            const interval = setInterval(() => {
                time++;
                setRecordingTime(time);
                if (!recorder.state || recorder.state === 'inactive') clearInterval(interval);
            }, 1000);
        } catch (err) {
            console.error("No se pudo acceder al micrófono:", err);
            alert("Necesitas dar permisos de micrófono para grabar.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const handleImport = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/sources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_type: "audio",
                    title: metadata.title || file?.name || "Untitled Audio",
                    project_id: metadata.projectId === "unassigned" ? null : metadata.projectId,
                    importance: metadata.importance,
                    extracted_text: transcript,
                    transcript_text: transcript,
                    user_id: user?.uid
                })
            });

            if (res.ok) router.push("/sources");
            else alert("Failed to create source");
        } catch (e) {
            console.error(e);
            alert("Error creating source");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-slate-200'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                        <span className="material-symbols-outlined text-primary">mic</span>
                        Subir o Grabar Audio
                    </h2>
                    <p className="text-sm text-slate-500">Sube un archivo de audio o graba tu nota de voz ahora mismo para añadirla al contexto.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Grabar Audio */}
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                            {isRecording ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                                        <div className="w-8 h-8 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                                    </div>
                                    <p className="font-mono text-slate-700 font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</p>
                                    <button onClick={stopRecording} className="h-10 px-6 rounded-lg bg-red-600 text-white font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors">
                                        Detener y Transcribir
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-5xl text-slate-400 mb-4">mic</span>
                                    <button onClick={startRecording} className="h-10 px-6 rounded-lg bg-primary text-white font-bold shadow-sm shadow-primary/20 hover:bg-blue-400 transition-colors w-full max-w-[200px]" disabled={isTranscribing}>
                                        Grabar ahora
                                    </button>
                                    <p className="text-xs text-slate-500 mt-2">Usa el micrófono de tu PC/Móvil</p>
                                </>
                            )}
                        </div>

                        {/* Subir Archivo */}
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                            <input type="file" onChange={handleFileChange} className="hidden" id="audio-upload" accept="audio/*" disabled={isTranscribing || isRecording} />
                            <label htmlFor="audio-upload" className={`cursor-pointer flex flex-col items-center gap-4 ${(isTranscribing || isRecording) ? "opacity-50 pointer-events-none" : ""}`}>
                                <span className="material-symbols-outlined text-5xl text-slate-400 mb-1">upload_file</span>
                                <span className="h-10 px-6 rounded-lg bg-slate-50 text-slate-900 text-sm font-bold border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors flex items-center">Seleccionar archivo</span>
                                <p className="text-xs text-slate-500">MP3, WAV, M4A hasta 50MB.</p>
                            </label>
                        </div>
                    </div>

                    {isTranscribing && (
                        <div className="text-center p-4 bg-primary-soft/50 rounded-lg animate-pulse border border-primary/20">
                            <p className="text-sm font-medium text-primary">Transcribiendo el audio con IA (Simulación V1)...</p>
                        </div>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        Revisar Transcripción
                    </h2>
                    <p className="text-sm text-slate-500">Revisa la transcripción automatizada. Puedes editarla para corregir errores.</p>

                    <textarea
                        className="w-full h-80 bg-white border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                    />

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(1)} className="h-10 px-6 rounded-lg bg-transparent border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Atrás</button>
                        <button onClick={() => setStep(3)} className="h-10 px-6 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-400 transition-colors flex items-center gap-2">Siguiente Paso <span className="material-symbols-outlined text-lg">chevron_right</span></button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-lg">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                        <span className="material-symbols-outlined text-primary">upload</span>
                        Metadatos de la Fuente
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Título</label>
                            <input type="text" className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Etiqueta de Proyecto</label>
                            <select className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.projectId} onChange={(e) => setMetadata({ ...metadata, projectId: e.target.value })}>
                                <option value="unassigned">Sin asignar (Global)</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Fecha</label>
                                <input type="date" className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.date} onChange={(e) => setMetadata({ ...metadata, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Importancia</label>
                                <select className="w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50" value={metadata.importance} onChange={(e) => setMetadata({ ...metadata, importance: e.target.value })}>
                                    <option value="low">Baja</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(2)} className="h-10 px-6 rounded-lg bg-transparent border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Atrás</button>
                        <button onClick={handleImport} disabled={isSubmitting} className="h-10 px-6 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-400 transition-colors flex items-center gap-2">
                            {isSubmitting ? "Importando..." : "Finalizar Importación"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
