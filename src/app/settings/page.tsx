"use client";

import { useState, useRef } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";

const RESERVED_SLUGS = ["sources", "packs", "chat", "settings", "share", "api", "admin", "login", "signup", "app"];

export default function SettingsPage() {
    const { userProfile, updateProfile } = useUserProfile();
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({ ...userProfile });
    const [slugError, setSlugError] = useState("");

    const validateSlug = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-_]/g, "");
        if (sanitized !== value) {
            setSlugError("Solo letras minúsculas, números, guiones y guiones bajos.");
        } else if (RESERVED_SLUGS.includes(sanitized)) {
            setSlugError("Este nombre está reservado, elige otro.");
        } else if (sanitized.length > 0 && sanitized.length < 3) {
            setSlugError("Mínimo 3 caracteres.");
        } else {
            setSlugError("");
        }
        return sanitized;
    };

    const handleSave = () => {
        if (slugError) return;
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
            <label className="block text-[11px] text-text-secondary uppercase tracking-widest font-bold mb-1.5">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">settings</span>
                        Configuración
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">Datos básicos de tu identidad. Se usan como base fija en tu perfil.</p>
                </div>
            </div>

            {/* AVATAR */}
            <div className="soft-card p-5 sm:p-6">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">photo_camera</span>
                    Foto de Perfil
                </h2>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div
                        className="relative size-20 sm:size-24 rounded-full overflow-hidden border-4 border-white shadow-soft-xl cursor-pointer group shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        {form.avatarUrl ? (
                            <img src={form.avatarUrl} alt="Avatar" className="size-full object-cover" />
                        ) : (
                            <div className="size-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-xl">edit</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-text-main font-medium">Haz clic en la imagen para cambiarla</p>
                        <p className="text-xs text-text-secondary mt-1">Se guarda localmente en tu navegador</p>
                    </div>
                </div>
            </div>

            {/* PUBLIC SLUG */}
            <div className="soft-card p-5 sm:p-6">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-500">link</span>
                    Enlace Público
                </h2>
                <p className="text-xs text-text-secondary mb-3">Este será tu URL pública para compartir tu contexto con cualquier IA.</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-0 bg-white border border-slate-200 rounded-xl overflow-hidden w-full sm:w-auto">
                        <span className="text-xs text-text-secondary px-3 py-2.5 bg-slate-50 border-r border-slate-200 whitespace-nowrap shrink-0">
                            {typeof window !== "undefined" ? window.location.host : "dominio.com"}/
                        </span>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => {
                                const sanitized = validateSlug(e.target.value);
                                setForm({ ...form, slug: sanitized });
                            }}
                            placeholder="victortorres"
                            className="bg-transparent px-3 py-2.5 text-sm text-text-main placeholder:text-slate-400 focus:outline-none min-w-0 flex-1"
                        />
                    </div>
                </div>
                {slugError && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {slugError}
                    </p>
                )}
                {form.slug && !slugError && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Tu enlace: {typeof window !== "undefined" ? window.location.origin : ""}/<strong>{form.slug}</strong>
                    </p>
                )}
            </div>

            {/* IDENTITY */}
            <div className="soft-card p-5 sm:p-6">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-cyan-500">badge</span>
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
                    <label className="block text-[11px] text-text-secondary uppercase tracking-widest font-bold mb-1.5">Bio corta</label>
                    <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Emprendedor tech, apasionado por la IA y los productos digitales..."
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-text-main placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                </div>
            </div>

            {/* SOCIAL */}
            <div className="soft-card p-5 sm:p-6">
                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-purple-500">link</span>
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
                    disabled={!!slugError}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-primary text-white hover:opacity-90 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
