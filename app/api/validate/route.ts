import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

interface ValidateResponse {
  success: boolean;
  valid?: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
  timestamp: string;
}

// Валидация JWT токена
function validateJWTToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const jwtSecret = JSON.parse(config.hasura.jwtSecret);
    
    const payload = jwt.verify(token, jwtSecret.key, { 
      algorithms: [jwtSecret.type] 
    }) as any;

    // Проверяем обязательные поля (минимальный набор)
    // Наш login токен формирует поля: sub, role, email, full_name, iat, exp
    if (!payload.sub || !payload.role) {
      return { valid: false, error: 'Invalid token payload' };
    }

    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token format' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }
    if (error instanceof jwt.NotBeforeError) {
      return { valid: false, error: 'Token not active yet' };
    }
    
    return { valid: false, error: 'Token validation failed' };
  }
}

// Проверка пользователя в базе данных
async function checkUserInDatabase(userId: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query CheckUser($id: uuid!) {
            users_by_pk(id: $id) {
              id
              email
              role
              is_active
            }
          }
        `,
        variables: { id: userId },
      }),
    });

    if (!response.ok) {
      return { exists: false, error: `Database query failed: HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.errors) {
      return { exists: false, error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}` };
    }

    const user = data.data?.users_by_pk;
    
    if (!user) {
      return { exists: false, error: 'User not found' };
    }

    if (!user.is_active) {
      return { exists: false, error: 'User is inactive' };
    }

    return { exists: true, user };
  } catch (error) {
    return { exists: false, error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Основная функция POST для валидации токена
export async function POST(request: NextRequest): Promise<NextResponse<ValidateResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Authorization header missing',
        timestamp,
      }, { status: 401 });
    }

    // Извлекаем токен из заголовка "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Token missing from Authorization header',
        timestamp,
      }, { status: 401 });
    }

    // Валидируем JWT токен
    const tokenValidation = validateJWTToken(token);
    
    if (!tokenValidation.valid) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: tokenValidation.error,
        timestamp,
      }, { status: 401 });
    }

    const payload = tokenValidation.payload;

    // Проверяем пользователя в базе данных
    const userCheck = await checkUserInDatabase(payload.sub);
    
    if (!userCheck.exists) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: userCheck.error,
        timestamp,
      }, { status: 401 });
    }

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: userCheck.user.id,
        username: userCheck.user.email || userCheck.user.id,
        role: userCheck.user.role,
      },
      timestamp,
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
    return NextResponse.json({
      success: false,
      valid: false,
      error: 'Internal server error',
      timestamp,
    }, { status: 500 });
  }
}

// Функция GET для проверки статуса валидации
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Token validation endpoint',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
  });
}
