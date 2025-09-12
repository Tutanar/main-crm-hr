'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm/LoginForm';
import { useRole } from '@/components/RoleProvider/RoleProvider';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading, login } = useRole();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLoginSuccess = (username: string, role: string) => {
    // Redirect to home after successful login
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
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will be redirected to home
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
