'use client';
import { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { api } from '@/lib/api';
import Button from '@/components/Button/Button';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_login?: string;
}

interface ErrorInfo {
  code: string;
  message: string;
  suggestion: string;
}

// Коды ошибок и их описания
const ERROR_DESCRIPTIONS: Record<string, ErrorInfo> = {
  'AUTH_001': {
    code: 'AUTH_001',
    message: 'Отсутствует заголовок авторизации',
    suggestion: 'Пожалуйста, войдите в систему заново'
  },
  'AUTH_002': {
    code: 'AUTH_002',
    message: 'Неверный формат токена',
    suggestion: 'Пожалуйста, войдите в систему заново'
  },
  'AUTH_003': {
    code: 'AUTH_003',
    message: 'Токен истек',
    suggestion: 'Пожалуйста, войдите в систему заново'
  },
  'AUTH_004': {
    code: 'AUTH_004',
    message: 'Неверная подпись токена',
    suggestion: 'Пожалуйста, войдите в систему заново'
  },
  'AUTH_005': {
    code: 'AUTH_005',
    message: 'Токен еще не активен',
    suggestion: 'Пожалуйста, подождите и попробуйте снова'
  },
  'AUTH_006': {
    code: 'AUTH_006',
    message: 'Неверные данные в токене',
    suggestion: 'Пожалуйста, войдите в систему заново'
  },
  'USER_001': {
    code: 'USER_001',
    message: 'Пользователь не найден',
    suggestion: 'Обратитесь к администратору системы'
  },
  'USER_002': {
    code: 'USER_002',
    message: 'Пользователь неактивен',
    suggestion: 'Обратитесь к администратору для активации аккаунта'
  },
  'USER_003': {
    code: 'USER_003',
    message: 'Данные пользователя повреждены',
    suggestion: 'Обратитесь к администратору системы'
  },
  'USER_004': {
    code: 'USER_004',
    message: 'Неверная роль пользователя',
    suggestion: 'Обратитесь к администратору для исправления роли'
  },
  'DB_001': {
    code: 'DB_001',
    message: 'Ошибка подключения к базе данных',
    suggestion: 'Попробуйте позже или обратитесь к администратору'
  },
  'DB_002': {
    code: 'DB_002',
    message: 'Ошибка запроса к базе данных',
    suggestion: 'Попробуйте позже или обратитесь к администратору'
  },
  'DB_003': {
    code: 'DB_003',
    message: 'Таймаут базы данных',
    suggestion: 'Попробуйте позже'
  },
  'DB_004': {
    code: 'DB_004',
    message: 'Нет прав доступа к базе данных',
    suggestion: 'Обратитесь к администратору системы'
  },
  'DB_005': {
    code: 'DB_005',
    message: 'Нарушение ограничений базы данных',
    suggestion: 'Проверьте введенные данные'
  },
  'SYS_001': {
    code: 'SYS_001',
    message: 'Внутренняя ошибка сервера',
    suggestion: 'Попробуйте позже или обратитесь к администратору'
  },
  'SYS_002': {
    code: 'SYS_002',
    message: 'Ошибка конфигурации',
    suggestion: 'Обратитесь к администратору системы'
  },
  'SYS_003': {
    code: 'SYS_003',
    message: 'Сервис недоступен',
    suggestion: 'Попробуйте позже'
  },
  'SYS_004': {
    code: 'SYS_004',
    message: 'Превышен лимит запросов',
    suggestion: 'Подождите и попробуйте позже'
  },
  'VAL_001': {
    code: 'VAL_001',
    message: 'Неверный формат запроса',
    suggestion: 'Проверьте данные и попробуйте снова'
  },
  'VAL_002': {
    code: 'VAL_002',
    message: 'Отсутствуют обязательные поля',
    suggestion: 'Заполните все необходимые поля'
  },
  'VAL_003': {
    code: 'VAL_003',
    message: 'Неверные значения полей',
    suggestion: 'Проверьте введенные данные'
  },
  'VAL_004': {
    code: 'VAL_004',
    message: 'Запрос слишком большой',
    suggestion: 'Уменьшите количество данных'
  }
};

export default function UserProfile() {
  const { user, isAuthenticated } = useRole();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError({
          code: 'AUTH_001',
          message: 'Токен не найден',
          suggestion: 'Пожалуйста, войдите в систему заново'
        });
        return;
      }

      const response = await api.getMe(token);
      
      if (response.error) {
        const errorCode = response.errorCode || 'SYS_001';
        setError(ERROR_DESCRIPTIONS[errorCode] || {
          code: errorCode,
          message: response.error,
          suggestion: 'Попробуйте позже или обратитесь к администратору'
        });
      } else if (response.data) {
        setUserData(response.data);
        setEditData({ email: response.data.email });
      }
    } catch (err) {
      setError({
        code: 'SYS_001',
        message: 'Ошибка загрузки данных',
        suggestion: 'Попробуйте позже или обратитесь к администратору'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError({
          code: 'AUTH_001',
          message: 'Токен не найден',
          suggestion: 'Пожалуйста, войдите в систему заново'
        });
        return;
      }

      const response = await api.updateMe(token, editData);
      
      if (response.error) {
        const errorCode = response.errorCode || 'SYS_001';
        setError(ERROR_DESCRIPTIONS[errorCode] || {
          code: errorCode,
          message: response.error,
          suggestion: 'Попробуйте позже или обратитесь к администратору'
        });
      } else if (response.data) {
        setUserData(response.data);
        setEditing(false);
      }
    } catch (err) {
      setError({
        code: 'SYS_001',
        message: 'Ошибка сохранения данных',
        suggestion: 'Попробуйте позже или обратитесь к администратору'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ email: userData?.email || '' });
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'admin': 'Администратор',
      'chief-hr': 'Главный HR',
      'hr': 'HR'
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Загрузка данных пользователя...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
            Ошибка {error.code}
          </h3>
          <p style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
            {error.message}
          </p>
          <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>
            <strong>Рекомендация:</strong> {error.suggestion}
          </p>
          <Button onClick={loadUserData} style={{ marginRight: '10px' }}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Данные пользователя не найдены</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Профиль пользователя</h2>
      
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Основная информация</h3>
          {!editing && (
            <Button onClick={() => setEditing(true)}>
              Редактировать
            </Button>
          )}
        </div>

        {editing ? (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Email:
              </label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                style={{ marginRight: '10px' }}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Имя пользователя:</strong>
              <div>{userData.username}</div>
            </div>
            <div>
              <strong>Email:</strong>
              <div>{userData.email}</div>
            </div>
            <div>
              <strong>Роль:</strong>
              <div>{getRoleDisplayName(userData.role)}</div>
            </div>
            <div>
              <strong>Статус:</strong>
              <div style={{ color: userData.is_active ? '#059669' : '#dc2626' }}>
                {userData.is_active ? 'Активен' : 'Неактивен'}
              </div>
            </div>
            <div>
              <strong>Дата создания:</strong>
              <div>{formatDate(userData.created_at)}</div>
            </div>
            <div>
              <strong>Последнее обновление:</strong>
              <div>{formatDate(userData.updated_at)}</div>
            </div>
            {userData.last_login && (
              <div>
                <strong>Последний вход:</strong>
                <div>{formatDate(userData.last_login)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        padding: '15px',
        fontSize: '14px',
        color: '#0369a1'
      }}>
        <strong>Отладочная информация:</strong>
        <pre style={{ 
          margin: '10px 0 0 0', 
          fontSize: '12px', 
          overflow: 'auto',
          backgroundColor: '#ffffff',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}>
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
