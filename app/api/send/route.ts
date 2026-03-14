import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, message } = await request.json();

  const { data, error } = await resend.emails.send({
    from: 'ProseLab <hello@email.proselab.io>',
    to: ['contact@proselab.io'],
    subject: `Message from ${name}`,
    html: `<p><strong>${name}</strong> (${email}):</p><p>${message}</p>`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ data });
}
