import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

// Unified configuration
const provider = process.env.LLM_PROVIDER || "google"; // google | deepseek

// Lazy-initialize clients
let _google: GoogleGenAI | null = null;
let _openai: OpenAI | null = null;

function getGoogle() {
    if (!_google) _google = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
    return _google;
}

function getDeepSeek() {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY!,
            baseURL: "https://api.deepseek.com",
        });
    }
    return _openai;
}

// Map logical model names to provider-specific names
function mapModel(model: string): string {
    if (provider === "deepseek") {
        if (model.includes("pro")) return "deepseek-reasoner";
        return "deepseek-chat";
    }
    // Default to Gemini names
    if (model === "gemini-2.5-flash") return "gemini-1.5-flash";
    if (model === "gemini-2.5-pro") return "gemini-1.5-pro";
    return model;
}

export async function generateJSON(prompt: string, model: string = "gemini-2.5-flash") {
    try {
        if (provider === "deepseek") {
            const client = getDeepSeek();
            const response = await client.chat.completions.create({
                model: mapModel(model),
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        } else {
            const ai = getGoogle();
            const result = await ai.models.generateContent({
                model: mapModel(model),
                contents: prompt,
                config: { responseMimeType: "application/json" },
            });
            return JSON.parse(result.text || "{}");
        }
    } catch (error) {
        console.error("LLM JSON Generation Error:", error);
        throw error;
    }
}

export async function generateText(prompt: string, model: string = "gemini-2.5-flash") {
    try {
        if (provider === "deepseek") {
            const client = getDeepSeek();
            const response = await client.chat.completions.create({
                model: mapModel(model),
                messages: [{ role: "user", content: prompt }],
            });
            return response.choices[0].message.content || "";
        } else {
            const ai = getGoogle();
            const result = await ai.models.generateContent({
                model: mapModel(model),
                contents: prompt,
            });
            return result.text || "";
        }
    } catch (error) {
        console.error("LLM Text Generation Error:", error);
        throw error;
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // Keep Google for embeddings as it's free/cheap and specialized
        const ai = getGoogle();
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });
        return response.embeddings?.[0]?.values || [];
    } catch (error) {
        console.error("Embedding Generation Error:", error);
        throw error;
    }
}
