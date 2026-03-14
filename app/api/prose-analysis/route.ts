import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, text, prompt } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: 'Writing sample is required' }, { status: 400 });
  }

  // Add contact to the waitlist segment (same as regular waitlist)
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

  // Send confirmation email to the user
  resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: [email],
    subject: 'Your prose analysis is on the way',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 24px;">We&rsquo;re analyzing your writing.</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #444;">
          Thanks for submitting your writing to Proselab&rsquo;s prose analysis. We&rsquo;re comparing your style against 20 renowned authors to find your closest literary match.
        </p>
        <p style="font-size: 16px; line-height: 1.7; color: #444;">
          Your results will arrive in a separate email shortly. In the meantime, you&rsquo;ve been added to our early-access list &mdash; you&rsquo;ll be the first to know when Proselab launches.
        </p>
        <p style="font-size: 14px; line-height: 1.7; color: #888; margin-top: 32px;">
          &mdash; The Proselab team
        </p>
      </div>
    `,
  });

  // Send the writing sample to admin for analysis
  const escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedPrompt = prompt?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'N/A';

  resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: ['contact@proselab.io'],
    subject: `Prose analysis request from ${email}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
        <h2 style="font-size: 18px; margin-bottom: 16px;">New prose analysis submission</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Prompt:</strong> ${escapedPrompt}</p>
        <p><strong>Text length:</strong> ${text.length} characters</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p><strong>Writing sample:</strong></p>
        <blockquote style="font-style: italic; border-left: 3px solid #b84c2e; padding-left: 16px; margin: 16px 0; color: #444; line-height: 1.8;">
          ${escapedText}
        </blockquote>
      </div>
    `,
  });

  return NextResponse.json({ data: { ok: true } });
}
