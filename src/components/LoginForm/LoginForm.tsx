'use client';
import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { type LoginRequest } from '@/lib/api';

interface LoginFormProps {
  onLoginSuccess: (email: string, role: string) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useRole();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        onLoginSuccess(formData.email, 'admin'); // Роль будет получена из контекста
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (error) {
      setError('Произошла ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="login-form" style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <div className="card" style={{
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Вход в систему CRM HR
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: '20px' }}>
            <label className="field__label">Email</label>
            <input
              type="email"
              className="field__input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="field" style={{ marginBottom: '24px' }}>
            <label className="field__label">Пароль</label>
            <input
              type="password"
              className="field__input"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center',
              padding: '8px',
              backgroundColor: '#fef2f2',
              borderRadius: '4px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0' }}>
            Введите ваши учетные данные для входа в систему
          </p>
        </div>
      </div>
    </div>
  );
} 