import axios, { AxiosInstance } from 'axios';
import { config, type LoginRequest, type LoginResponse, type HasuraUser } from './config';

// GraphQL запросы
const LOGIN_MUTATION = `
  mutation LoginUser($username: String!, $password: String!) {
    users(where: { username: { _eq: $username }, is_active: { _eq: true } }) {
      id
      username
      email
      password_hash
      role
      is_active
      created_at
      updated_at
      created_by
      last_login
    }
  }
`;

const UPDATE_LAST_LOGIN = `
  mutation UpdateLastLogin($id: uuid!, $last_login: timestamptz!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: { last_login: $last_login }) {
      id
    }
  }
`;

const VALIDATE_TOKEN_QUERY = `
  query ValidateToken($id: uuid!) {
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
`;

// Создаем axios инстанс для Hasura
const createHasuraClient = (): AxiosInstance => {
  return axios.create({
    baseURL: config.hasura.url,
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': config.hasura.adminSecret,
    },
  });
};

// Клиент для аутентифицированных запросов
const createAuthenticatedClient = (token: string): AxiosInstance => {
  return axios.create({
    baseURL: config.hasura.url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};

class HasuraAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = createHasuraClient();
  }

  // Аутентификация через API route
  async login(credentials: LoginRequest): Promise<{ data?: LoginResponse; error?: string }> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Ошибка при входе в систему' };
      }

      if (!data.success) {
        return { error: data.error || 'Ошибка аутентификации' };
      }

      return {
        data: {
          token: data.token,
          user: data.user,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Ошибка при входе в систему' };
    }
  }

  // Валидация токена через API route
  async validateToken(token: string): Promise<{ data?: HasuraUser; error?: string }> {
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Ошибка валидации токена' };
      }

      if (!data.success || !data.valid) {
        return { error: data.error || 'Токен недействителен' };
      }

      return { data: data.user };
    } catch (error) {
      console.error('Token validation error:', error);
      return { error: 'Ошибка валидации токена' };
    }
  }

  // Получение данных текущего пользователя
  async getMe(token: string): Promise<{ data?: any; error?: string; errorCode?: string }> {
    try {
      const response = await fetch('/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          error: data.error || 'Ошибка получения данных пользователя',
          errorCode: data.errorCode
        };
      }

      if (!data.success) {
        return { 
          error: data.error || 'Ошибка получения данных пользователя',
          errorCode: data.errorCode
        };
      }

      return { data: data.user };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Ошибка получения данных пользователя' 
      };
    }
  }

  // Обновление данных пользователя
  async updateMe(token: string, updates: { email?: string }): Promise<{ data?: any; error?: string; errorCode?: string }> {
    try {
      const response = await fetch('/api/me', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          error: data.error || 'Ошибка обновления данных пользователя',
          errorCode: data.errorCode
        };
      }

      if (!data.success) {
        return { 
          error: data.error || 'Ошибка обновления данных пользователя',
          errorCode: data.errorCode
        };
      }

      return { data: data.user };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Ошибка обновления данных пользователя' 
      };
    }
  }

  // Проверка здоровья системы
  async checkHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      return { 
        healthy: data.status === 'healthy',
        error: data.status === 'unhealthy' ? 'System unhealthy' : undefined
      };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    // В JWT нет серверного состояния, поэтому просто очищаем токен на клиенте
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  }
}

// Создаем экземпляр API
const hasuraAPI = new HasuraAPI();

// Экспортируем API
export const api = {
  auth: hasuraAPI,
  getMe: hasuraAPI.getMe.bind(hasuraAPI),
  updateMe: hasuraAPI.updateMe.bind(hasuraAPI),
  checkHealth: hasuraAPI.checkHealth.bind(hasuraAPI),
};

// Экспортируем типы
export type { LoginRequest, LoginResponse, HasuraUser };
