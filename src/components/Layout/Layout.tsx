'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { role, isAuthenticated, loading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '40px'}}>
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{textAlign: 'center', padding: '40px'}}>
        Перенаправление на страницу входа...
      </div>
    );
  }

  if (!role) {
    return (
      <div style={{textAlign: 'center', padding: '40px'}}>
        Роль не определена. Перейдите на <a href="/login" className="header__link">/login</a>
      </div>
    );
  }

  return (
    <div className="layout">
      <Header />
      <div className="layout__content">
        <Sidebar />
        <main className="layout__main">
          {children}
        </main>
      </div>
    </div>
  );
}
