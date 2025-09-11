import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

interface MeResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    last_login?: string;
  };
  error?: string;
  errorCode?: string;
  timestamp: string;
}

// Коды ошибок и их описания
const ERROR_CODES = {
  // Аутентификация
  'AUTH_001': 'Authorization header missing',
  'AUTH_002': 'Invalid token format',
  'AUTH_003': 'Token expired',
  'AUTH_004': 'Invalid token signature',
  'AUTH_005': 'Token not active yet',
  'AUTH_006': 'Invalid token payload',
  
  // Пользователь
  'USER_001': 'User not found',
  'USER_002': 'User is inactive',
  'USER_003': 'User data corrupted',
  'USER_004': 'User role invalid',
  
  // База данных
  'DB_001': 'Database connection failed',
  'DB_002': 'Database query failed',
  'DB_003': 'Database timeout',
  'DB_004': 'Database permission denied',
  'DB_005': 'Database constraint violation',
  
  // Система
  'SYS_001': 'Internal server error',
  'SYS_002': 'Configuration error',
  'SYS_003': 'Service unavailable',
  'SYS_004': 'Rate limit exceeded',
  
  // Валидация
  'VAL_001': 'Invalid request format',
  'VAL_002': 'Missing required fields',
  'VAL_003': 'Invalid field values',
  'VAL_004': 'Request too large',
} as const;

type ErrorCode = keyof typeof ERROR_CODES;

// Получение описания ошибки по коду
function getErrorDescription(code: ErrorCode): string {
  return ERROR_CODES[code] || 'Unknown error';
}

// Валидация JWT токена
function validateJWTToken(token: string): { valid: boolean; payload?: any; errorCode?: ErrorCode } {
  try {
    const jwtSecret = JSON.parse(config.hasura.jwtSecret);
    
    const payload = jwt.verify(token, jwtSecret.key, { 
      algorithms: [jwtSecret.type] 
    }) as any;

    // Проверяем обязательные поля
    if (!payload.sub || !payload.role || !payload.username) {
      return { valid: false, errorCode: 'AUTH_006' };
    }

    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, errorCode: 'AUTH_003' };
    }

    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, errorCode: 'AUTH_002' };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, errorCode: 'AUTH_003' };
    }
    if (error instanceof jwt.NotBeforeError) {
      return { valid: false, errorCode: 'AUTH_005' };
    }
    
    return { valid: false, errorCode: 'AUTH_004' };
  }
}

// Получение данных пользователя из базы данных
async function getUserData(userId: string): Promise<{ user?: any; errorCode?: ErrorCode }> {
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query GetUserData($id: uuid!) {
            users_by_pk(id: $id) {
              id
              username
              email
              role
              is_active
              created_at
              updated_at
              created_by
              last_login
            }
          }
        `,
        variables: { id: userId },
      }),
    });

    if (!response.ok) {
      if (response.status === 500) {
        return { errorCode: 'DB_001' };
      }
      if (response.status === 403) {
        return { errorCode: 'DB_004' };
      }
      if (response.status === 408) {
        return { errorCode: 'DB_003' };
      }
      return { errorCode: 'DB_002' };
    }

    const data = await response.json();

    if (data.errors) {
      const error = data.errors[0];
      if (error.message.includes('permission')) {
        return { errorCode: 'DB_004' };
      }
      if (error.message.includes('constraint')) {
        return { errorCode: 'DB_005' };
      }
      return { errorCode: 'DB_002' };
    }

    const user = data.data?.users_by_pk;
    
    if (!user) {
      return { errorCode: 'USER_001' };
    }

    if (!user.is_active) {
      return { errorCode: 'USER_002' };
    }

    // Проверяем валидность данных пользователя
    if (!user.id || !user.username || !user.email || !user.role) {
      return { errorCode: 'USER_003' };
    }

    // Проверяем валидность роли
    const validRoles = ['admin', 'chief-hr', 'hr'];
    if (!validRoles.includes(user.role)) {
      return { errorCode: 'USER_004' };
    }

    return { user };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return { errorCode: 'DB_001' };
      }
      if (error.message.includes('timeout')) {
        return { errorCode: 'DB_003' };
      }
    }
    return { errorCode: 'SYS_001' };
  }
}

// Основная функция GET для получения данных пользователя
export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('AUTH_001'),
        errorCode: 'AUTH_001',
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
        error: getErrorDescription('AUTH_001'),
        errorCode: 'AUTH_001',
        timestamp,
      }, { status: 401 });
    }

    // Валидируем JWT токен
    const tokenValidation = validateJWTToken(token);
    
    if (!tokenValidation.valid) {
      const errorCode = tokenValidation.errorCode || 'AUTH_002';
      return NextResponse.json({
        success: false,
        error: getErrorDescription(errorCode),
        errorCode,
        timestamp,
      }, { status: 401 });
    }

    const payload = tokenValidation.payload;

    // Получаем данные пользователя из базы данных
    const userResult = await getUserData(payload.sub);
    
    if (userResult.errorCode) {
      const statusCode = userResult.errorCode.startsWith('AUTH_') ? 401 :
                        userResult.errorCode.startsWith('USER_') ? 404 :
                        userResult.errorCode.startsWith('DB_') ? 503 : 500;
      
      return NextResponse.json({
        success: false,
        error: getErrorDescription(userResult.errorCode),
        errorCode: userResult.errorCode,
        timestamp,
      }, { status: statusCode });
    }

    if (!userResult.user) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('USER_001'),
        errorCode: 'USER_001',
        timestamp,
      }, { status: 404 });
    }

    // Возвращаем успешный ответ с данными пользователя
    return NextResponse.json({
      success: true,
      user: userResult.user,
      timestamp,
    });

  } catch (error) {
    console.error('Me API error:', error);
    
    return NextResponse.json({
      success: false,
      error: getErrorDescription('SYS_001'),
      errorCode: 'SYS_001',
      timestamp,
    }, { status: 500 });
  }
}

// Функция POST для обновления данных пользователя
export async function POST(request: NextRequest): Promise<NextResponse<MeResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Получаем токен из заголовка Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('AUTH_001'),
        errorCode: 'AUTH_001',
        timestamp,
      }, { status: 401 });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('AUTH_001'),
        errorCode: 'AUTH_001',
        timestamp,
      }, { status: 401 });
    }

    // Валидируем JWT токен
    const tokenValidation = validateJWTToken(token);
    
    if (!tokenValidation.valid) {
      const errorCode = tokenValidation.errorCode || 'AUTH_002';
      return NextResponse.json({
        success: false,
        error: getErrorDescription(errorCode),
        errorCode,
        timestamp,
      }, { status: 401 });
    }

    // Парсим тело запроса
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('VAL_001'),
        errorCode: 'VAL_001',
        timestamp,
      }, { status: 400 });
    }

    // Валидируем данные для обновления
    const allowedFields = ['email'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'email' && typeof body[field] === 'string' && body[field].trim()) {
          updateData[field] = body[field].trim();
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('VAL_002'),
        errorCode: 'VAL_002',
        timestamp,
      }, { status: 400 });
    }

    // Обновляем данные пользователя
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          mutation UpdateUser($id: uuid!, $updates: users_set_input!) {
            update_users_by_pk(
              pk_columns: { id: $id }, 
              _set: $updates
            ) {
              id
              username
              email
              role
              is_active
              created_at
              updated_at
              created_by
              last_login
            }
          }
        `,
        variables: { 
          id: tokenValidation.payload.sub,
          updates: updateData
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('DB_002'),
        errorCode: 'DB_002',
        timestamp,
      }, { status: 500 });
    }

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('DB_002'),
        errorCode: 'DB_002',
        timestamp,
      }, { status: 500 });
    }

    const updatedUser = data.data?.update_users_by_pk;
    
    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: getErrorDescription('USER_001'),
        errorCode: 'USER_001',
        timestamp,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      timestamp,
    });

  } catch (error) {
    console.error('Me update error:', error);
    
    return NextResponse.json({
      success: false,
      error: getErrorDescription('SYS_001'),
      errorCode: 'SYS_001',
      timestamp,
    }, { status: 500 });
  }
}
