'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Card, CardHeader, CardBody, Heading, Input, Stack, Badge, Text, Table, Thead, Tbody, Tr, Td, Th, TableContainer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Select, Textarea, useDisclosure, useToast } from '@chakra-ui/react';

// Types
interface Employee {
  id: number;
  name: string;
  phone?: string;
  iban?: string;
  registration_date: string;
  status_code: string;
  status_name: string;
  comment?: string;
  last_comment_date?: string;
  segment_code: string;
  segment_name: string;
  team_code: string;
  team_name: string;
  language_code: string;
  language_name: string;
  source_code: string;
  source_name: string;
  created_at: string;
  updated_at: string;
}

export default function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  // Filters
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchIban, setSearchIban] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchSegment, setSearchSegment] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [searchComment, setSearchComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIban, setFormIban] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'terminated' | ''>('');
  const [formComment, setFormComment] = useState('');

  // Load employees
  const loadEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        type: 'employees',
      });

      // server returns page slice; client-side filtering below

      const response = await fetch(`/api/people?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error loading employees');
      }

      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data || []);
        setTotalCount(data.total || 0);
      } else {
        throw new Error(data.error || 'Error getting data');
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when search/page changes
  useEffect(() => {
    loadEmployees();
  }, [currentPage]);

  // Derived filtered data client-side
  const filtered = employees.filter((e) => {
    const byId = searchId ? String(e.id).includes(searchId) : true;
    const byName = searchName ? e.name.toLowerCase().includes(searchName.toLowerCase()) : true;
    const byPhone = searchPhone ? (e.phone || '').toLowerCase().includes(searchPhone.toLowerCase()) : true;
    const byIban = searchIban ? (e.iban || '').toLowerCase().includes(searchIban.toLowerCase()) : true;
    const byStatus = searchStatus ? e.status_name.toLowerCase().includes(searchStatus.toLowerCase()) : true;
    const bySegment = searchSegment ? e.segment_name.toLowerCase().includes(searchSegment.toLowerCase()) : true;
    const byTeam = searchTeam ? e.team_name.toLowerCase().includes(searchTeam.toLowerCase()) : true;
    const byLanguage = searchLanguage ? e.language_name.toLowerCase().includes(searchLanguage.toLowerCase()) : true;
    const bySource = searchSource ? e.source_name.toLowerCase().includes(searchSource.toLowerCase()) : true;
    const byComment = searchComment ? (e.comment || '').toLowerCase().includes(searchComment.toLowerCase()) : true;
    return byId && byName && byPhone && byIban && byStatus && bySegment && byTeam && byLanguage && bySource && byComment;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (statusCode: string) => {
    switch (statusCode.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'terminated':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Actions
  const handleEdit = (id: number) => {
    const employee = employees.find((emp) => emp.id === id);
    if (!employee) return;
    setEditingEmployee(employee);
    setFormName(employee.name || '');
    setFormPhone(employee.phone || '');
    setFormIban(employee.iban || '');
    const normalized = employee.status_code?.toLowerCase() as 'active' | 'inactive' | 'terminated' | '';
    setFormStatus(normalized || '');
    setFormComment(employee.comment || '');
    onOpen();
  };

  const handleDelete = (id: number) => {
    if (confirm('Удалить этого сотрудника?')) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast({ title: 'Сотрудник удалён (локально)', status: 'info', duration: 2000 });
    }
  };

  const handleSave = () => {
    if (!editingEmployee) return;
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === editingEmployee.id
          ? {
              ...e,
              name: formName,
              phone: formPhone || undefined,
              status_code: formStatus || e.status_code,
              status_name:
                formStatus === 'active'
                  ? 'Active'
                  : formStatus === 'inactive'
                  ? 'Inactive'
                  : formStatus === 'terminated'
                  ? 'Terminated'
                  : e.status_name,
              iban: formIban || undefined,
              comment: formComment || undefined,
              updated_at: new Date().toISOString(),
            }
          : e
      )
    );
    toast({ title: 'Изменения сохранены (локально)', status: 'success', duration: 2000 });
    onClose();
    setEditingEmployee(null);
  };

  return (
    <>
    <Box>
      {/* Header */}
      <Card bg="bg.subtle" borderColor="border">
        <CardHeader display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">Employees</Heading>
          <Text color="fg.muted">Total: {totalCount} employees</Text>
        </CardHeader>
      </Card>

      {/* Removed top search */}

      {/* Error */}
      {error && (
        <Card mt={5} bg="red.50" borderColor="red.200">
          <CardBody textAlign="center">
            <Text color="red.600" mb={3}>{error}</Text>
            <Button colorScheme="red" onClick={loadEmployees}>Try Again</Button>
          </CardBody>
        </Card>
      )}

      {/* Loading */}
      {loading ? (
        <Card mt={5} textAlign="center" p={10}>
          <CardBody>Loading employees...</CardBody>
        </Card>
      ) : (
        <>
          {/* Filters table (separate) */}
          <Box mt={5} border="1px solid" borderColor="border" borderRadius="md" overflowX="auto">
            <Table size="sm" variant="filter" minW="1500px">
              <Tbody>
                <Tr>
                  <Td width="8%" />
                  <Td width="6%"><Input size="sm" placeholder="ID" value={searchId} onChange={(e)=>setSearchId(e.target.value)} /></Td>
                  <Td width="16%"><Input size="sm" placeholder="Name" value={searchName} onChange={(e)=>setSearchName(e.target.value)} /></Td>
                  <Td width="12%"><Input size="sm" placeholder="Phone" value={searchPhone} onChange={(e)=>setSearchPhone(e.target.value)} /></Td>
                  <Td width="14%"><Input size="sm" placeholder="IBAN" value={searchIban} onChange={(e)=>setSearchIban(e.target.value)} /></Td>
                  <Td width="12%" />
                  <Td width="10%"><Input size="sm" placeholder="Status" value={searchStatus} onChange={(e)=>setSearchStatus(e.target.value)} /></Td>
                  <Td width="10%"><Input size="sm" placeholder="Segment" value={searchSegment} onChange={(e)=>setSearchSegment(e.target.value)} /></Td>
                  <Td width="8%"><Input size="sm" placeholder="Team" value={searchTeam} onChange={(e)=>setSearchTeam(e.target.value)} /></Td>
                  <Td width="10%"><Input size="sm" placeholder="Language" value={searchLanguage} onChange={(e)=>setSearchLanguage(e.target.value)} /></Td>
                  <Td width="8%"><Input size="sm" placeholder="Source" value={searchSource} onChange={(e)=>setSearchSource(e.target.value)} /></Td>
                  <Td><Input size="sm" placeholder="Comment" value={searchComment} onChange={(e)=>setSearchComment(e.target.value)} /></Td>
                  <Td width="6%" />
                </Tr>
              </Tbody>
            </Table>
          </Box>

          {/* Employees Table */}
          {filtered.length === 0 ? (
            <Box mt={2} textAlign="center" p={10} bg="bg.default" border="1px solid" borderColor="border" borderRadius="md">
              <Text>No employees found</Text>
            </Box>
          ) : (
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
              <Table size="content" variant="content" minW="1500px">
                <Thead>
                  <Tr bg="bg.subtle">
                    <Th width="8%"></Th>
                    <Th width="6%">ID</Th>
                    <Th width="16%">Name</Th>
                    <Th width="12%">Phone</Th>
                    <Th width="14%">IBAN</Th>
                    <Th width="12%">Registered</Th>
                    <Th width="10%">Status</Th>
                    <Th width="10%">Segment</Th>
                    <Th width="8%">Team</Th>
                    <Th width="10%">Language</Th>
                    <Th width="8%">Source</Th>
                    <Th>Comment</Th>
                    <Th width="6%"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((e) => (
                    <Tr key={e.id} _hover={{ bg: 'bg.subtle' }}>
                      <Td>
                        <Stack direction="row" spacing={2} align="center">
                          <Button size="xs" colorScheme="blue" onClick={() => handleEdit(e.id)} aria-label="Edit">✏️</Button>
                          <Button size="xs" colorScheme="red" onClick={() => handleDelete(e.id)} aria-label="Delete">🗑️</Button>
                        </Stack>
                      </Td>
                      <Td>{e.id}</Td>
                      <Td>{e.name}</Td>
                      <Td>{e.phone || '—'}</Td>
                      <Td>{e.iban || '—'}</Td>
                      <Td>{formatDate(e.registration_date)}</Td>
                      <Td><Badge colorScheme={getStatusBadgeColor(e.status_code)}>{e.status_name}</Badge></Td>
                      <Td>{e.segment_name}</Td>
                      <Td>{e.team_name}</Td>
                      <Td>{e.language_name}</Td>
                      <Td>{e.source_name}</Td>
                      <Td maxW="320px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{e.comment || '—'}</Td>
                      <Td textAlign="right">
                        {/* Reserved for future actions if needed */}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalCount > 20 && (
            <Card mt={5} textAlign="center">
              <CardBody>
                <Stack direction="row" justify="center" gap={5}>
                  <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
                  <Text color="fg.muted" fontSize="sm">Page {currentPage} of {Math.ceil(totalCount / 20)}</Text>
                  <Button variant="outline" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= Math.ceil(totalCount / 20)}>Next</Button>
                </Stack>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </Box>

    {/* Edit Modal */}
    <Modal isOpen={isOpen} onClose={() => { onClose(); setEditingEmployee(null); }} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Изменить сотрудника</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Имя</FormLabel>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Телефон</FormLabel>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>IBAN</FormLabel>
              <Input value={formIban} onChange={(e) => setFormIban(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Статус</FormLabel>
              <Select placeholder="Выберите статус" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Комментарий</FormLabel>
              <Textarea rows={4} value={formComment} onChange={(e) => setFormComment(e.target.value)} />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Stack direction="row" spacing={3}>
            <Button variant="ghost" onClick={() => { onClose(); setEditingEmployee(null); }}>Отмена</Button>
            <Button colorScheme="blue" onClick={handleSave}>Сохранить</Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
}