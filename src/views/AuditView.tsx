'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type AuditLog } from '@/types';
import Button from '@/components/Button/Button';
import Table from '@/components/Table/Table';
import Pagination from '@/components/Pagination/Pagination';
import { useRole } from '@/components/RoleProvider/RoleProvider';

interface AuditViewProps {
  role?: string;
}

export default function AuditView({ role }: AuditViewProps) {
  const { user } = useRole();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [tableFilter, setTableFilter] = useState<string>('');

  // Загрузка аудита
  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      // Моковые данные аудита
      const mockAuditLogs: AuditLog[] = [
        {
          id: '1',
          user_id: '1',
          action: 'LOGIN',
          table_name: 'users',
          record_id: '1',
          old_values: null,
          new_values: { last_login: '2024-01-15T10:00:00Z' },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          user_id: '1',
          action: 'CREATE',
          table_name: 'candidates',
          record_id: '1',
          old_values: null,
          new_values: {
            first_name: 'Иван',
            last_name: 'Петров',
            email: 'ivan.petrov@example.com',
            position: 'Frontend Developer'
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: '2024-01-15T10:15:00Z'
        },
        {
          id: '3',
          user_id: '2',
          action: 'UPDATE',
          table_name: 'candidates',
          record_id: '1',
          old_values: { status: 'NEW' },
          new_values: { status: 'REVIEWING' },
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          created_at: '2024-01-15T11:30:00Z'
        },
        {
          id: '4',
          user_id: '1',
          action: 'CREATE',
          table_name: 'staff',
          record_id: '1',
          old_values: null,
          new_values: {
            first_name: 'Анна',
            last_name: 'Иванова',
            email: 'anna.ivanova@company.com',
            position: 'Senior Frontend Developer',
            salary: 150000
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: '2024-01-15T14:45:00Z'
        },
        {
          id: '5',
          user_id: '2',
          action: 'LOGOUT',
          table_name: 'users',
          record_id: '2',
          old_values: null,
          new_values: null,
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          created_at: '2024-01-15T16:20:00Z'
        }
      ];

      // Фильтрация по поиску
      let filteredLogs = mockAuditLogs;
      if (searchTerm) {
        filteredLogs = mockAuditLogs.filter(log =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.record_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по действию
      if (actionFilter) {
        filteredLogs = filteredLogs.filter(log =>
          log.action === actionFilter
        );
      }

      // Фильтрация по таблице
      if (tableFilter) {
        filteredLogs = filteredLogs.filter(log =>
          log.table_name === tableFilter
        );
      }

      setAuditLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
    } catch (err) {
      setError('Ошибка загрузки аудита');
      console.error('Load audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [searchTerm, actionFilter, tableFilter]);

  const getActionBadge = (action: AuditLog['action']) => {
    const actionConfig = {
      'CREATE': { color: 'bg-green-100 text-green-800', text: 'Создание' },
      'UPDATE': { color: 'bg-blue-100 text-blue-800', text: 'Обновление' },
      'DELETE': { color: 'bg-red-100 text-red-800', text: 'Удаление' },
      'LOGIN': { color: 'bg-purple-100 text-purple-800', text: 'Вход' },
      'LOGOUT': { color: 'bg-gray-100 text-gray-800', text: 'Выход' }
    };

    const config = actionConfig[action];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatJson = (data: any) => {
    if (!data) return '-';
    return JSON.stringify(data, null, 2);
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Время',
      render: (log: AuditLog) => formatDate(log.created_at)
    },
    {
      key: 'action',
      label: 'Действие',
      render: (log: AuditLog) => getActionBadge(log.action)
    },
    {
      key: 'table_name',
      label: 'Таблица',
      render: (log: AuditLog) => log.table_name
    },
    {
      key: 'record_id',
      label: 'ID записи',
      render: (log: AuditLog) => log.record_id || '-'
    },
    {
      key: 'user_id',
      label: 'Пользователь',
      render: (log: AuditLog) => log.user_id || 'Система'
    },
    {
      key: 'ip_address',
      label: 'IP адрес',
      render: (log: AuditLog) => log.ip_address || '-'
    },
    {
      key: 'details',
      label: 'Детали',
      render: (log: AuditLog) => (
        <div className="max-w-xs">
          <details className="cursor-pointer">
            <summary className="text-blue-600 hover:text-blue-800">
              Показать детали
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <div><strong>Старые значения:</strong></div>
              <pre className="whitespace-pre-wrap">{formatJson(log.old_values)}</pre>
              <div className="mt-2"><strong>Новые значения:</strong></div>
              <pre className="whitespace-pre-wrap">{formatJson(log.new_values)}</pre>
            </div>
          </details>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка аудита...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Ошибка</div>
        <div className="text-red-600">{error}</div>
        <Button onClick={loadAuditLogs} className="mt-2">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Журнал аудита</h1>
        <Button onClick={loadAuditLogs}>
          Обновить
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
              placeholder="Поиск по действию, таблице или IP..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Действие
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все действия</option>
              <option value="CREATE">Создание</option>
              <option value="UPDATE">Обновление</option>
              <option value="DELETE">Удаление</option>
              <option value="LOGIN">Вход</option>
              <option value="LOGOUT">Выход</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Таблица
            </label>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все таблицы</option>
              <option value="users">users</option>
              <option value="candidates">candidates</option>
              <option value="staff">staff</option>
              <option value="audit_logs">audit_logs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица аудита */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={auditLogs}
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
          <div className="text-sm font-medium text-gray-500">Всего записей</div>
          <div className="text-2xl font-bold text-gray-900">{auditLogs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Созданий</div>
          <div className="text-2xl font-bold text-green-600">
            {auditLogs.filter(log => log.action === 'CREATE').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Обновлений</div>
          <div className="text-2xl font-bold text-blue-600">
            {auditLogs.filter(log => log.action === 'UPDATE').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Входов в систему</div>
          <div className="text-2xl font-bold text-purple-600">
            {auditLogs.filter(log => log.action === 'LOGIN').length}
          </div>
        </div>
      </div>
    </div>
  );
}
