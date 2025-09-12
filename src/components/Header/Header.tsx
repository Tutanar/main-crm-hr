'use client';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@chakra-ui/react';
import { IconButton } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: (isCollapsed: boolean) => void;
}

export default function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { role, isAuthenticated, loading,  logout, user } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();

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

  const handleProfileClick = () => {
    router.push('/profile');
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

        <div className="header__center">
          <h1 className="header__title">CRM HR System</h1>
          <IconButton
            aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={colorMode === 'light' ? 'Dark mode' : 'Light mode'}
            variant="outline"
            size="sm"
            bg="transparent"
            onClick={toggleColorMode}
            icon={<Box as="span" fontSize="lg" lineHeight="1">{colorMode === 'light' ? '🌞' : '🌙'}</Box>}
          />
        </div>
        
        <div className="header__right">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Открыть профиль"
              title="Профиль"
              variant="outline"
              size="sm"
              borderRadius="full"
              icon={<Box as="span" fontSize="md" lineHeight="1">👤</Box>}
            />
            <MenuList>
              <MenuItem isDisabled>{(user && (user.full_name || user.username || user.email)) }</MenuItem>
              <MenuItem onClick={() => router.push('/2fa')}>Two‑Factor Auth</MenuItem>
              <MenuItem onClick={logout}>Log out</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </header>
  );
}