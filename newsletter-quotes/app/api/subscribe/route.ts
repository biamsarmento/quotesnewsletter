import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM) {
      throw new Error('Env RESEND_API_KEY ou NEWSLETTER_FROM não configuradas');
    }

    // salva (ou reaproveita se já existir)
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    await resend.emails.send({
      from: process.env.NEWSLETTER_FROM!,
      to: email,
      subject: 'Welcome to Quotes Newsletter ✨',
      html: `<p>Oi ${email}, sua inscrição foi feita com sucesso! 🎉</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
