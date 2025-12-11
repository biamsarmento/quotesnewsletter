import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://quotesnewsletter.com";

function getWelcomeEmailHtml(email: string) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Welcome to Quotes Newsletter</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:#f8eade;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8eade; padding:24px 0;">
        
        <!-- Banner -->
        <tr>
          <td align="center" style="padding:0 16px 16px 16px;">
            <img
              src="${APP_URL}/banner-desktop.png"
              srcset="${APP_URL}/banner-mobile.png 320w, ${APP_URL}/banner-desktop.png 600w"
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
                    font-size:26px;
                    line-height:1.2;
                    font-family: Georgia, 'Times New Roman', serif;
                  ">
                    Welcome to your daily dose of inspiration ✨
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
                    font-family: Georgia, 'Times New Roman', serif;
                  ">
                    Hey 
                    <a
                      href="mailto:${email}"
                      style="
                        color:#6f8ca4;
                        text-decoration:underline;
                      "
                    >
                      ${email}
                    </a>,
                    we&apos;re so glad you&apos;re here.
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
                  font-family: Georgia, 'Times New Roman', serif;
                ">
                  <p style="margin:0 0 12px 0;">
                    Every morning, you&apos;ll receive a single, carefully chosen quote
                    to help you pause, breathe, and start your day with intention.
                  </p>
                  <p style="margin:0;">
                    No noise. No spam. Just a quiet spark of inspiration in your inbox.
                  </p>
                </td>
              </tr>

              <!-- Quotation -->
              <tr>
                <td style="padding-top:18px; text-align:center;">
                  <p style="
                    margin:0;
                    color:#f8eade;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size:16px;
                    line-height:1.5;
                    font-style:italic;
                  ">
                    &quot;The best way to get started is to quit talking and begin doing.&quot;<br/>
                    <span style="font-size:13px; opacity:0.8;">— Walt Disney</span>
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
                    font-family: Georgia, 'Times New Roman', serif;
                  ">
                    You&apos;re receiving this email because you subscribed to
                    <a
                      href="${APP_URL}"
                      style="color:#f8eade; text-decoration:underline; margin-left:4px; margin-right:4px;"
                    >
                      Quotes Newsletter
                    </a>.
                    <br/>
                    If this wasn&apos;t you, you can safely
                    <a
                      href="${APP_URL}/unsubscribe"
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

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM) {
      throw new Error("Env RESEND_API_KEY or NEWSLETTER_FROM not working");
    }

    await prisma.subscriber.upsert({
      where: { email },
      update: {
        unsubscribedAt: null,
      },
      create: {
        email,
      },
    });

    await resend.emails.send({
      from: process.env.NEWSLETTER_FROM!,
      to: email,
      subject: "Welcome to Quotes Newsletter ✨",
      html: getWelcomeEmailHtml(email),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
