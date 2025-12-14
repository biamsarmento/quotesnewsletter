import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteToAllSubscribers } from '../send-today/route';

export async function GET(req: NextRequest) {
  // const auth = req.headers.get('Authorization');

  // if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const token = req.nextUrl.searchParams.get('token');

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendQuoteToAllSubscribers();
    return NextResponse.json({ from: 'cron', ...result });
  } catch (error: any) {
    console.error('cron error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
