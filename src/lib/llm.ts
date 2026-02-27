import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Generic wrapper for JSON generation
export async function generateJSON(prompt: string, model: string = "gemini-2.5-pro") {
    try {
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
