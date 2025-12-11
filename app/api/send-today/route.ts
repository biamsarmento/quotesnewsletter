import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

type QuoteApiResponse = {
  quote: string;
  author: string;
};

const resend = new Resend(process.env.RESEND_API_KEY || '');

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://quotesnewsletter.com';

async function getTodayQuote() {
  const apiKey = process.env.NINJAS_API_KEY;

  if (!apiKey) {
    throw new Error('NINJAS_API_KEY is not configured');
  }

  const res = await fetch('https://api.api-ninjas.com/v2/quoteoftheday', {
    headers: {
      'X-Api-Key': apiKey,
    },
    cache: 'no-store',
  });

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

  return data[0];
}

function getQuoteEmailHtml(email: string, quote: string, author?: string) {
  const safeAuthor = author || 'Unknown author';

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Your quote of the day</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:#f8eade;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8eade; padding:24px 0;">

        <!-- Banner -->
        <tr>
          <td align="center" style="padding:0 16px 16px 16px;">
            <img
              src="${APP_URL}/banner-desktop.png"
              srcset="${APP_URL}/banner-mobile.png 480w, ${APP_URL}/banner-desktop.png 800w"
              sizes="(max-width: 600px) 100vw, 600px"
              alt="Quotes Newsletter"
              width="600"
              style="
                display:block;
                max-width:600px;
                width:100%;
                height:auto;
                border-radius:24px;
              "
            />
          </td>
        </tr>

        <!-- Brown Card -->
        <tr>
          <td align="center">
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                max-width:600px;
                background-color:#402d21;
                border-radius:24px;
                padding:24px;
                box-sizing:border-box;
                font-family: Georgia, 'Times New Roman', serif;
              "
            >
              <!-- Title -->
              <tr>
                <td style="text-align:center; padding-bottom:12px;">
                  <h1 style="
                    margin:0;
                    color:#f8eade;
                    font-size:24px;
                    line-height:1.3;
                  ">
                    Your quote of the day ✨
                  </h1>
                </td>
              </tr>

              <!-- Greetings -->
              <tr>
                <td style="text-align:center; padding-bottom:16px;">
                  <p style="
                    margin:0;
                    color:#f8eade;
                    font-size:14px;
                    line-height:1.6;
                  ">
                    Hi
                    <a
                      href="mailto:${email}"
                      style="color:#6f8ca4; text-decoration:underline;"
                    >
                      ${email}
                    </a>,
                    here’s a little spark of inspiration for you today:
                  </p>
                </td>
              </tr>

              <!-- Quotation -->
              <tr>
                <td style="
                  background-color:rgba(120, 84, 69, 0.9);
                  border-radius:16px;
                  padding:20px 24px;
                  color:#fefaf8;
                  font-size:16px;
                  line-height:1.7;
                ">
                  <p style="
                    margin:0 0 12px 0;
                    font-style:italic;
                  ">
                    “${quote}”
                  </p>
                  <p style="
                    margin:0;
                    font-size:14px;
                    opacity:0.9;
                    text-align:right;
                  ">
                    — ${safeAuthor}
                  </p>
                </td>
              </tr>

              <!-- Text -->
              <tr>
                <td style="padding-top:18px; text-align:center;">
                  <p style="
                    margin:0;
                    color:#f8eade;
                    font-size:13px;
                    line-height:1.6;
                  ">
                    Take a moment to breathe, reflect, and carry this thought with you
                    through the rest of your day.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding-top:20px; text-align:center;">
                  <p style="
                    margin:0;
                    color:#f8eade;
                    font-size:11px;
                    line-height:1.6;
                    opacity:0.8;
                  ">
                    You’re receiving this email because you subscribed to
                    <a
                      href="${APP_URL}"
                      style="color:#f8eade; text-decoration:underline; margin:0 4px;"
                    >
                      Quotes Newsletter
                    </a>.
                    <br/>
                    If this wasn’t you, you can safely
                    <a
                      href="${APP_URL}/api/unsubscribe?email=${encodeURIComponent(
                        email
                      )}"
                      style="color:#f8eade; text-decoration:underline; margin-left:4px;"
                    >
                      unsubscribe
                    </a>
                    at any time.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

export async function POST() {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM) {
      throw new Error('RESEND_API_KEY or NEWSLETTER_FROM is not configured');
    }

    // Fetch subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { unsubscribedAt: null },
    });

    if (!subscribers.length) {
      return NextResponse.json(
        { ok: true, sent: 0, message: 'No subscribers to send to' },
        { status: 200 }
      );
    }

    // Fetch quote of the day
    const { quote, author } = await getTodayQuote();

    const subject = 'Quote of the Day ✨';

    await Promise.all(
      subscribers.map((sub) =>
        resend.emails.send({
          from: process.env.NEWSLETTER_FROM!,
          to: sub.email,
          subject,
          html: getQuoteEmailHtml(sub.email, quote, author),
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
