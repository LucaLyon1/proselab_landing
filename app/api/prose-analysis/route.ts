import Anthropic from '@anthropic-ai/sdk';
import { LoopsClient } from 'loops';
import { NextResponse, after } from 'next/server';

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

export async function POST(request: Request) {
  const { email, text, prompt } = await request.json();

  if (!email) {
    console.error('[prose-analysis] 400: missing email');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!text) {
    console.error('[prose-analysis] 400: missing text');
    return NextResponse.json({ error: 'Writing sample is required' }, { status: 400 });
  }

  after(async () => {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

    try {
      // Upsert contact in Loops
      await loops.updateContact({ email, properties: { userGroup: 'Prose Analysis' } });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
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

      await loops.sendTransactionalEmail({
        transactionalId: process.env.LOOPS_TRANSACTIONAL_ID!,
        email,
        dataVariables: {
          primaryAuthor: analysis.primary.author,
          secondaryAuthor: analysis.secondary.author,
          narrative: analysis.narrative,
          primaryTraits: analysis.primary.traits.join(', '),
          secondaryTraits: analysis.secondary.traits.join(', '),
        },
      });

      console.log(`[prose-analysis] sent to ${email} — matched ${analysis.primary.author}`);
    } catch (err) {
      console.error(`[prose-analysis] failed for ${email}:`, err);
    }
  });

  return NextResponse.json({ data: { ok: true } });
}
