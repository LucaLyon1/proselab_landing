import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { emailLayout } from '@/lib/email-layout';

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
    from: 'ProseLab <hello@email.proselab.io>',
    to: [email],
    subject: "You're on the ProseLab waitlist",
    html: emailLayout(`
      <h1 style="font-size: 24px; font-weight: normal; margin: 0 0 24px;">You&rsquo;re on the list.</h1>
      <p style="font-size: 16px; line-height: 1.7; color: #444; margin: 0 0 16px;">
        Thanks for joining the ProseLab waitlist. We&rsquo;re building a writing practice tool that helps you study the craft of great authors &mdash; and write better every day.
      </p>
      <p style="font-size: 16px; line-height: 1.7; color: #444; margin: 0;">
        We&rsquo;re letting people in gradually, and you&rsquo;ll hear from us when it&rsquo;s your turn.
      </p>
    `),
  });

  // Admin notification
  resend.emails.send({
    from: 'ProseLab <hello@email.proselab.io>',
    to: ['contact@proselab.io'],
    subject: 'New waitlist signup',
    html: `<p>New waitlist signup: <strong>${email}</strong></p>`,
  });

  return NextResponse.json({ data: { ok: true } });
}
