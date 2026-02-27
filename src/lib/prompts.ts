import { prisma } from "./db";

const DEFAULT_PROMPTS: Record<string, string> = {
    INSIGHT_EXTRACT_V1: `
Extract structured insights from the following text block.
You MUST output valid JSON only, matching this exact schema:

{
  "source_id": "{{source_id}}",
  "project_tag": "{{project_tag}}",
  "extracted_at": "{{today}}",
  "decisions": [
    {
      "decision": "...",
      "rationale": "...",
      "impact": "...",
      "date_inferred": "...ISO or null",
      "evidence_quotes": ["...<=25 words", "..."],
      "confidence": 0.0,
      "entities": { "people":[], "companies":[], "tools":[], "urls":[] }
    }
  ],
  "leads": [
    {
      "name_or_company": "...",
      "context": "...",
      "stage": "idea|contacting|negotiation|closed|unknown",
      "next_action": "...",
      "last_mentioned_date": "...ISO or null",
      "evidence_quotes": ["...<=25 words"],
      "confidence": 0.0,
      "entities": { "people":[], "companies":[], "tools":[], "urls":[] }
    }
  ],
  "knowledge": [
    {
      "topic": "...",
      "what_learned": "...",
      "implications": "...",
      "date_inferred": "...ISO or null",
      "evidence_quotes": ["...<=25 words"],
      "confidence": 0.0,
      "entities": { "people":[], "companies":[], "tools":[], "urls":[] }
    }
  ],
  "risks_unknowns": [
    {
      "risk": "...",
      "why_it_matters": "...",
      "mitigation": "...",
      "date_inferred": "...ISO or null",
      "evidence_quotes": ["...<=25 words"],
      "confidence": 0.0,
      "entities": { "people":[], "companies":[], "tools":[], "urls":[] }
    }
  ],
  "tasks_next_steps": [
    {
      "task": "...",
      "owner": "user",
      "due_date": "...ISO or null",
      "priority": "low|normal|high|critical",
      "evidence_quotes": ["...<=25 words"],
      "confidence": 0.0
    }
  ],
  "strategic_shifts": [
    {
      "shift": "...",
      "from": "...",
      "to": "...",
      "reason": "...",
      "date_inferred": "...ISO or null",
      "evidence_quotes": ["...<=25 words"],
      "confidence": 0.0
    }
  ],
  "personal_context": [
    {
      "fact": "...",
      "category": "bio|preferences|constraints|values|style",
      "date_inferred": "...ISO or null",
      "evidence_quotes": ["...<=25 words"],
      "confidence": 0.0
    }
  ]
}

- Extract only what is explicitly supported by the text.
- If unsure, lower confidence and include evidence quote.
- If an item is implied but not stated, do NOT extract it.
- Keep lists short: max 10 items per category.

SOURCE TEXT:
Title: {{source_title}}
Date: {{source_date}}
Type: {{source_type}}

{{extracted_text}}
`,
    PROFILE_MERGE_V1: `
You are updating a strategic Profile incrementally.
Inputs:
- Previous Profile JSON
- New Insights JSON extracted from a recent source
- Source Date and ID

Output MUST be valid JSON ONLY matching the profile schema exactly:

{
  "identity_snapshot": { "summary":"", "roles":[], "strengths":[], "tools":[] },
  "projects": [
    { "name":"", "status":"active|dormant|critical", "goals":[], "current_focus":"", "next_steps":[], "blockers":[], "recent_updates":[], "last_mentioned_at":"", "source_ids":[] }
  ],
  "strategic_direction": { "north_star":"", "current_focus":"", "why_now":"", "constraints":[], "source_ids":[] },
  "leads_pipeline": [
    { "name":"", "company":"", "stage":"", "next_action":"", "notes":"", "last_mentioned_at":"", "source_ids":[] }
  ],
  "recent_decisions": [
    { "decision":"", "rationale":"", "impact":"", "date":"", "source_ids":[] }
  ],
  "knowledge_updates": [
    { "topic":"", "summary":"", "implications":"", "date":"", "source_ids":[] }
  ],
  "risks_unknowns": [
    { "risk":"", "why":"", "mitigation":"", "date":"", "source_ids":[] }
  ],
  "communication_style": { "tone":"", "preferences_do":[], "avoid":[], "language":"es" },
  "last_updated_at":"{{today}}"
}

Merge rules:
- Recency: updates from newer sources override older items when conflicting.
- Deduplicate by semantic similarity.
- Always append source_id {{source_id}} to the updated item’s source_ids list.
- Keep only latest 20 decisions, 20 knowledge items, 20 risks, 30 leads.
- Projects: if a project_tag exists, ensure a project entry exists/updated.
- Never invent new facts; if fields are missing, keep previous values.

PREVIOUS PROFILE:
{{previous_profile}}

NEW INSIGHTS:
{{new_insights}}
`,
    RERANK_CHUNKS_V1: `
Given the user question, select up to 5 chunks that best answer it.

Output JSON ONLY:
{
  "selected": [
    { "chunk_id":"...", "reason":"..." }
  ]
}

Rules:
- Select up to 5 chunks that best answer the question.
- Prefer recent sources when question implies "current/latest".
- If none are relevant, return empty selected list.

Question: {{user_question}}

Candidate Chunks:
{{candidate_chunks}}
`,
    ANSWER_WITH_CITATIONS_V1: `
System: you are a strategic assistant.

Context: retrieved chunks + profile
{{profile_snapshot}}

Retrieved Chunks:
{{selected_chunks}}

Rules:
- Default output Spanish (es-ES).
- Every non-trivial claim must be supported by at least one selected chunk.
- If not supported, explicitly say: "No consta en tus fuentes actuales."
- No long quoting. Max 2 short quotes total, each <= 25 words.
- Include citations in-line using brackets exactly like this format: [Source: {source_title} — {source_date} | id:{source_id}]
- If user asks for "latest status", summarize changes found in most recent sources first, then answer.
- Output a "Used sources:" list at the end.

User Question: {{user_question}}
`
};

export async function getPromptTemplate(templateName: string, userId: string = "default-user"): Promise<string> {
    const custom = await prisma.prompts.findUnique({
        where: { template_name: templateName }
    });

    if (custom && custom.prompt_text) {
        return custom.prompt_text;
    }

    return DEFAULT_PROMPTS[templateName] || "";
}

export function fillPrompt(template: string, vars: Record<string, string>): string {
    let filled = template;
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        filled = filled.replace(regex, value);
    }
    return filled;
}
