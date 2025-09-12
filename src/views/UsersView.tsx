'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type User } from '@/types';
import { Box, Button, Card, CardHeader, CardBody, Heading, Input, Stack, Table, Thead, Tbody, Tr, Td, Th, Text, Badge as ChakraBadge, TableContainer } from '@chakra-ui/react';
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

  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Token not found');
        return;
      }

      // Real API request to Hasura
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load users');
      }

      const data = await response.json();
      const usersData = data.data || [];
      setUsers(usersData);
      setTotalPages(Math.ceil(usersData.length / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Token not found');
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
        throw new Error(errorData.error || 'Failed to update status');
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, is_active: isActive, updated_at: new Date().toISOString() }
          : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Status toggle error:', err);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'admin': 'Administrator',
      'chief-hr': 'Chief HR',
      'hr': 'HR',
    };
    return roleNames[role] || role;
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = { admin: 'red', 'chief-hr': 'blue', hr: 'green' };
    const scheme = map[role] || 'gray';
    return <ChakraBadge colorScheme={scheme}>{getRoleDisplayName(role)}</ChakraBadge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Full name',
      render: (user: User) => user.full_name
    },
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => user.email
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => getRoleBadge(user.role)
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <ChakraBadge colorScheme={user.is_active ? 'green' : 'red'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </ChakraBadge>
      )
    },
    {
      key: 'created_at',
      label: 'Created at',
      render: (user: User) => formatDate(user.created_at)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusToggle(user.id, !user.is_active)}
            variant={user.is_active ? 'outline' : 'solid'}
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {/* Edit */}}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error</div>
        <div className="text-red-600">{error}</div>
        <Button onClick={loadUsers} className="mt-2">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <Box>
      <Card bg="bg.subtle" borderColor="border">
        <CardHeader display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">Users</Heading>
          <Button variant="outline">Add user</Button>
        </CardHeader>
      </Card>

      {/* Filters */}
      {/* Table filters */}
      <Box mt={2} border="1px solid" borderColor="border" borderRadius="md" overflowX="auto">
        <Table size="sm" variant="filter">
          <Tbody>
            <Tr>
              <Td width="10%"><Input size="sm" placeholder="Name" value={nameFilter} onChange={(e)=>setNameFilter(e.target.value)} /></Td>
              <Td width="10%"><Input size="sm" placeholder="Email" value={emailFilter} onChange={(e)=>setEmailFilter(e.target.value)} /></Td>
              <Td width="10%"><Input size="sm" placeholder="Role" value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)} /></Td>
              <Td width="10%"><Input size="sm" placeholder="Status" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} /></Td>
              <Td width="18%" />
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Users table */}
      <TableContainer 
        mt={2} 
        bg="bg.subtle" 
        border="1px solid" 
        borderColor="border" 
        borderRadius="md" 
        h="675px" 
        overflowY="auto"
        overflowX="auto"
        sx={{}}
      >
        <Table size="content" variant="content">
          <Thead>
            <Tr bg="bg.subtle">
              {columns.map((c) => (
                <Th key={c.key}>{c.label}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {users
              .filter(u => (nameFilter ? u.full_name.toLowerCase().includes(nameFilter.toLowerCase()) : true))
              .filter(u => (emailFilter ? u.email.toLowerCase().includes(emailFilter.toLowerCase()) : true))
              .filter(u => (roleFilter ? u.role.toLowerCase().includes(roleFilter.toLowerCase()) : true))
              .filter(u => (statusFilter ? (statusFilter==='active'?u.is_active:!u.is_active) : true))
              .map((u) => (
                <Tr key={u.id} _hover={{ bg: 'bg.subtle' }}>
                  {columns.map((c) => (
                    <Td key={c.key}>{c.render(u) as any}</Td>
                  ))}
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Stats */}
      
    </Box>
  );
}
