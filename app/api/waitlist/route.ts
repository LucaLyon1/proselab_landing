import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Add contact to the waitlist segment
  const { error: contactError } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: process.env.RESEND_SEGMENT_ID! }],
  });

  if (contactError) {
    // "already exists" is fine — treat as success
    if (!contactError.message?.includes('already exists')) {
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 400 });
    }
  }

  // Send welcome email to the user
  resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: [email],
    subject: "You're on the Proselab waitlist",
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 24px;">You're on the list.</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #444;">
          Thanks for joining the Proselab waitlist. We're building a writing practice tool that helps you study the craft of great authors — and write better every day.
        </p>
        <p style="font-size: 16px; line-height: 1.7; color: #444;">
          We're letting people in gradually, and you'll hear from us when it's your turn.
        </p>
        <p style="font-size: 14px; line-height: 1.7; color: #888; margin-top: 32px;">
          — The Proselab team
        </p>
      </div>
    `,
  });

  // Admin notification
  resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: ['contact@proselab.io'],
    subject: 'New waitlist signup',
    html: `<p>New waitlist signup: <strong>${email}</strong></p>`,
  });

  return NextResponse.json({ data: { ok: true } });
}
