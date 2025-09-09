import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

// Типы для запроса и ответа
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
  error?: string;
  timestamp: string;
}

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy';
  message: string;
  responseTime?: number;
}

// Проверка здоровья базы данных
async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();
  
  try {
    // Простой запрос для проверки подключения к Hasura
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query HealthCheck {
            users(limit: 1) {
              id
            }
          }
        `,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'unhealthy',
        message: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
      };
    }

    const data = await response.json();
    
    if (data.errors) {
      return {
        status: 'unhealthy',
        message: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`,
        responseTime,
      };
    }

    return {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

// Функции для работы с новым шифрованием
function hashPassword(password: string, salt: string): string {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  return hash.toString('hex');
}

// Валидация входных данных
function validateLoginRequest(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Invalid request body' };
  }

  const { email, password } = body;

  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required and must be a string' };
  }

  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required and must be a string' };
  }

  if (email.trim().length === 0) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  if (password.length === 0) {
    return { isValid: false, error: 'Password cannot be empty' };
  }

  if (email.length > 255) {
    return { isValid: false, error: 'Email is too long (max 255 characters)' };
  }

  if (password.length > 255) {
    return { isValid: false, error: 'Password is too long (max 255 characters)' };
  }

  // Проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Проверка на SQL injection (базовая)
  const sqlInjectionPatterns = [
    /('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/)|(\|)|(\&)|(\^)|(\$)|(\%))/i,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(email) || pattern.test(password)) {
      return { isValid: false, error: 'Invalid characters detected in input' };
    }
  }

  return { isValid: true };
}

// Поиск пользователя в базе данных
async function findUser(email: string): Promise<{ user?: any; error?: string }> {
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query FindUser($email: String!) {
            users(where: { 
              email: { _eq: $email }, 
              is_active: { _eq: true } 
            }) {
              id
              email
              full_name
              password_hash
              password_salt
              role
              is_active
              created_at
              updated_at
              created_by
              last_login
            }
          }
        `,
        variables: { email: email.trim() },
      }),
    });

    if (!response.ok) {
      return { error: `Database query failed: HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.errors) {
      return { error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}` };
    }

    const users = data.data?.users || [];
    
    if (users.length === 0) {
      return { error: 'User not found or inactive' };
    }

    if (users.length > 1) {
      return { error: 'Multiple users found with same email' };
    }

    return { user: users[0] };
  } catch (error) {
    return { error: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Обновление времени последнего входа
async function updateLastLogin(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          mutation UpdateLastLogin($id: uuid!, $last_login: timestamptz!) {
            update_users_by_pk(
              pk_columns: { id: $id }, 
              _set: { last_login: $last_login }
            ) {
              id
            }
          }
        `,
        variables: { 
          id: userId, 
          last_login: now 
        },
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Failed to update last login: HTTP ${response.status}` };
    }

    const data = await response.json();

    if (data.errors) {
      return { success: false, error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Failed to update last login: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Создание JWT токена
function createJWTToken(user: any): string {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    full_name: user.full_name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 часа
  };

  const jwtSecret = JSON.parse(config.hasura.jwtSecret);
  return jwt.sign(payload, jwtSecret.key, { algorithm: jwtSecret.type as any });
}

// Основная функция POST для логина
export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Проверяем здоровье базы данных
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.status === 'unhealthy') {
      return NextResponse.json({
        success: false,
        error: `Database is unhealthy: ${dbHealth.message}`,
        timestamp,
      }, { status: 503 });
    }

    // Парсим тело запроса
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        timestamp,
      }, { status: 400 });
    }

    // Валидируем входные данные
    const validation = validateLoginRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        timestamp,
      }, { status: 400 });
    }

    const { email, password } = body as LoginRequest;

    // Ищем пользователя в базе данных
    const userResult = await findUser(email);
    if (userResult.error) {
      return NextResponse.json({
        success: false,
        error: userResult.error,
        timestamp,
      }, { status: 500 });
    }

    if (!userResult.user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
        timestamp,
      }, { status: 401 });
    }

    const user = userResult.user;

    // Проверяем пароль с новым шифрованием
    let isPasswordValid: boolean;
    try {
      const hashedPassword = hashPassword(password, user.password_salt);
      isPasswordValid = hashedPassword === user.password_hash;
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Password verification failed',
        timestamp,
      }, { status: 500 });
    }

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
        timestamp,
      }, { status: 401 });
    }

    // Создаем JWT токен
    let token: string;
    try {
      token = createJWTToken(user);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create authentication token',
        timestamp,
      }, { status: 500 });
    }

    // Обновляем время последнего входа (не критично, если не удастся)
    const updateResult = await updateLastLogin(user.id);
    if (!updateResult.success) {
      console.warn('Failed to update last login:', updateResult.error);
    }

    // Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
      },
      timestamp,
    });

  } catch (error) {
    console.error('Login API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp,
    }, { status: 500 });
  }
}

// Функция GET для проверки здоровья API
export async function GET(): Promise<NextResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    const dbHealth = await checkDatabaseHealth();
    
    return NextResponse.json({
      status: 'ok',
      database: dbHealth,
      timestamp,
      version: '1.0.0',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    }, { status: 500 });
  }
}
