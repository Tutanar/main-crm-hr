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

      // Реальный API запрос к Hasura
      const response = await fetch('/api/audit', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки аудита');
      }

      const data = await response.json();
      const auditLogsData = data.data || [];

      // Фильтрация по поиску
      let filteredLogs = auditLogsData;
      if (searchTerm) {
        filteredLogs = auditLogsData.filter((log: AuditLog) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.record_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по действию
      if (actionFilter) {
        filteredLogs = filteredLogs.filter((log: AuditLog) =>
          log.action === actionFilter
        );
      }

      // Фильтрация по таблице
      if (tableFilter) {
        filteredLogs = filteredLogs.filter((log: AuditLog) =>
          log.table_name === tableFilter
        );
      }

      setAuditLogs(filteredLogs);
      setTotalPages(Math.ceil(filteredLogs.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки аудита');
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
    <div className="content-container">
      <div className="page-header">
        <h1 className="page-title">Журнал аудита</h1>
        <div className="page-actions">
          <Button onClick={loadAuditLogs}>
            Обновить
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
              placeholder="Поиск по действию, таблице или IP..."
              className="filter-input filter-input--search"
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">
              Действие
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Все действия</option>
              <option value="CREATE">Создание</option>
              <option value="UPDATE">Обновление</option>
              <option value="DELETE">Удаление</option>
              <option value="LOGIN">Вход</option>
              <option value="LOGOUT">Выход</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">
              Таблица
            </label>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="filter-select"
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
      <div className="table-container table-container--modern">
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
      <div className="stats-container">
        <div className="stats-card stats-card--gradient">
          <div className="stats-label">Всего записей</div>
          <div className="stats-value">{auditLogs.length}</div>
        </div>
        <div className="stats-card stats-card--green">
          <div className="stats-label">Созданий</div>
          <div className="stats-value stats-value--green">
            {auditLogs.filter(log => log.action === 'CREATE').length}
          </div>
        </div>
        <div className="stats-card stats-card--blue">
          <div className="stats-label">Обновлений</div>
          <div className="stats-value stats-value--blue">
            {auditLogs.filter(log => log.action === 'UPDATE').length}
          </div>
        </div>
        <div className="stats-card stats-card--purple">
          <div className="stats-label">Входов в систему</div>
          <div className="stats-value stats-value--purple">
            {auditLogs.filter(log => log.action === 'LOGIN').length}
          </div>
        </div>
      </div>
    </div>
  );
}
