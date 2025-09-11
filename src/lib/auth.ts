import { api, type HasuraUser } from './api';
import { type UserRole } from '@/types';

interface Session {
  token: string;
  user: HasuraUser;
  role: UserRole;
  isAuthenticated: boolean;
}

class AuthService {
  private session: Session | null = null;

  constructor() {
    this.loadSessionFromStorage();
  }

  // Загрузка сессии из localStorage
  private loadSessionFromStorage(): void {
    try {
      // Проверяем, что мы в браузере
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');

      if (token && userInfo) {
        const user = JSON.parse(userInfo);
        this.session = {
          token,
          user,
          role: this.mapRoleToUserRole(user.role),
          isAuthenticated: true,
        };
      }
    } catch (error) {
      console.error('Error loading session from storage:', error);
      this.clearSession();
    }
  }

  // Сохранение сессии в localStorage и cookies
  private saveSessionToStorage(session: Session): void {
    try {
      // Проверяем, что мы в браузере
      if (typeof window === 'undefined') {
        return;
      }

      localStorage.setItem('authToken', session.token);
      localStorage.setItem('userInfo', JSON.stringify(session.user));
      
      // Сохраняем токен в cookie для middleware
      document.cookie = `authToken=${session.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    } catch (error) {
      console.error('Error saving session to storage:', error);
    }
  }

  // Очистка сессии
  private clearSession(): void {
    this.session = null;
    
    // Проверяем, что мы в браузере
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      // Удаляем cookie
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  // Маппинг ролей из Hasura в UserRole
  private mapRoleToUserRole(hasuraRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'admin': 'admin',
      'chief-hr': 'chief-hr',
      'hr': 'hr',
    };
    return roleMap[hasuraRole] || 'hr';
  }

  // Маппинг UserRole в роли Hasura
  private mapUserRoleToHasuraRole(userRole: UserRole): string {
    const roleMap: Record<UserRole, string> = {
      'admin': 'admin',
      'chief-hr': 'chief-hr',
      'hr': 'hr',
    };
    return roleMap[userRole];
  }

  // Вход в систему
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.auth.login({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        const { token, user } = response.data;
        
        this.session = {
          token,
          user,
          role: this.mapRoleToUserRole(user.role),
          isAuthenticated: true,
        };

        this.saveSessionToStorage(this.session);
        return { success: true };
      }

      return { success: false, error: 'Неизвестная ошибка' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Ошибка при входе в систему' };
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  // Валидация токена
  async validateToken(): Promise<boolean> {
    if (!this.session?.token) {
      return false;
    }

    try {
      const response = await api.auth.validateToken(this.session.token);
      
      if (response.error) {
        this.clearSession();
        return false;
      }

      if (response.data) {
        // Обновляем данные пользователя
        this.session.user = response.data;
        this.session.role = this.mapRoleToUserRole(response.data.role);
        this.saveSessionToStorage(this.session);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearSession();
      return false;
    }
  }

  // Получение текущей сессии
  getSession(): Session | null {
    return this.session;
  }

  // Получение текущего пользователя
  getCurrentUser(): HasuraUser | null {
    return this.session?.user || null;
  }

  // Получение роли пользователя
  getCurrentRole(): UserRole | null {
    return this.session?.role || null;
  }

  // Проверка аутентификации
  isAuthenticated(): boolean {
    return this.session?.isAuthenticated || false;
  }

  // Проверка роли
  hasRole(role: UserRole): boolean {
    return this.session?.role === role;
  }

  // Проверка любой из ролей
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.session?.role || 'hr');
  }
}

// Экспортируем singleton
export const authService = new AuthService();

// Экспортируем функцию для получения сессии (для совместимости)
export const getSession = (): Session | null => {
  return authService.getSession();
};

// Экспортируем типы
export type { Session };
