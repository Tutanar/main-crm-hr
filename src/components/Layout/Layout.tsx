'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { role, isAuthenticated, loading } = useRole();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  useEffect(() => {
    console.log('Layout Debug:', { loading, isAuthenticated, role });
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to login - not authenticated');
      router.push('/login');
    }
  }, [loading, isAuthenticated, router, role]);

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
      <Header 
        isSidebarCollapsed={isSidebarCollapsed} 
        onToggleSidebar={handleToggleSidebar} 
      />
      <div className="layout__content">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />
        <main className={`layout__main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
