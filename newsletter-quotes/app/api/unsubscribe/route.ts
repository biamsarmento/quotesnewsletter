import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // resposta simples em HTML
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
    console.error('Unsubscribe error:', err);
    return new NextResponse('Error while unsubscribing', { status: 500 });
  }
}
