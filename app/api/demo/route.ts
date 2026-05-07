import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { NextResponse, after } from 'next/server';
import { emailLayout } from '@/lib/email-layout';

const ORIGINAL_PASSAGE =
  '"She had a perpetual sense, as she watched the taxi cabs, of being out, out, far out to sea and alone." — Virginia Woolf, Mrs Dalloway';

const CONSTRAINT_PROMPT =
  "Rewrite this passage so that the character's loneliness is conveyed entirely through concrete, physical detail — what the body does, what the senses register, what the world looks like. Remove every abstraction: no 'sense,' no 'feeling,' no naming of emotions. Let the reader feel the isolation only through tangible things.";

const CATEGORIES = [
  {
    key: 'STRUCTURE',
    color: '#E8D78A',
    description:
      'Sentence shape, rhythm, syntactic variation, repetition. How is the prose architected on the page? Is there a discernible cadence — short/long, fragment vs. flowing?',
  },
  {
    key: 'VOICE',
    color: '#A9C7E0',
    description:
      'The personality bleeding through word choice and sensibility. Is the diction precise, lyrical, restrained, ornate? Does it feel like a particular consciousness is observing?',
  },
  {
    key: 'IMAGERY',
    color: '#B8D6B0',
    description:
      'Concrete sensory anchors. The constraint is to convey loneliness through the physical world — score how well the writer chose specific, tangible images instead of abstractions.',
  },
  {
    key: 'PACING',
    color: '#E5B09A',
    description:
      'How time and emotional weight are distributed. Pauses, white space, where the sentence stops. Does silence land where it should?',
  },
];

const SYSTEM_PROMPT = `You are a craft analyst for ProseLab, a writing practice tool. The writer has rewritten the following passage from Virginia Woolf's *Mrs Dalloway*:

${ORIGINAL_PASSAGE}

The constraint they were given was:
"${CONSTRAINT_PROMPT}"

Your job is to grade their rewrite across four craft categories and write a short, warm, specific reflection.

The four categories are:
${CATEGORIES.map((c, i) => `${i + 1}. ${c.key} — ${c.description}`).join('\n')}

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
- Return ONLY the JSON object, no markdown, no code fences.`;

type Score = { category: string; score: number; note: string };
type Analysis = { scores: Score[]; narrative: string; headline: string };

const COLOR_BY_CATEGORY: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.color])
);

function buildResultsEmail(analysis: Analysis, userText: string) {
  const escapedText = userText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const rows = analysis.scores
    .map((s) => {
      const color = COLOR_BY_CATEGORY[s.category] ?? '#1a1714';
      const pct = Math.max(0, Math.min(100, Math.round(s.score)));
      return `
        <div style="margin-bottom: 22px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; letter-spacing: 0.12em; color: #1a1714;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 5px; background: ${color}; margin-right: 8px; vertical-align: middle;"></span>${s.category}
            </div>
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #5c5246;">${pct}</div>
          </div>
          <div style="height: 8px; background: rgba(26, 23, 20, 0.08);">
            <div style="height: 8px; width: ${pct}%; background: ${color}; opacity: 0.85;"></div>
          </div>
          <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.55; color: #5c5246; margin: 8px 0 0;">${s.note}</p>
        </div>
      `;
    })
    .join('');

  return emailLayout(`
    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #b84c2e; margin: 0 0 20px;">Your Demo Scorecard</p>

    <h1 style="font-size: 26px; font-weight: normal; line-height: 1.2; margin: 0 0 8px;"><em>${analysis.headline}</em></h1>
    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #888; margin: 0 0 28px;">Your rewrite of Woolf, scored across four craft categories.</p>

    <p style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 32px;">${analysis.narrative}</p>

    <hr style="border: none; border-top: 1px solid #e0d8cf; margin: 8px 0 28px;" />

    ${rows}

    <hr style="border: none; border-top: 1px solid #e0d8cf; margin: 28px 0;" />

    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #b84c2e; margin: 0 0 10px;">Your text</p>
    <blockquote style="font-family: Georgia, serif; font-style: italic; font-size: 16px; line-height: 1.7; color: #1a1714; border-left: 3px solid #b84c2e; padding-left: 16px; margin: 0 0 24px;">
      ${escapedText}
    </blockquote>

    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #b84c2e; margin: 0 0 10px;">The original</p>
    <blockquote style="font-family: Georgia, serif; font-style: italic; font-size: 16px; line-height: 1.7; color: #5c5246; border-left: 3px solid #d8cdb8; padding-left: 16px; margin: 0;">
      ${ORIGINAL_PASSAGE}
    </blockquote>
  `);
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, text } = await request.json();

  if (!email) {
    console.error('[demo] 400: missing email');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!text) {
    console.error('[demo] 400: missing text');
    return NextResponse.json({ error: 'Rewrite is required' }, { status: 400 });
  }

  const loopsRes = await fetch('https://app.loops.so/api/v1/contacts/update', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      userGroup: 'Extract Demo',
      source: 'demo',
      subscribed: true,
    }),
  });

  if (!loopsRes.ok) {
    const loopsError = await loopsRes.text().catch(() => '(no body)');
    console.error(`[demo] 400: loops contacts/update failed — status ${loopsRes.status}: ${loopsError}`);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 400 });
  }

  after(async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Here is the writer's rewrite of the Woolf passage:\n\n${text}`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const analysis = JSON.parse(content.text) as Analysis;

      await resend.emails.send({
        from: 'ProseLab <hello@email.proselab.io>',
        to: [email],
        subject: `Your Woolf rewrite — scorecard inside`,
        html: buildResultsEmail(analysis, text),
      });

      const scoreSummary = analysis.scores
        .map((s) => `${s.category}: ${Math.round(s.score)}`)
        .join(' · ');
      console.log(`Demo scorecard sent to ${email} — ${scoreSummary}`);
    } catch (err) {
      console.error(`Demo scorecard failed for ${email}:`, err);
    }
  });

  return NextResponse.json({ data: { ok: true } });
}
