'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { role, isAuthenticated, loading,  logout } = useRole();
  const router = useRouter();

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

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
         
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