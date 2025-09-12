'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Card, CardHeader, CardBody, Heading, Text, Input, Stack, Badge, Table, Thead, Tbody, Tr, Td, Th, TableContainer } from '@chakra-ui/react';

// Types
interface Candidate {
  id: number;
  name: string;
  phone?: string;
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
  poly_result?: 'PASSED' | 'DIDNT_PASS' | 'WAITING';
  background_check_result?: 'PASSED' | 'DIDNT_PASS' | 'WAITING';
  date_of_start?: string;
  planned_call?: string;
  on_contract?: boolean;
  conditions?: string;
  created_at: string;
  updated_at: string;
}

export default function CandidatesView() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchSegment, setSearchSegment] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [searchComment, setSearchComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load candidates
  const loadCandidates = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        type: 'candidates',
      });

      // no server search, client-side filters

      const response = await fetch(`/api/people?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error loading candidates');
      }

      const data = await response.json();
      
      if (data.success) {
        setCandidates(data.data || []);
        setTotalCount(data.total || 0);
      } else {
        throw new Error(data.error || 'Error getting data');
      }
    } catch (err) {
      console.error('Error loading candidates:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when search/page changes
  useEffect(() => {
    loadCandidates();
  }, [currentPage]);

  // Handle search
  const filtered = candidates.filter((c)=>{
    const byId = searchId ? String(c.id).includes(searchId) : true;
    const byName = searchName ? c.name.toLowerCase().includes(searchName.toLowerCase()) : true;
    const byPhone = searchPhone ? (c.phone||'').toLowerCase().includes(searchPhone.toLowerCase()) : true;
    const byStatus = searchStatus ? c.status_name.toLowerCase().includes(searchStatus.toLowerCase()) : true;
    const bySegment = searchSegment ? c.segment_name.toLowerCase().includes(searchSegment.toLowerCase()) : true;
    const byTeam = searchTeam ? c.team_name.toLowerCase().includes(searchTeam.toLowerCase()) : true;
    const byLang = searchLanguage ? c.language_name.toLowerCase().includes(searchLanguage.toLowerCase()) : true;
    const bySource = searchSource ? c.source_name.toLowerCase().includes(searchSource.toLowerCase()) : true;
    const byComment = searchComment ? (c.comment||'').toLowerCase().includes(searchComment.toLowerCase()) : true;
    return byId && byName && byPhone && byStatus && bySegment && byTeam && byLang && bySource && byComment;
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
      case 'new':
        return 'blue';
      case 'reviewing':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'hired':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Actions
  const handleEdit = (id: number) => {
    console.log('Edit candidate', id);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this candidate?')) {
      console.log('Delete candidate', id);
    }
  };

  const handleApprove = (id: number) => {
    console.log('Approve candidate', id);
  };

  // no chart — table only

  return (
    <Box>
      {/* Header */}
      <Card bg="bg.subtle" borderColor="border">
        <CardHeader display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">Candidates</Heading>
          <Text color="fg.muted">Total: {totalCount} candidates</Text>
        </CardHeader>
      </Card>

      {/* Filters table */}
      <Box mt={5} border="1px solid" borderColor="border" borderRadius="md" overflowX="auto">
        <Table size="sm" variant="filter" minW="1400px">
          <Tbody>
            <Tr>
              <Td width="8%" />
              <Td width="6%"><Input size="sm" placeholder="ID" value={searchId} onChange={(e)=>setSearchId(e.target.value)} /></Td>
              <Td width="16%"><Input size="sm" placeholder="Name" value={searchName} onChange={(e)=>setSearchName(e.target.value)} /></Td>
              <Td width="12%"><Input size="sm" placeholder="Phone" value={searchPhone} onChange={(e)=>setSearchPhone(e.target.value)} /></Td>
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

      {/* Chart removed */}

      {/* Error */}
      {error && (
        <Card mt={5} bg="red.50" borderColor="red.200">
          <CardBody textAlign="center">
            <Text color="red.600" mb={3}>{error}</Text>
            <Button colorScheme="red" onClick={loadCandidates}>Try Again</Button>
          </CardBody>
        </Card>
      )}

      {/* Loading */}
      {loading ? (
        <Card mt={5} textAlign="center" p={10}>
          <CardBody>Loading candidates...</CardBody>
        </Card>
      ) : (
        <>
          {/* Candidates Table */}
          {filtered.length === 0 ? (
            <Box mt={2} textAlign="center" p={10} bg="bg.default" border="1px solid" borderColor="border" borderRadius="md">
              <Text>No candidates found</Text>
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
              <Table size="content" variant="content" minW="1400px">
                <Thead>
                  <Tr bg="bg.subtle">
                    <Th width="8%"></Th>
                    <Th width="6%">ID</Th>
                    <Th width="16%">Name</Th>
                    <Th width="12%">Phone</Th>
                    <Th width="12%">Registered</Th>
                    <Th width="10%">Status</Th>
                    <Th width="10%">Segment</Th>
                    <Th width="8%">Team</Th>
                    <Th width="10%">Language</Th>
                    <Th width="8%">Source</Th>
                    <Th>Comment</Th>
                    <Th width="10%">Poly</Th>
                    <Th width="10%">Background</Th>
                    <Th width="12%">Start date</Th>
                    <Th width="12%">Planned call</Th>
                    <Th width="8%">Contract</Th>
                    <Th width="10%">Conditions</Th>
                    <Th width="6%"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((c) => (
                    <Tr key={c.id} _hover={{ bg: 'bg.subtle' }}>
                      <Td>
                        <Stack direction="row" spacing={2} align="center">
                          <Button size="xs" colorScheme="blue" onClick={() => handleEdit(c.id)} aria-label="Edit">✏️</Button>
                          <Button size="xs" colorScheme="red" onClick={() => handleDelete(c.id)} aria-label="Delete">🗑️</Button>
                        </Stack>
                      </Td>
                      <Td>{c.id}</Td>
                      <Td>{c.name}</Td>
                      <Td>{c.phone || '—'}</Td>
                      <Td>{formatDate(c.registration_date)}</Td>
                      <Td><Badge colorScheme={getStatusBadgeColor(c.status_code)}>{c.status_name}</Badge></Td>
                      <Td>{c.segment_name}</Td>
                      <Td>{c.team_name}</Td>
                      <Td>{c.language_name}</Td>
                      <Td>{c.source_name}</Td>
                      <Td maxW="320px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{c.comment || '—'}</Td>
                      <Td>{c.poly_result || '-'}</Td>
                      <Td>{c.background_check_result || '-'}</Td>
                      <Td>{c.date_of_start ? new Date(c.date_of_start).toLocaleDateString('en-US') : '-'}</Td>
                      <Td>{c.planned_call ? new Date(c.planned_call).toLocaleString('en-US') : '-'}</Td>
                      <Td>{typeof c.on_contract === 'boolean' ? (c.on_contract ? 'Yes' : 'No') : '-'}</Td>
                      <Td maxW="240px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{c.conditions || '-'}</Td>
                      <Td textAlign="right">
                        <Button size="xs" colorScheme="green" onClick={() => handleApprove(c.id)} aria-label="Approve">✅</Button>
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
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Text color="gray.600" fontSize="sm">
                    Page {currentPage} of {Math.ceil(totalCount / 20)}
                  </Text>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalCount / 20)}
                  >
                    Next
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}