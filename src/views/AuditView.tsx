'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type AuditLog } from '@/types';
import { Button, Table, Badge as ChakraBadge, Box, Input } from '@chakra-ui/react';
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
  const [idFilter, setIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [recordFilter, setRecordFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');

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
      setAuditLogs(auditLogsData);
      setTotalPages(Math.ceil(auditLogsData.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки аудита');
      console.error('Load audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const getActionBadge = (action: AuditLog['action']) => {
    const map: Record<AuditLog['action'], string> = {
      CREATE: 'green', UPDATE: 'blue', DELETE: 'red', LOGIN: 'purple', LOGOUT: 'gray'
    };
    return <ChakraBadge colorScheme={map[action]}>{action}</ChakraBadge>;
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h1 className="page-title">Журнал аудита</h1>
        <Button onClick={loadAuditLogs}>Обновить</Button>
      </Box>

      {/* Таблица фильтров */}
      <Box mt={5} border="1px solid" borderColor="border" borderRadius="md" overflowX="auto">
        <Table.Root size="sm" variant="outline" css={{ tableLayout:'fixed', width:'100%' }}>
          <Table.Body>
            <Table.Row>
              <Table.Cell width="16%"><Input size="sm" placeholder="Action" value={actionFilter} onChange={(e)=>setActionFilter(e.target.value)} /></Table.Cell>
              <Table.Cell width="18%"><Input size="sm" placeholder="Table" value={tableFilter} onChange={(e)=>setTableFilter(e.target.value)} /></Table.Cell>
              <Table.Cell width="16%"><Input size="sm" placeholder="Record ID" value={recordFilter} onChange={(e)=>setRecordFilter(e.target.value)} /></Table.Cell>
              <Table.Cell width="16%"><Input size="sm" placeholder="User" value={userFilter} onChange={(e)=>setUserFilter(e.target.value)} /></Table.Cell>
              <Table.Cell width="16%"><Input size="sm" placeholder="IP" value={ipFilter} onChange={(e)=>setIpFilter(e.target.value)} /></Table.Cell>
              <Table.Cell width="18%" />
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Таблица аудита */}
      <div className="table-container table-container--modern">
        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row>
              {columns.map((c) => (
                <Table.ColumnHeader key={c.key}>{c.label}</Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {auditLogs
              .filter(r => (actionFilter ? r.action.toLowerCase().includes(actionFilter.toLowerCase()) : true))
              .filter(r => (tableFilter ? r.table_name.toLowerCase().includes(tableFilter.toLowerCase()) : true))
              .filter(r => (recordFilter ? (r.record_id||'').toLowerCase().includes(recordFilter.toLowerCase()) : true))
              .filter(r => (userFilter ? (r.user_id||'').toLowerCase().includes(userFilter.toLowerCase()) : true))
              .filter(r => (ipFilter ? (r.ip_address||'').toLowerCase().includes(ipFilter.toLowerCase()) : true))
              .map((row) => (
              <Table.Row key={row.id}>
                {columns.map((c) => (
                  <Table.Cell key={c.key}>{c.render(row) as any}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
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
    </Box>
  );
}
