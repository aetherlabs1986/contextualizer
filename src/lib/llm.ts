import { GoogleGenAI } from "@google/genai";

// Lazy-initialize the Google GenAI SDK (avoids crash during Vercel build when env vars aren't available)
let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    if (!_ai) {
        _ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });
    }
    return _ai;
}

// Generic wrapper for JSON generation
export async function generateJSON(prompt: string, model: string = "gemini-2.5-pro") {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (error) {
        console.error("LLM JSON Generation Error:", error);
        throw error;
    }
}

// Generic wrapper for text generation
export async function generateText(prompt: string, model: string = "gemini-2.5-flash") {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text || "";
    } catch (error) {
        console.error("LLM Text Generation Error:", error);
        throw error;
    }
}

// Wrapper for Embeddings
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const ai = getAI();
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
