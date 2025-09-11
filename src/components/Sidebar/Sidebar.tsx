// src/components/Sidebar/Sidebar.tsx
'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: (isCollapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { role, isAuthenticated, loading } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  if (loading || !isAuthenticated || !role) {
    return null;
  }

  const menuItems = [];

  // Добавляем пункты меню в зависимости от роли
  if (role === 'admin') {
    menuItems.push(
      { label: 'Кандидаты', href: '/admin/candidates' },
      { label: 'Сотрудники', href: '/admin/employees' },
      { label: 'Пользователи', href: '/admin/users' },
      { label: 'Аудит', href: '/admin/audit' },
      { label: 'IP Allowlist', href: '/admin/ip-allowlist' }
    );
  } else if (role === 'chief-hr') {
    menuItems.push(
      { label: 'Кандидаты', href: '/chief-hr/candidates' },
      { label: 'Сотрудники', href: '/chief-hr/staff' }
    );
  } else if (role === 'hr') {
    menuItems.push(
      { label: 'Кандидаты', href: '/hr/candidates' },
      { label: 'Сотрудники', href: '/hr/staff' }
    );
  }

  console.log('Sidebar Debug:', { role, menuItems, pathname });

  // No common menu items - only role-specific ones

  const handleLogout = async () => {
    // Используем logout из контекста
    const { logout } = useRole();
    await logout();
    router.push('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.href} className="sidebar__item">
              <button 
                onClick={() => router.push(item.href)}
                className={`sidebar__link ${pathname === item.href ? 'sidebar__link--active' : ''}`}
              >
                <span className="sidebar__link-text">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button 
          className="sidebar__logout" 
          onClick={handleLogout}
          aria-label="Выйти из системы"
        >
          <svg className="sidebar__logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="sidebar__logout-text">Выйти</span>
        </button>
      </div>
    </aside>
  );
}
