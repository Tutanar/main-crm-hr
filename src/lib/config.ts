// Конфигурация приложения
export const config = {
  hasura: {
    url: process.env.HASURA_URL || process.env.NEXT_PUBLIC_HASURA_URL,
    adminSecret: process.env.HASURA_ADMIN_SECRET || '',
    jwtSecret: process.env.HASURA_GRAPHQL_JWT_SECRET || '{"type":"HS256","key":"default-secret-key"}',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
} as const;

// Типы для JWT
export interface JWTPayload {
  sub: string; // user_id
  role: string; // user role
  username: string;
  iat: number;
  exp: number;
}

// Типы для Hasura
export interface HasuraUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: HasuraUser;
}
