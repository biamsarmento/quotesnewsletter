// app/api/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://quotesnewsletter.com';

function getUnsubscribeEmailHtml(email: string) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>You have been unsubscribed</title>
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
                    You’ve been unsubscribed from<br/>Quotes Newsletter ✨
                  </h1>
                </td>
              </tr>

              <!-- Subtitle -->
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
                    you’re all set — we’ve stopped sending you daily quotes.
                  </p>
                </td>
              </tr>

              <!-- Main -->
              <tr>
                <td style="
                  background-color:rgba(120, 84, 69, 0.9);
                  border-radius:16px;
                  padding:16px 20px;
                  color:#fefaf8;
                  font-size:14px;
                  line-height:1.7;
                ">
                  <p style="margin:0 0 12px 0;">
                    We’re sorry to see you go, but we completely understand. Your
                    address has been removed from our active list and you won’t
                    receive any more Quotes Newsletter emails.
                  </p>
                  <p style="margin:0;">
                    If you ever change your mind, you can join us again with just
                    one click.
                  </p>
                </td>
              </tr>

              <!-- Call to action -->
              <tr>
                <td style="padding-top:18px; text-align:center;">
                  <p style="
                    margin:0;
                    color:#f8eade;
                    font-size:13px;
                    line-height:1.6;
                  ">
                    Miss the inspiration?
                    <a
                      href="${APP_URL}"
                      style="color:#6f8ca4; text-decoration:underline; margin-left:4px;"
                    >
                      Subscribe again
                    </a>
                    anytime.
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
                    This message was sent by
                    <a
                      href="${APP_URL}"
                      style="color:#f8eade; text-decoration:underline; margin:0 4px;"
                    >
                      Quotes Newsletter
                    </a>
                    just to confirm your unsubscribe request.
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
          html: getUnsubscribeEmailHtml(email),
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
      console.warn(
        'RESEND_API_KEY or NEWSLETTER_FROM not configured for unsubscribe'
      );
    } else {
      await resend.emails.send({
        from: process.env.NEWSLETTER_FROM!,
        to: email,
        subject: 'You have been unsubscribed ✨',
        html: getUnsubscribeEmailHtml(email),
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
