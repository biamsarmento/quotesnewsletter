import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new NextResponse('Missing email', { status: 400 });
  }

  try {
    await prisma.subscriber.updateMany({
      where: { email },
      data: { unsubscribedAt: new Date() },
    });

    if (process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM) {
      try {
        await resend.emails.send({
          from: process.env.NEWSLETTER_FROM!,
          to: email,
          subject: 'You have been unsubscribed ✨',
          html: `
            <p>Hi ${email},</p>
            <p>You have been successfully unsubscribed from Quotes Newsletter.</p>
            <p style="font-size:12px;color:#64748b">
              If this was a mistake, you can subscribe again anytime on our website.
            </p>
          `,
        });
      } catch (err) {
        console.error('Failed to send unsubscribe confirmation (GET):', err);
      }
    }

    return new NextResponse(
      `
      <html>
        <body style="font-family: system-ui; padding: 24px; background:#020617; color:#e2e8f0;">
          <h1>Quotes Newsletter</h1>
          <p>You have been unsubscribed successfully.</p>
          <p style="font-size:12px;color:#64748b">
            If this was a mistake, you can subscribe again on our website.
          </p>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  } catch (err) {
    console.error('Unsubscribe GET error:', err);
    return new NextResponse('Error while unsubscribing', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    await prisma.subscriber.updateMany({
      where: { email },
      data: { unsubscribedAt: new Date() },
    });

    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM) {
      console.warn('RESEND_API_KEY or NEWSLETTER_FROM not configured for unsubscribe');
    } else {
      await resend.emails.send({
        from: process.env.NEWSLETTER_FROM!,
        to: email,
        subject: 'You have been unsubscribed ✨',
        html: `
          <p>Hi ${email},</p>
          <p>You have been successfully unsubscribed from Quotes Newsletter.</p>
          <p style="font-size:12px;color:#64748b">
            If this was a mistake, you can subscribe again anytime on our website.
          </p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Unsubscribe POST error:', err);
    return NextResponse.json(
      { error: 'Error while unsubscribing' },
      { status: 500 }
    );
  }
}
