import Anthropic from "@anthropic-ai/sdk";
import { LoopsClient } from "loops";
import { NextResponse, after } from "next/server";

const ORIGINAL_PASSAGE =
  '"She had a perpetual sense, as she watched the taxi cabs, of being out, out, far out to sea and alone." — Virginia Woolf, Mrs Dalloway';

const CONSTRAINT_PROMPT =
  "Rewrite this passage so that the character's loneliness is conveyed entirely through concrete, physical detail — what the body does, what the senses register, what the world looks like. Remove every abstraction: no 'sense,' no 'feeling,' no naming of emotions. Let the reader feel the isolation only through tangible things.";

const CATEGORIES = [
  {
    key: "STRUCTURE",
    color: "#E8D78A",
    description:
      "Sentence shape, rhythm, syntactic variation, repetition. How is the prose architected on the page? Is there a discernible cadence — short/long, fragment vs. flowing?",
  },
  {
    key: "VOICE",
    color: "#A9C7E0",
    description:
      "The personality bleeding through word choice and sensibility. Is the diction precise, lyrical, restrained, ornate? Does it feel like a particular consciousness is observing?",
  },
  {
    key: "IMAGERY",
    color: "#B8D6B0",
    description:
      "Concrete sensory anchors. The constraint is to convey loneliness through the physical world — score how well the writer chose specific, tangible images instead of abstractions.",
  },
  {
    key: "PACING",
    color: "#E5B09A",
    description:
      "How time and emotional weight are distributed. Pauses, white space, where the sentence stops. Does silence land where it should?",
  },
];

const SYSTEM_PROMPT = `You are a craft analyst for ProseLab, a writing practice tool. The writer has rewritten the following passage from Virginia Woolf's *Mrs Dalloway*:

${ORIGINAL_PASSAGE}

The constraint they were given was:
"${CONSTRAINT_PROMPT}"

Your job is to grade their rewrite across four craft categories and write a short, warm, specific reflection.

The four categories are:
${CATEGORIES.map((c, i) => `${i + 1}. ${c.key} — ${c.description}`).join("\n")}

Return a JSON object with this exact structure:
{
  "scores": [
    { "category": "STRUCTURE", "score": 78, "note": "One short sentence (≤14 words) referencing something specific in their rewrite." },
    { "category": "VOICE",     "score": 62, "note": "..." },
    { "category": "IMAGERY",   "score": 91, "note": "..." },
    { "category": "PACING",    "score": 84, "note": "..." }
  ],
  "narrative": "A 3-4 sentence reflection written directly to the writer (use 'you/your'). Reference specific phrases or images from their text. Be warm, precise, and land on something that opens up the next thing they could try.",
  "headline": "A 4-8 word headline that names the dominant quality of their rewrite — e.g. 'Tender, observed, almost still.' or 'A camera that refuses to look away.'"
}

Rules:
- The score for IMAGERY should weigh whether they actually obeyed the constraint (no abstractions like 'feel', 'sense', 'lonely').
- Notes must reference the writer's actual text — do not write generic praise.
- Return ONLY the raw JSON object. Do not include markdown code blocks, backticks, or any preamble.`;

type Score = { category: string; score: number; note: string };
type Analysis = { scores: Score[]; narrative: string; headline: string };

const JSON_RESPONSE_PREFILL = "{";

function parseAnalysisResponse(rawText: string): Analysis {
  const stripFences = (value: string) =>
    value
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

  const candidates = [
    stripFences(`${JSON_RESPONSE_PREFILL}${rawText}`),
    stripFences(rawText),
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as Analysis;
    } catch {
      const firstBrace = candidate.indexOf("{");
      const lastBrace = candidate.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as Analysis;
        } catch {
          // Try the next candidate.
        }
      }
    }
  }

  throw new Error(
    `Anthropic response was not valid JSON: ${rawText.slice(0, 120)}`
  );
}

export async function POST(request: Request) {
  const { email, text } = await request.json();

  if (!email) {
    console.error("[demo] 400: missing email");
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!text) {
    console.error("[demo] 400: missing text");
    return NextResponse.json({ error: "Rewrite is required" }, { status: 400 });
  }

  after(async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

    try {
      // Upsert contact in Loops
      await loops.updateContact({
        email,
        properties: { userGroup: "Extract Demo" },
      });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Here is the writer's rewrite of the Woolf passage:\n\n${text}`,
          },
          {
            role: "assistant",
            content: JSON_RESPONSE_PREFILL,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const analysis = parseAnalysisResponse(content.text);

      const scoreSummary = analysis.scores
        .map((s) => `${s.category}: ${Math.round(s.score)}`)
        .join(" · ");

      const demoDate = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const highlights = analysis.scores
        .map((s) => {
          const category =
            s.category.charAt(0) + s.category.slice(1).toLowerCase();
          return `<li><strong>${category} — ${Math.round(s.score)}.</strong> ${s.note}</li>`;
        })
        .join("");

      await loops.sendTransactionalEmail({
        transactionalId: process.env.LOOPS_TRANSACTIONAL_ID!,
        email,
        dataVariables: {
          summary: `${analysis.headline} ${analysis.narrative}`,
          demoDate,
          highlights: `<ul>${highlights}</ul>`,
        },
      });

      console.log(`[demo] summary sent to ${email} — ${scoreSummary}`);
    } catch (err) {
      console.error(`[demo] failed for ${email}:`, err);
    }
  });

  return NextResponse.json({ data: { ok: true } });
}
