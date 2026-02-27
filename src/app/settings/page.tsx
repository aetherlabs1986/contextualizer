"use client";

import { useState, useRef } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";

export default function SettingsPage() {
    const { userProfile, updateProfile } = useUserProfile();
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({ ...userProfile });

    const handleSave = () => {
        updateProfile(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setForm(prev => ({ ...prev, avatarUrl: result }));
        };
        reader.readAsDataURL(file);
    };

    const field = (label: string, key: keyof typeof form, placeholder: string, type = "text") => (
        <div>
            <label className="block text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-light text-white tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">settings</span>
                        Configuración
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Datos básicos de tu identidad. Se usan como base fija en tu perfil.</p>
                </div>
            </div>

            {/* AVATAR SECTION */}
            <div className="glass-layer rounded-[20px] p-6">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">photo_camera</span>
                    Foto de Perfil
                </h2>
                <div className="flex items-center gap-6">
                    <div
                        className="relative size-24 rounded-full overflow-hidden border-2 border-white/10 cursor-pointer group shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        {form.avatarUrl ? (
                            <img src={form.avatarUrl} alt="Avatar" className="size-full object-cover" />
                        ) : (
                            <div className="size-full bg-white/[0.03] flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-slate-600">person</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-xl">edit</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-slate-300">Haz clic en la imagen para cambiarla</p>
                        <p className="text-xs text-slate-500 mt-1">Se guarda localmente en tu navegador</p>
                    </div>
                </div>
            </div>

            {/* IDENTITY SECTION */}
            <div className="glass-layer rounded-[20px] p-6">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-accent-cyan">badge</span>
                    Identidad Base
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field("Nombre completo", "name", "Victor Torres")}
                    {field("Título / Rol", "title", "CEO & Co-Founder")}
                    {field("Ubicación", "location", "Madrid, España")}
                    {field("Edad", "age", "30")}
                    {field("Email de contacto", "email", "victor@example.com", "email")}
                </div>
                <div className="mt-4">
                    <label className="block text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Bio corta</label>
                    <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Emprendedor tech, apasionado por la IA y los productos digitales..."
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                </div>
            </div>

            {/* SOCIAL SECTION */}
            <div className="glass-layer rounded-[20px] p-6">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-accent-purple">link</span>
                    Links y Redes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field("LinkedIn", "linkedin", "https://linkedin.com/in/...")}
                    {field("Twitter / X", "twitter", "@handle")}
                    {field("Website", "website", "https://...")}
                </div>
            </div>

            {/* SAVE */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-primary text-white hover:opacity-90"
                >
                    {saved ? (
                        <>
                            <span className="material-symbols-outlined text-base">check</span>
                            Guardado
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-base">save</span>
                            Guardar Configuración
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
