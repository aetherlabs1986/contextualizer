"use client";

import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Send, Bot, User, Bookmark } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: string[]; // IDs
};

export default function ChatPage() {
    const { activeProjectId } = useProject();
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: "Hi. I'm connected to your strategic context. Ask me anything about your current projects, decisions, leads, or knowledge base. I will strictly cite where I got the information." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMessage.content, projectId: activeProjectId })
            });
            const data = await res.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.answer || "Sorry, I could not process that.",
                sources: data.usedSources || []
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { id: 'error', role: "assistant", content: "An error occurred fetching the answer." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col pt-4">
            <div className="mb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Memory Chat</h1>
                    <p className="text-muted-foreground mt-1">Talk strictly to the context you provided.</p>
                </div>
                <div className="bg-panel px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                    Scope: <span className="text-foreground font-semibold uppercase">{activeProjectId ? "Project Only" : "Global"}</span>
                </div>
            </div>

            <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-xl p-4 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {m.role === 'assistant' ? (
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    ) : (
                                        m.content
                                    )}
                                </div>
                                {m.sources && m.sources.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-border/50 text-xs flex gap-2 items-start">
                                        <Bookmark className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                                        <div>
                                            <span className="font-semibold text-muted-foreground block mb-1">Citations</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {m.sources.map((src, i) => (
                                                    <span key={i} className="bg-background text-[10px] px-2 py-0.5 rounded border border-border" title={src}>
                                                        Source {i + 1}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-secondary rounded-xl p-4 flex gap-1 items-center">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-panel">
                    <div className="relative flex items-center">
                        <input
                            className="w-full bg-input border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-accent"
                            placeholder="Ask anything about your context..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 p-1.5 bg-accent text-accent-foreground rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                        AI responses are synthesized based strictly on provided context and may not cover everything.
                    </p>
                </div>
            </div>
        </div>
    );
}
