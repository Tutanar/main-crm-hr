'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm/LoginForm';
import { useRole } from '@/components/RoleProvider/RoleProvider';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading, login } = useRole();

  useEffect(() => {
    // Если уже аутентифицирован, перенаправляем на главную
    if (isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLoginSuccess = (username: string, role: string) => {
    // Перенаправляем на главную страницу после успешного входа
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Загрузка...
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Будет перенаправлено на главную
  }

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
