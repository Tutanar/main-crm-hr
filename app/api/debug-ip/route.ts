import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Получаем IP адрес из различных источников
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const userAgent = request.headers.get('user-agent');
  
  // Получаем IP из URL (если есть)
  const url = new URL(request.url);
  const clientIp = url.searchParams.get('ip') || 'not provided';
  
  return NextResponse.json({
    message: 'Debug IP Information',
    ip_sources: {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIp,
      'cf-connecting-ip': cfConnectingIp,
      'client-ip-param': clientIp,
    },
    user_agent: userAgent,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });
}
