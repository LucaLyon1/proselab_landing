import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await request.json();

  // Subscribe to Substack newsletter
  const substackRes = await fetch('https://proselab.substack.com/api/v1/free', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      first_url: 'https://www.proselab.io/',
      first_referrer: '',
      current_url: 'https://www.proselab.io/',
      current_referrer: '',
      referral_code: '',
      source: 'subscribe_page',
    }),
  });

  if (!substackRes.ok) {
    return NextResponse.json({ error: 'Substack subscription failed' }, { status: 400 });
  }

  // Fire-and-forget admin notification
  resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: ['contact@proselab.io'],
    subject: 'New subscriber',
    html: `<p>New Substack subscriber: <strong>${email}</strong></p>`,
  });

  return NextResponse.json({ data: { ok: true } });
}
