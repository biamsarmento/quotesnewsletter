// app/api/cron/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteToAllSubscribers } from '../send-today/route';

export async function GET(req: NextRequest) {
  // Segurança: confere o header Authorization com o CRON_SECRET
  const auth = req.headers.get('Authorization');

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendQuoteToAllSubscribers();
    // Você pode inspecionar isso no log do cron no Vercel
    return NextResponse.json({ from: 'cron', ...result });
  } catch (error: any) {
    console.error('cron error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
