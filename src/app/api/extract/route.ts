import { NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let extractedText = "";

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            // Use require to bypass Next.js ESM default export issues
            const pdfParse = require("pdf-parse");
            const data = await pdfParse(buffer);
            extractedText = data.text;
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
            extractedText = buffer.toString("utf-8");
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        // Clean up excessive whitespace
        extractedText = extractedText.replace(/\n{3,}/g, '\n\n').trim();

        return NextResponse.json({ success: true, extractedText });

    } catch (error) {
        console.error("Extraction error", error);
        return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
    }
}
