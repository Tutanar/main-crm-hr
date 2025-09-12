'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type IpAllowlist } from '@/types';
import { Box, Button, Card, CardHeader, CardBody, Heading, Input, Stack, Table, Thead, Tbody, Tr, Td, Th, Text, Badge as ChakraBadge, Code } from '@chakra-ui/react';
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
  
  const [ipFilter, setIpFilter] = useState('');
  const [descFilter, setDescFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
      setIpList(ipListData);
      setTotalPages(Math.ceil(ipListData.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки IP списка');
      console.error('Load IP list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIpList();
  }, []);

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
      render: (item: IpAllowlist) => <Code>{item.ip_address}</Code>
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
        <ChakraBadge colorScheme={item.is_active ? 'green' : 'red'}>
          {item.is_active ? 'Активен' : 'Неактивен'}
        </ChakraBadge>
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
            variant={item.is_active ? 'outline' : 'solid'}
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
    <Box>
      <Card bg="bg.subtle" borderColor="border">
        <CardHeader display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">IP Allowlist</Heading>
          <Button variant="outline" onClick={() => setShowAddForm(true)}>Добавить IP адрес</Button>
        </CardHeader>
      </Card>

      {/* Форма добавления */}
      {showAddForm && (
        <Card mt={5} bg="bg.subtle" borderColor="border">
          <CardBody>
            <Heading size="sm" mb={3}>Добавить IP адрес</Heading>
            <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
              <Input placeholder="192.168.1.0/24" value={newIp.ip_address} onChange={(e)=>setNewIp({ ...newIp, ip_address: e.target.value })} />
              <Input placeholder="Описание IP адреса" value={newIp.description} onChange={(e)=>setNewIp({ ...newIp, description: e.target.value })} />
            </Stack>
            <Stack direction="row" gap={3} mt={4}>
              <Button colorScheme="brand" onClick={handleAddIp} disabled={!validateIpAddress(newIp.ip_address)}>Добавить</Button>
              <Button variant="outline" onClick={()=>{ setShowAddForm(false); setNewIp({ ip_address: '', description: '' }); }}>Отмена</Button>
            </Stack>
          </CardBody>
        </Card>
      )}

      {/* Таблица фильтров */}
      <Box mt={5} border="1px solid" borderColor="border" borderRadius="md" overflowX="auto">
        <Table size="sm" variant="outline" style={{ tableLayout: 'fixed', width: '100%' }}>
          <Tbody>
            <Tr>
              <Td width="12%"><Input size="sm" placeholder="IP" value={ipFilter} onChange={(e)=>setIpFilter(e.target.value)} /></Td>
              <Td width="15%"><Input size="sm" placeholder="Description" value={descFilter} onChange={(e)=>setDescFilter(e.target.value)} /></Td>
              <Td width="18%"><Input size="sm" placeholder="Status" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} /></Td>
              <Td width="20%" />
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Таблица IP списка */}
      <div className="table-container table-container--modern">
        <Table size="sm" variant="outline" style={{ tableLayout: 'fixed', width: '100%' }}>
          <Thead>
            <Tr>
              {columns.map((c) => (
                <Th key={c.key}>{c.label}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {ipList
              .filter(r => (ipFilter ? r.ip_address.toLowerCase().includes(ipFilter.toLowerCase()) : true))
              .filter(r => (descFilter ? (r.description || '').toLowerCase().includes(descFilter.toLowerCase()) : true))
              .filter(r => (statusFilter ? (statusFilter==='active'?r.is_active:!r.is_active) : true))
              .map((row) => (
                <Tr key={row.id}>
                  {columns.map((c) => (
                    <Td key={c.key}>{c.render(row) as any}</Td>
                  ))}
                </Tr>
              ))}
          </Tbody>
        </Table>
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
          <div className="stats-label">Всего IP адресов</div>
          <div className="stats-value">{ipList.length}</div>
        </div>
        <div className="stats-card stats-card--green">
          <div className="stats-label">Активные</div>
          <div className="stats-value stats-value--green">
            {ipList.filter(item => item.is_active).length}
          </div>
        </div>
        <div className="stats-card stats-card--red">
          <div className="stats-label">Неактивные</div>
          <div className="stats-value stats-value--red">
            {ipList.filter(item => !item.is_active).length}
          </div>
        </div>
      </div>
    </Box>
  );
}
