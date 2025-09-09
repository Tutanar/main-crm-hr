'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type User } from '@/types';
import Button from '@/components/Button/Button';
import Table from '@/components/Table/Table';
import Pagination from '@/components/Pagination/Pagination';
import { useRole } from '@/components/RoleProvider/RoleProvider';

interface UsersViewProps {
  role?: string;
}

export default function UsersView({ role }: UsersViewProps) {
  const { user } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Загрузка пользователей
  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      // Моковые данные пользователей
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@company.com',
          role: 'admin',
          is_active: true,
          created_at: '2023-01-01T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: '1'
        },
        {
          id: '2',
          username: 'chief-hr',
          email: 'chief-hr@company.com',
          role: 'chief-hr',
          is_active: true,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: '1'
        },
        {
          id: '3',
          username: 'hr1',
          email: 'hr1@company.com',
          role: 'hr',
          is_active: true,
          created_at: '2023-02-01T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: '2'
        },
        {
          id: '4',
          username: 'hr2',
          email: 'hr2@company.com',
          role: 'hr',
          is_active: false,
          created_at: '2023-02-15T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z',
          created_by: '2'
        }
      ];

      // Фильтрация по поиску
      let filteredUsers = mockUsers;
      if (searchTerm) {
        filteredUsers = mockUsers.filter(user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по роли
      if (roleFilter) {
        filteredUsers = filteredUsers.filter(user =>
          user.role === roleFilter
        );
      }

      // Фильтрация по статусу
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        filteredUsers = filteredUsers.filter(user =>
          user.is_active === isActive
        );
      }

      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 10));
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      // Здесь будет реальный API запрос
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, is_active: isActive, updated_at: new Date().toISOString() }
          : user
      ));
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'admin': 'Администратор',
      'chief-hr': 'Главный HR',
      'hr': 'HR'
    };
    return roleNames[role] || role;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'admin': { color: 'bg-red-100 text-red-800', text: 'Администратор' },
      'chief-hr': { color: 'bg-blue-100 text-blue-800', text: 'Главный HR' },
      'hr': { color: 'bg-green-100 text-green-800', text: 'HR' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-100 text-gray-800', text: role };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const columns = [
    {
      key: 'username',
      label: 'Имя пользователя',
      render: (user: User) => user.username
    },
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => user.email
    },
    {
      key: 'role',
      label: 'Роль',
      render: (user: User) => getRoleBadge(user.role)
    },
    {
      key: 'status',
      label: 'Статус',
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.is_active ? 'Активен' : 'Неактивен'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Дата создания',
      render: (user: User) => formatDate(user.created_at)
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusToggle(user.id, !user.is_active)}
            variant={user.is_active ? 'outline' : 'primary'}
          >
            {user.is_active ? 'Деактивировать' : 'Активировать'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {/* Редактировать */}}
          >
            Редактировать
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка пользователей...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Ошибка</div>
        <div className="text-red-600">{error}</div>
        <Button onClick={loadUsers} className="mt-2">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <Button>
          Добавить пользователя
        </Button>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени пользователя или email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все роли</option>
              <option value="admin">Администратор</option>
              <option value="chief-hr">Главный HR</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={users}
          columns={columns}
          loading={loading}
        />
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Всего пользователей</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Администраторы</div>
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">HR</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'hr').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Активные</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.is_active).length}
          </div>
        </div>
      </div>
    </div>
  );
}
