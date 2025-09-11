'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/Button/Button';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: (isCollapsed: boolean) => void;
}

export default function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { role, isAuthenticated, loading,  logout } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  if (loading || !isAuthenticated || !role) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'CHIEF_HR':
        return 'Главный HR';
      case 'HR':
        return 'HR специалист';
      default:
        return role;
    }
  };

  const handleToggleSidebar = () => {
    onToggleSidebar(!isSidebarCollapsed);
  };

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
          <button 
            className="header__sidebar-toggle" 
            onClick={handleToggleSidebar}
            aria-label={isSidebarCollapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
          >
            {isSidebarCollapsed ? (
              // 3 линии когда свернуто
              <svg 
                className="header__toggle-icon"
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            ) : (
              // Крестик когда развернуто
              <svg 
                className="header__toggle-icon"
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
        
        <div className="header__right">
          <div className="header__user-info">
            <h1 className="header__title">CRM HR System</h1>
            <span className="header__role">{getRoleDisplayName(role)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}