import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Функция для проверки IP адреса в allowlist
async function isIpAllowed(ip: string): Promise<boolean> {
  try {
    console.log('🔍 Checking IP in allowlist:', ip);
    
    // Получаем данные из Hasura
    const response = await fetch(`${process.env.HASURA_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || '',
      },
      body: JSON.stringify({
        query: `
          query GetActiveIpAddresses {
            ip_allowlist(where: { is_active: { _eq: true } }) {
              ip_address
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const allowedIps = data.data?.ip_allowlist || [];
    
    console.log('🔍 Allowed IPs from DB:', allowedIps);

    // Проверяем точное совпадение IP
    const exactMatch = allowedIps.some((item: any) => item.ip_address === ip);
    if (exactMatch) {
      console.log('✅ Exact IP match found:', ip);
      return true;
    }

    // Проверяем CIDR блоки
    for (const item of allowedIps) {
      if (isIpInCidr(ip, item.ip_address)) {
        console.log('✅ CIDR match found:', ip, 'in', item.ip_address);
        return true;
      }
    }

    console.log('❌ No IP match found for:', ip);
    return false;
  } catch (error) {
    return false;
  }
}

// Функция для проверки IP в CIDR блоке
function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    if (!cidr.includes('/')) {
      // Если нет маски, проверяем точное совпадение
      return ip === cidr;
    }

    const [network, prefixLength] = cidr.split('/');
    const prefix = parseInt(prefixLength, 10);

    // Конвертируем IP в число
    const ipToNumber = (ip: string): number => {
      return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    };

    const networkNumber = ipToNumber(network);
    const ipNumber = ipToNumber(ip);
    const mask = (0xffffffff << (32 - prefix)) >>> 0;

    return (networkNumber & mask) === (ipNumber & mask);
  } catch (error) {
    return false;
  }
}

// Функция для получения реального IP адреса
function getRealIpAddress(request: NextRequest): string {
  // Проверяем заголовки в порядке приоритета
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    // x-forwarded-for может содержать несколько IP, берем первый
    const ip = forwardedFor.split(',')[0].trim();
    // Конвертируем IPv6 localhost в IPv4
    if (ip === '::1') {
      return '127.0.0.1';
    }
    return ip;
  }
  
  if (realIp) {
    // Конвертируем IPv6 localhost в IPv4
    if (realIp === '::1') {
      return '127.0.0.1';
    }
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback на localhost
  return '127.0.0.1';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Пропускаем API routes, статические файлы и страницы аутентификации
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static/') ||
    pathname === '/login' ||
    pathname === '/hasura-test'
  ) {
    return NextResponse.next();
  }

  // Получаем реальный IP адрес
  const clientIp = getRealIpAddress(request);
  
  // Отладочная информация
  console.log('🔍 Middleware Debug:');
  console.log('  Path:', pathname);
  console.log('  Client IP:', clientIp);
  console.log('  Headers:', {
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-real-ip': request.headers.get('x-real-ip'),
    'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
  });

  // Проверяем, разрешен ли IP
  const isAllowed = await isIpAllowed(clientIp);
  console.log('  IP Allowed:', isAllowed);
  
  if (!isAllowed) {
    // Возвращаем полностью пустую страницу с белым экраном
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title></title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: white;
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body></body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // Проверяем аутентификацию для защищенных страниц
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Если нет токена и это не главная страница, перенаправляем на логин
  if (!token && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
