'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type IpAllowlist } from '@/types';
import Button from '@/components/Button/Button';
import Table from '@/components/Table/Table';
import Pagination from '@/components/Pagination/Pagination';
import { useRole } from '@/components/RoleProvider/RoleProvider';

interface IpAllowlistViewProps {
  role?: string;
}

export default function IpAllowlistView({ role }: IpAllowlistViewProps) {
  const { user } = useRole();
  const [ipList, setIpList] = useState<IpAllowlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIp, setNewIp] = useState({ ip_address: '', description: '' });

  // Загрузка IP списка
  const loadIpList = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      // Загружаем данные из API
      const response = await fetch('/api/ip-allowlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки IP списка');
      }

      const data = await response.json();
      const ipListData = data.data || [];

      // Фильтрация по поиску
      let filteredList = ipListData;
      if (searchTerm) {
        filteredList = ipListData.filter((item: IpAllowlist) =>
          item.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по статусу
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        filteredList = filteredList.filter((item: IpAllowlist) =>
          item.is_active === isActive
        );
      }

      setIpList(filteredList);
      setTotalPages(Math.ceil(filteredList.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки IP списка');
      console.error('Load IP list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIpList();
  }, [searchTerm, statusFilter]);

  const handleStatusToggle = async (ipId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('/api/ip-allowlist', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ipId,
          is_active: isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления статуса');
      }

      // Обновляем локальное состояние
      setIpList(prev => prev.map(item =>
        item.id === ipId
          ? { ...item, is_active: isActive }
          : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса');
      console.error('Status toggle error:', err);
    }
  };

  const handleAddIp = async () => {
    if (!newIp.ip_address.trim()) {
      setError('IP адрес обязателен');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('/api/ip-allowlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip_address: newIp.ip_address,
          description: newIp.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка добавления IP адреса');
      }

      const data = await response.json();
      
      // Обновляем локальное состояние
      setIpList(prev => [data.data, ...prev]);
      setNewIp({ ip_address: '', description: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления IP адреса');
      console.error('Add IP error:', err);
    }
  };

  const handleDeleteIp = async (ipId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот IP адрес?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`/api/ip-allowlist?id=${ipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка удаления IP адреса');
      }

      // Обновляем локальное состояние
      setIpList(prev => prev.filter(item => item.id !== ipId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления IP адреса');
      console.error('Delete IP error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const validateIpAddress = (ip: string) => {
    // Простая валидация IP адреса или CIDR
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    return ipRegex.test(ip);
  };

  const columns = [
    {
      key: 'ip_address',
      label: 'IP адрес',
      render: (item: IpAllowlist) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          {item.ip_address}
        </code>
      )
    },
    {
      key: 'description',
      label: 'Описание',
      render: (item: IpAllowlist) => item.description || '-'
    },
    {
      key: 'status',
      label: 'Статус',
      render: (item: IpAllowlist) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.is_active ? 'Активен' : 'Неактивен'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Дата создания',
      render: (item: IpAllowlist) => formatDate(item.created_at)
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (item: IpAllowlist) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusToggle(item.id, !item.is_active)}
            variant={item.is_active ? 'outline' : 'primary'}
          >
            {item.is_active ? 'Деактивировать' : 'Активировать'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteIp(item.id)}
            className="text-red-600 hover:text-red-800"
          >
            Удалить
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка IP списка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Ошибка</div>
        <div className="text-red-600">{error}</div>
        <Button onClick={loadIpList} className="mt-2">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">IP Allowlist</h1>
        <Button onClick={() => setShowAddForm(true)}>
          Добавить IP адрес
        </Button>
      </div>

      {/* Форма добавления */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Добавить IP адрес</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP адрес (CIDR)
              </label>
              <input
                type="text"
                value={newIp.ip_address}
                onChange={(e) => setNewIp({ ...newIp, ip_address: e.target.value })}
                placeholder="192.168.1.0/24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <input
                type="text"
                value={newIp.description}
                onChange={(e) => setNewIp({ ...newIp, description: e.target.value })}
                placeholder="Описание IP адреса"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleAddIp}
              disabled={!validateIpAddress(newIp.ip_address)}
            >
              Добавить
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddForm(false);
                setNewIp({ ip_address: '', description: '' });
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по IP адресу или описанию..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

      {/* Таблица IP списка */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={ipList}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Всего IP адресов</div>
          <div className="text-2xl font-bold text-gray-900">{ipList.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Активные</div>
          <div className="text-2xl font-bold text-green-600">
            {ipList.filter(item => item.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Неактивные</div>
          <div className="text-2xl font-bold text-red-600">
            {ipList.filter(item => !item.is_active).length}
          </div>
        </div>
      </div>
    </div>
  );
}
