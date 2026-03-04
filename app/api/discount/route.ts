import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();

  const { error } = await resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: [email],
    replyTo: 'contact@proselab.io',
    subject: 'Your 10% off Proselab',
    html: `
      <p>Thanks for your interest in Proselab.</p>
      <p>Use code <strong>PROSELAB10</strong> at checkout for 10% off your first month.</p>
      <p><a href="https://app.proselab.io/signup">Start writing →</a></p>
    `,
    idempotencyKey: `discount-offer/${email}`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // Fire-and-forget admin notification
  resend.emails.send({
    from: 'Proselab <contact@proselab.io>',
    to: ['contact@proselab.io'],
    subject: 'New exit intent lead',
    html: `<p>Exit intent signup: <strong>${email}</strong></p>`,
  });

  return NextResponse.json({ data: { ok: true } });
}
