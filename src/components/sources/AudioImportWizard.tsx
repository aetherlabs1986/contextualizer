"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Check, ChevronRight, Mic, Upload, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AudioImportWizard() {
    const router = useRouter();
    const { projects, activeProjectId } = useProject();

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
                    <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary' : 'bg-secondary'}`} />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Mic className="w-5 h-5 text-accent" /> Subir o Grabar Audio</h2>
                    <p className="text-sm text-muted-foreground">Sube un archivo de audio o graba tu nota de voz ahora mismo para añadirla al contexto.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Grabar Audio */}
                        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent transition-colors">
                            {isRecording ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                                        <div className="w-8 h-8 bg-red-500 rounded-full" />
                                    </div>
                                    <p className="font-mono">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</p>
                                    <button onClick={stopRecording} className="btn-primary bg-red-600 hover:bg-red-700">
                                        Detener y Transcribir
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Mic className="w-12 h-12 text-accent mb-4" />
                                    <button onClick={startRecording} className="btn-primary w-full max-w-[200px]" disabled={isTranscribing}>
                                        Grabar ahora
                                    </button>
                                    <p className="text-xs text-muted-foreground mt-2">Usa el micrófono de tu PC/Móvil</p>
                                </>
                            )}
                        </div>

                        {/* Subir Archivo */}
                        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent transition-colors">
                            <input type="file" onChange={handleFileChange} className="hidden" id="audio-upload" accept="audio/*" disabled={isTranscribing || isRecording} />
                            <label htmlFor="audio-upload" className={`cursor-pointer flex flex-col items-center gap-4 ${(isTranscribing || isRecording) ? "opacity-50 pointer-events-none" : ""}`}>
                                <Upload className="w-12 h-12 text-muted-foreground mb-1" />
                                <span className="btn-secondary">Seleccionar archivo</span>
                                <p className="text-xs text-muted-foreground">MP3, WAV, M4A hasta 50MB.</p>
                            </label>
                        </div>
                    </div>

                    {isTranscribing && <div className="text-center p-4 bg-secondary/50 rounded-lg animate-pulse">
                        <p className="text-sm font-medium">Transcribiendo el audio con IA (Simulación V1)...</p>
                    </div>}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Settings2 className="w-5 h-5 text-accent" /> Review Transcript</h2>
                    <p className="text-sm text-muted-foreground">Review the automated transcription. Edit to fix any typos or hallucinated words.</p>

                    <textarea
                        className="w-full h-80 bg-input border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-accent"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                    />

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                        <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">Next Step <ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-lg">
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Upload className="w-5 h-5 text-accent" /> Source Metadata</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input type="text" className="input-field" value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Project Tag</label>
                            <select className="input-field" value={metadata.projectId} onChange={(e) => setMetadata({ ...metadata, projectId: e.target.value })}>
                                <option value="unassigned">Unassigned (Global)</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input type="date" className="input-field" value={metadata.date} onChange={(e) => setMetadata({ ...metadata, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Importance</label>
                                <select className="input-field" value={metadata.importance} onChange={(e) => setMetadata({ ...metadata, importance: e.target.value })}>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                        <button onClick={handleImport} disabled={isSubmitting} className="btn-primary flex items-center gap-2">
                            {isSubmitting ? "Importing..." : "Finish Import"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
