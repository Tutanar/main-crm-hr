'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/Button/Button';

export default function HasuraTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Тестирование подключения к системе...');
    
    try {
      // Сначала проверяем здоровье системы
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      
      if (healthData.status !== 'healthy') {
        setResult(`❌ Система нездорова: ${JSON.stringify(healthData, null, 2)}`);
        return;
      }
      
      setResult('✅ Система здорова! Тестируем аутентификацию...');
      
      // Тестируем аутентификацию
      const loginResponse = await api.auth.login({ username: 'admin', password: 'admin123' });
      
      if (loginResponse.data) {
        setResult(`✅ Успешно! Пользователь: ${loginResponse.data.user.username}, Роль: ${loginResponse.data.user.role}\n\nДетали системы:\n${JSON.stringify(healthData, null, 2)}`);
      } else {
        setResult(`❌ Ошибка аутентификации: ${loginResponse.error}\n\nДетали системы:\n${JSON.stringify(healthData, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Ошибка подключения: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Тест подключения к системе</h2>
      <p>Нажмите кнопку для тестирования подключения к Hasura GraphQL API и проверки всех сервисов</p>
      
      <div style={{ marginBottom: '20px' }}>
        <Button 
          onClick={testConnection} 
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          {loading ? 'Тестирование...' : 'Тестировать систему'}
        </Button>
        <Button 
          onClick={() => window.location.href = '/profile'}
          style={{ backgroundColor: '#059669' }}
        >
          Перейти к профилю
        </Button>
      </div>
      
      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          fontSize: '12px',
          maxHeight: '500px',
          overflow: 'auto'
        }}>
          {result}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>Доступные API endpoints:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><code>GET /api/health</code> - Проверка здоровья системы</li>
          <li><code>POST /api/login</code> - Аутентификация пользователя</li>
          <li><code>POST /api/validate</code> - Валидация JWT токена</li>
          <li><code>GET /api/me</code> - Получение данных пользователя</li>
          <li><code>POST /api/me</code> - Обновление данных пользователя</li>
        </ul>
      </div>
    </div>
  );
}