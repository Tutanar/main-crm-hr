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

      // Реальный API запрос к Hasura
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки пользователей');
      }

      const data = await response.json();
      const usersData = data.data || [];

      // Фильтрация по поиску
      let filteredUsers = usersData;
      if (searchTerm) {
        filteredUsers = usersData.filter((user: User) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по роли
      if (roleFilter) {
        filteredUsers = filteredUsers.filter((user: User) =>
          user.role === roleFilter
        );
      }

      // Фильтрация по статусу
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        filteredUsers = filteredUsers.filter((user: User) =>
          user.is_active === isActive
        );
      }

      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки пользователей');
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          is_active: isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления статуса');
      }

      // Обновляем локальное состояние
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, is_active: isActive, updated_at: new Date().toISOString() }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса');
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
    <div className="content-container">
      <div className="page-header">
        <h1 className="page-title">Пользователи</h1>
        <div className="page-actions">
          <Button>
            Добавить пользователя
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-field">
            <label className="filter-label">
              Поиск
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени пользователя или email..."
              className="filter-input filter-input--search"
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">
              Роль
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Все роли</option>
              <option value="admin">Администратор</option>
              <option value="chief-hr">Главный HR</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="table-container table-container--modern">
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
      <div className="stats-container">
        <div className="stats-card stats-card--gradient">
          <div className="stats-label">Всего пользователей</div>
          <div className="stats-value">{users.length}</div>
        </div>
        <div className="stats-card stats-card--red">
          <div className="stats-label">Администраторы</div>
          <div className="stats-value stats-value--red">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="stats-card stats-card--green">
          <div className="stats-label">HR</div>
          <div className="stats-value stats-value--green">
            {users.filter(u => u.role === 'hr').length}
          </div>
        </div>
        <div className="stats-card stats-card--blue">
          <div className="stats-label">Активные</div>
          <div className="stats-value stats-value--blue">
            {users.filter(u => u.is_active).length}
          </div>
        </div>
      </div>
    </div>
  );
}
