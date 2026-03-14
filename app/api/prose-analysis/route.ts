import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { NextResponse, after } from 'next/server';
import { emailLayout } from '@/lib/email-layout';

const AUTHORS = [
  { name: 'Virginia Woolf', traits: 'Stream of consciousness, interior monologue, fluid sentence structure, lyrical prose, deep psychological interiority' },
  { name: 'Ernest Hemingway', traits: 'Terse declarative sentences, iceberg theory, understated emotion, sparse dialogue, stripped-back prose' },
  { name: 'Toni Morrison', traits: 'Mythic weight, poetic rhythm, fractured chronology, oral tradition cadences, moral gravity' },
  { name: 'Raymond Carver', traits: 'Minimalism, working-class settings, unresolved tension, flat affect, precise surface detail' },
  { name: 'Joan Didion', traits: 'Cool observational clarity, precise detail, fragmented structure, emotional restraint, California noir sensibility' },
  { name: 'Gabriel García Márquez', traits: 'Magical realism, sprawling multi-generational scope, lush sensory detail, matter-of-fact surrealism, epic sentence length' },
  { name: 'Sylvia Plath', traits: 'Confessional intensity, violent metaphor, visceral body imagery, controlled rage, dark lyrical precision' },
  { name: 'James Baldwin', traits: 'Moral urgency, long flowing sentences, sermonic rhythm, emotional directness, unflinching social truth' },
  { name: 'Franz Kafka', traits: 'Absurdist bureaucratic dread, flat matter-of-fact tone describing surreal events, claustrophobic interiority, alienation' },
  { name: 'Flannery O\'Connor', traits: 'Southern gothic, grotesque characters, dark comedy, sudden violence, religious undertones, sharp dialogue' },
  { name: 'Cormac McCarthy', traits: 'Biblical cadence, no quotation marks, landscape as character, stark violence, archaic diction, long unpunctuated passages' },
  { name: 'Zadie Smith', traits: 'Multicultural polyphony, comic warmth, essayistic digressions, code-switching between registers, social observation' },
  { name: 'Haruki Murakami', traits: 'Dreamy surrealism, loneliness, mundane domestic detail alongside the uncanny, flat affectless narration, pop culture references' },
  { name: 'Chimamanda Ngozi Adichie', traits: 'Precise social observation, dual cultural perspective, restrained emotion, domestic detail as political commentary, clear direct prose' },
  { name: 'Leo Tolstoy', traits: 'Panoramic social realism, deep psychological penetration, moral seriousness, sweeping scope with intimate detail, omniscient authority' },
  { name: 'Ottessa Moshfegh', traits: 'Disaffected first-person narrators, dark humour, bodily disgust, detached clinical tone, transgressive honesty' },
  { name: 'Jorge Luis Borges', traits: 'Intellectual puzzles, labyrinthine structure, philosophical compression, erudite allusion, infinity and mirrors' },
  { name: 'Ocean Vuong', traits: 'Lyrical fragments, body and tenderness, immigrant experience, poetic compression in prose, sensory vulnerability' },
  { name: 'Denis Johnson', traits: 'Hallucinatory realism, damaged narrators, jump-cut pacing, raw spiritual yearning beneath chaos, short urgent sentences' },
  { name: 'Elena Ferrante', traits: 'Obsessive female interiority, class anxiety, volatile relationships, Naples as character, unsparing self-examination' },
];

const SYSTEM_PROMPT = `You are a literary analyst for ProseLab, a writing practice tool. You compare a user's writing sample against 20 renowned authors to identify stylistic similarities.

Here are the 20 authors and their signature traits:

${AUTHORS.map((a, i) => `${i + 1}. ${a.name} — ${a.traits}`).join('\n')}

Analyze the user's writing and return a JSON object with this exact structure:
{
  "primary": {
    "author": "Author Name",
    "traits": ["trait 1", "trait 2", "trait 3"]
  },
  "secondary": {
    "author": "Author Name",
    "traits": ["trait 1", "trait 2"]
  },
  "narrative": "A 3-4 sentence analysis written directly to the writer (use 'you/your'). Explain what specific qualities in their writing evoke the primary author. Be warm, specific, and encouraging — reference actual details from their text. End with something that makes them curious to explore this further."
}

Rules:
- primary and secondary must be different authors from the list above
- traits should be specific to what you observed in their writing, not generic
- The narrative should feel personal and insightful, not formulaic
- Keep traits to short phrases (2-5 words each)
- Return ONLY the JSON object, no markdown, no code fences`;

function buildResultsEmail(analysis: { primary: { author: string; traits: string[] }; secondary: { author: string; traits: string[] }; narrative: string }) {
  const primaryTraits = analysis.primary.traits.map(t => `<li style="padding: 4px 0; color: #444;">${t}</li>`).join('');
  const secondaryTraits = analysis.secondary.traits.map(t => `<li style="padding: 4px 0; color: #444;">${t}</li>`).join('');

  return emailLayout(`
    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #b84c2e; margin: 0 0 24px;">Your Prose Analysis</p>

    <h1 style="font-size: 28px; font-weight: normal; margin: 0 0 8px;">You write like <em>${analysis.primary.author}</em></h1>
    <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #888; margin: 0 0 32px;">with traces of ${analysis.secondary.author}</p>

    <p style="font-size: 16px; line-height: 1.8; color: #333; margin: 0 0 32px;">${analysis.narrative}</p>

    <hr style="border: none; border-top: 1px solid #e0d8cf; margin: 32px 0;" />

    <h2 style="font-size: 16px; font-weight: normal; color: #b84c2e; margin: 0 0 12px;">Primary match &mdash; ${analysis.primary.author}</h2>
    <ul style="list-style: none; padding: 0; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
      ${primaryTraits}
    </ul>

    <h2 style="font-size: 16px; font-weight: normal; color: #b84c2e; margin: 0 0 12px;">Secondary match &mdash; ${analysis.secondary.author}</h2>
    <ul style="list-style: none; padding: 0; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      ${secondaryTraits}
    </ul>
  `);
}

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, text, prompt } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: 'Writing sample is required' }, { status: 400 });
  }

  // Add contact to the waitlist segment (fast — do this before returning)
  const { error: contactError } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: process.env.RESEND_SEGMENT_ID! }],
  });

  if (contactError) {
    if (!contactError.message?.includes('already exists')) {
      return NextResponse.json({ error: 'Failed to submit' }, { status: 400 });
    }
  }

  // Run Claude analysis + email delivery in the background after response is sent
  after(async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Here is the writing prompt they responded to:\n"${prompt}"\n\nHere is their writing:\n\n${text}`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const analysis = JSON.parse(content.text);

      // Send results email to user
      await resend.emails.send({
        from: 'ProseLab <hello@email.proselab.io>',
        to: [email],
        subject: `You write like ${analysis.primary.author}`,
        html: buildResultsEmail(analysis),
      });

      // Admin notification
      const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      await resend.emails.send({
        from: 'ProseLab <hello@email.proselab.io>',
        to: ['contact@proselab.io'],
        subject: `Prose analysis: ${email} → ${analysis.primary.author}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
            <h2 style="font-size: 18px; margin-bottom: 16px;">Prose analysis completed</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Primary match:</strong> ${analysis.primary.author}</p>
            <p><strong>Secondary match:</strong> ${analysis.secondary.author}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <blockquote style="font-style: italic; border-left: 3px solid #b84c2e; padding-left: 16px; margin: 16px 0; color: #444; line-height: 1.8;">
              ${escapedText}
            </blockquote>
          </div>
        `,
      });

      console.log(`Prose analysis sent to ${email} — matched ${analysis.primary.author}`);
    } catch (err) {
      console.error(`Prose analysis failed for ${email}:`, err);
    }
  });

  // Return immediately — user sees "check your inbox" right away
  return NextResponse.json({ data: { ok: true } });
}
