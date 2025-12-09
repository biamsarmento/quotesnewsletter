import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

type QuoteApiResponse = {
  quote: string;
  author: string;
};

async function getTodayQuote() {
  const apiKey = process.env.NINJAS_API_KEY;

  if (!apiKey) {
    throw new Error('NINJAS_API_KEY is not configured');
  }

  console.log('🔹 NINJAS_API_KEY prefix:', apiKey.slice(0, 6));

  // Using API Ninjas v2 — no query string required
  const res = await fetch('https://api.api-ninjas.com/v2/quoteoftheday', {
    headers: {
      'X-Api-Key': apiKey,
    },
    cache: 'no-store',
  });

  console.log('🔹 API Ninjas status:', res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error('❌ API Ninjas ERROR body:', text);
    throw new Error(
      `Failed to fetch quote from API Ninjas (status ${res.status})`
    );
  }

  const data = (await res.json()) as QuoteApiResponse[];

  if (!data[0]) {
    throw new Error('No quote returned from API');
  }

  console.log('✅ Quote received:', data[0]);
  return data[0];
}

export async function POST() {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM) {
      throw new Error('RESEND_API_KEY or NEWSLETTER_FROM is not configured');
    }

    // Fetch subscribers
    const subscribers = await prisma.subscriber.findMany();

    if (!subscribers.length) {
      return NextResponse.json(
        { ok: true, sent: 0, message: 'No subscribers to send to' },
        { status: 200 }
      );
    }

    // Fetch quote of the day
    const { quote, author } = await getTodayQuote();

    const subject = 'Quote of the Day ✨';

    const html = (email: string) => `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px;">
        <p style="font-size: 14px; color: #64748b;">Hi ${email},</p>
        <p style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">
          <em>"${quote}"</em>
        </p>
        <p style="font-size: 14px; color: #94a3b8;">— ${
          author || 'Unknown author'
        }</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8;">
          You received this email because you are subscribed to the Quotes Newsletter.
        </p>
      </div>
    `;

    // Create Resend client inside POST (avoids module-load issues)
    const resend = new Resend(process.env.RESEND_API_KEY as string);

    await Promise.all(
      subscribers.map((sub) =>
        resend.emails.send({
          from: process.env.NEWSLETTER_FROM!,
          to: sub.email,
          subject,
          html: html(sub.email),
        })
      )
    );

    return NextResponse.json({ ok: true, sent: subscribers.length });
  } catch (error: any) {
    console.error('send-today error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
