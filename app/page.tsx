'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/RoleProvider/RoleProvider';

export default function HomePage() {
  const { isAuthenticated, loading, role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (role) {
        // Перенаправляем на соответствующую страницу в зависимости от роли
        if (role === 'admin') {
          router.push('/admin/candidates');
        } else if (role === 'chief-hr') {
          router.push('/chief-hr/candidates');
        } else if (role === 'hr') {
          router.push('/hr/candidates');
        }
      }
    }
  }, [isAuthenticated, loading, role, router]);

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

  if (!isAuthenticated) {
    return null; // Будет перенаправлено на /login
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      Перенаправление...
    </div>
  );
}