"use client";

import { useState, useEffect, useRef } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Send, Bot, User, Bookmark, Menu, Plus, MessageSquare, Mic, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: string[]; // IDs
    used_sources_json?: string; // from backend loading
};

type Thread = {
    id: string;
    title: string;
    updated_at: string;
};

export default function ChatPage() {
    const { activeProjectId } = useProject();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [attachingDoc, setAttachingDoc] = useState(false);

    // Dictation mechanism
    const handleDictate = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta dictado por voz.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    // Document Extractor mechanism for chat
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setAttachingDoc(true);
        const formData = new FormData();
        formData.append("file", selected);

        try {
            const res = await fetch("/api/extract", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.extractedText) {
                // Format appropriately to give LLM context
                const snippet = `[Documento Adjunto: ${selected.name}]\n"""\n${data.extractedText}\n"""\n\n`;
                setInput(prev => snippet + prev);
            } else {
                alert("Fallo al extraer texto del documento.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de red al intentar adjuntar el documento.");
        } finally {
            setAttachingDoc(false);
            e.target.value = ""; // Reset input
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [input]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Load Threads
    useEffect(() => {
        loadThreads();
    }, []);

    const loadThreads = async () => {
        try {
            const res = await fetch("/api/chat/threads");
            const data = await res.json();
            if (data.threads) setThreads(data.threads);
        } catch (e) {
            console.error("Failed to load threads", e);
        }
    };

    // Load a specific thread
    const loadThread = async (threadId: string) => {
        setActiveThreadId(threadId);
        setMessages([]);
        setLoading(true);
        if (window.innerWidth < 1024) setSidebarOpen(false);

        try {
            const res = await fetch("/api/chat/threads/" + threadId);
            const data = await res.json();
            if (data.messages) {
                const loadedMessages = data.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    sources: m.used_sources_json ? JSON.parse(m.used_sources_json) : []
                }));
                setMessages(loadedMessages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setActiveThreadId(null);
        setMessages([]);
        setInput("");
        if (window.innerWidth < 1024) setSidebarOpen(false);
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        const question = input;
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    projectId: activeProjectId,
                    threadId: activeThreadId
                })
            });
            const data = await res.json();

            // Set thread if it was newly created
            if (data.threadId && !activeThreadId) {
                setActiveThreadId(data.threadId);
                loadThreads(); // refresh list
            }

            const assistantMsg: Message = {
                id: data.messageId || (Date.now() + 1).toString(),
                role: "assistant",
                content: data.answer || "Lo siento, falló la conexión con el nodo.",
                sources: data.usedSources || []
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { id: 'error', role: "assistant", content: "Error en la red. Intenta de nuevo." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-full w-full relative overflow-hidden bg-white">

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* left Sidebar (Threads) */}
            <div className={`
                absolute lg:relative z-20 h-full w-[280px] bg-[#f9f9fb] border-r border-slate-200 
                flex flex-col transition-transform duration-300 ease-in-out shrink-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:opacity-0"}
            `}>
                <div className="p-4 flex gap-2 w-full">
                    <button
                        onClick={handleNewChat}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm rounded-lg px-3 py-2 flex items-center gap-2 font-medium text-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Chat
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 pt-4 pb-2">Chats Anteriores</p>
                    {threads.map(t => (
                        <button
                            key={t.id}
                            onClick={() => loadThread(t.id)}
                            className={`w-full text-left px-3 py-3 rounded-lg flex gap-3 items-center text-sm transition-colors ${activeThreadId === t.id ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-200/50'}`}
                        >
                            <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                            <span className="truncate">{t.title}</span>
                        </button>
                    ))}
                    {threads.length === 0 && (
                        <p className="text-xs text-slate-400 px-3 italic">No hay conversaciones previas.</p>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-white relative">

                {/* Header */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(prev => !prev)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:block transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="font-semibold text-slate-800">Contextualizer Oracle</h1>
                    </div>
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                        {activeProjectId ? "Modo: Proyecto" : "Modo: Global"}
                    </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-32 space-y-8 flex flex-col">

                        {messages.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center my-auto text-center mt-20 text-slate-500 space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800 mb-1">Entrena e Interroga a tu Cerebro.</h2>
                                    <p className="text-sm max-w-sm">Siéntete libre de instruir la IA usando lenguaje natural. Puedes pedir que cambie cómo te responde y actualizará su propio perfil en segundo plano para aprender.</p>
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} className={`flex gap-4 w-full ${m.role === 'user' ? 'justify-end' : ''}`}>

                                {/* Assistant Avatar */}
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}

                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm 
                                    ${m.role === 'user'
                                        ? 'bg-primary text-white ml-auto'
                                        : 'bg-[#f7f8fa] text-slate-800 border border-slate-100'}`}
                                >
                                    <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                                        {m.role === 'assistant' ? (
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        ) : (
                                            <div className="whitespace-pre-wrap">{m.content}</div>
                                        )}
                                    </div>

                                    {m.sources && m.sources.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] sm:text-xs flex gap-2 items-start">
                                            <Bookmark className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-80" />
                                            <div>
                                                <span className="font-semibold text-slate-500 block mb-1">Citaciones Usadas</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {m.sources.map((src, i) => (
                                                        <span key={i} className="bg-white text-slate-500 px-2 py-0.5 rounded shadow-sm border border-slate-200" title={src}>
                                                            ID-Citación {i + 1}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Avatar */}
                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-4 w-full">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-[#f7f8fa] border border-slate-100 rounded-2xl p-4 flex gap-1.5 items-center">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100" />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto w-full px-4 pb-4">
                    <div className="relative flex items-end bg-white shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                        <div className="flex flex-col gap-1 px-3 pb-3 justify-end shrink-0">
                            <label className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Adjuntar documento">
                                {attachingDoc ? (
                                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin block" />
                                ) : (
                                    <Paperclip className="w-5 h-5" />
                                )}
                                <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleFileUpload} />
                            </label>
                            <button
                                onClick={handleDictate}
                                title="Dictado por voz"
                                className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent pl-2 pr-14 py-4 text-[15px] focus:outline-none resize-none overflow-hidden max-h-[200px]"
                            placeholder="Mándale un mensaje a tu Cerebro Contextual..."
                            value={input}
                            rows={1}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-xl disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-600 hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        Si ordenas un cambio en la conducta, la IA mutará tu perfil maestro automáticamente en segundo plano.
                    </p>
                </div>
            </div>

        </div>
    );
}
