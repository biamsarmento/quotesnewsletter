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
    throw new Error('NINJAS_API_KEY não configurada');
  }

  console.log('🔹 NINJAS_API_KEY prefix:', apiKey.slice(0, 6));

  // 👇 ATUALIZA AQUI: usa v2/quoteoftheday, sem query string
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
      `Falha ao buscar quote na API Ninjas (status ${res.status})`
    );
  }

  const data = (await res.json()) as QuoteApiResponse[];

  if (!data[0]) {
    throw new Error('Nenhuma quote retornada');
  }

  console.log('✅ Quote recebida:', data[0]);
  return data[0];
}


export async function POST() {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM) {
      throw new Error('Env RESEND_API_KEY ou NEWSLETTER_FROM não configuradas');
    }

    // Busca inscritos
    const subscribers = await prisma.subscriber.findMany();

    if (!subscribers.length) {
      return NextResponse.json(
        { ok: true, sent: 0, message: 'Nenhum inscrito para enviar' },
        { status: 200 }
      );
    }

    // Busca quote do dia
    const { quote, author } = await getTodayQuote();

    const subject = 'Quote do dia ✨';

    const html = (email: string) => `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px;">
        <p style="font-size: 14px; color: #64748b;">Oi ${email},</p>
        <p style="font-size: 16px; margin-top: 16px; margin-bottom: 8px;">
          <em>"${quote}"</em>
        </p>
        <p style="font-size: 14px; color: #94a3b8;">— ${author || 'Autor desconhecido'}</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8;">
          Você recebeu esta mensagem por estar inscrita(o) na Quotes Newsletter.
        </p>
      </div>
    `;

    // Cria o client do Resend aqui dentro (evita erro em module load)
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
      { error: error?.message || 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
