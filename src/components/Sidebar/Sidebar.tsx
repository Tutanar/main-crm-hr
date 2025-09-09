// src/components/Sidebar/Sidebar.tsx
'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const { role, isAuthenticated, loading } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading || !isAuthenticated || !role) {
    return null;
  }

  const menuItems = [];

  // Добавляем пункты меню в зависимости от роли
  if (role === 'admin') {
    menuItems.push(
      { label: 'Кандидаты', href: '/admin/candidates' },
      { label: 'Сотрудники', href: '/admin/staff' },
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

  // Добавляем общие пункты меню
  menuItems.push(
    { label: 'Профиль', href: '/profile' },
    { label: 'Тест Hasura', href: '/hasura-test' }
  );

  const handleLogout = async () => {
    // Используем logout из контекста
    const { logout } = useRole();
    await logout();
    router.push('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <h3 className="sidebar__title">CRM HR</h3>
        <button 
          className="sidebar__toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.href} className="sidebar__item">
              <a 
                href={item.href}
                className={`sidebar__link ${pathname === item.href ? 'sidebar__link--active' : ''}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button 
          className="sidebar__logout" 
          onClick={handleLogout}
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
