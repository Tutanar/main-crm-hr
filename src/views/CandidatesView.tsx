'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type Candidate } from '@/types';
import Button from '@/components/Button/Button';
import Table from '@/components/Table/Table';
import Pagination from '@/components/Pagination/Pagination';
import { useRole } from '@/components/RoleProvider/RoleProvider';

interface CandidatesViewProps {
  role?: string;
}

export default function CandidatesView({ role }: CandidatesViewProps) {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Загрузка кандидатов
  const loadCandidates = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      // Здесь будет реальный API запрос к Hasura
      // Пока используем моковые данные
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          first_name: 'Иван',
          last_name: 'Петров',
          email: 'ivan.petrov@example.com',
          phone: '+7 (999) 123-45-67',
          position: 'Frontend Developer',
          status: 'NEW',
          cv_url: 'https://example.com/cv1.pdf',
          cv_filename: 'ivan_petrov_cv.pdf',
          cv_size: 1024000,
          notes: 'Опытный разработчик React',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: user?.id,
          updated_by: user?.id
        },
        {
          id: '2',
          first_name: 'Мария',
          last_name: 'Сидорова',
          email: 'maria.sidorova@example.com',
          phone: '+7 (999) 234-56-78',
          position: 'Backend Developer',
          status: 'REVIEWING',
          cv_url: 'https://example.com/cv2.pdf',
          cv_filename: 'maria_sidorova_cv.pdf',
          cv_size: 2048000,
          notes: 'Специалист по Node.js и PostgreSQL',
          created_at: '2024-01-14T14:30:00Z',
          updated_at: '2024-01-16T09:15:00Z',
          created_by: user?.id,
          updated_by: user?.id
        },
        {
          id: '3',
          first_name: 'Алексей',
          last_name: 'Козлов',
          email: 'alexey.kozlov@example.com',
          phone: '+7 (999) 345-67-89',
          position: 'Full Stack Developer',
          status: 'APPROVED',
          cv_url: 'https://example.com/cv3.pdf',
          cv_filename: 'alexey_kozlov_cv.pdf',
          cv_size: 1536000,
          notes: 'Готов к собеседованию',
          created_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-17T11:20:00Z',
          created_by: user?.id,
          updated_by: user?.id
        }
      ];

      // Фильтрация по поиску
      let filteredCandidates = mockCandidates;
      if (searchTerm) {
        filteredCandidates = mockCandidates.filter(candidate =>
          candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по статусу
      if (statusFilter) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.status === statusFilter
        );
      }

      setCandidates(filteredCandidates);
      setTotalPages(Math.ceil(filteredCandidates.length / 10));
    } catch (err) {
      setError('Ошибка загрузки кандидатов');
      console.error('Load candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (candidateId: string, newStatus: Candidate['status']) => {
    try {
      // Здесь будет реальный API запрос
      setCandidates(prev => prev.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus, updated_at: new Date().toISOString() }
          : candidate
      ));
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const getStatusBadge = (status: Candidate['status']) => {
    const statusConfig = {
      NEW: { color: 'bg-blue-100 text-blue-800', text: 'Новый' },
      REVIEWING: { color: 'bg-yellow-100 text-yellow-800', text: 'На рассмотрении' },
      APPROVED: { color: 'bg-green-100 text-green-800', text: 'Одобрен' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Отклонен' },
      HIRED: { color: 'bg-purple-100 text-purple-800', text: 'Нанят' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Имя',
      render: (candidate: Candidate) => `${candidate.first_name} ${candidate.last_name}`
    },
    {
      key: 'email',
      label: 'Email',
      render: (candidate: Candidate) => candidate.email
    },
    {
      key: 'position',
      label: 'Должность',
      render: (candidate: Candidate) => candidate.position
    },
    {
      key: 'status',
      label: 'Статус',
      render: (candidate: Candidate) => getStatusBadge(candidate.status)
    },
    {
      key: 'created_at',
      label: 'Дата создания',
      render: (candidate: Candidate) => new Date(candidate.created_at).toLocaleDateString('ru-RU')
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (candidate: Candidate) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange(candidate.id, 'APPROVED')}
            disabled={candidate.status === 'APPROVED'}
          >
            Одобрить
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusChange(candidate.id, 'REJECTED')}
            disabled={candidate.status === 'REJECTED'}
          >
            Отклонить
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка кандидатов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Ошибка</div>
        <div className="text-red-600">{error}</div>
        <Button onClick={loadCandidates} className="mt-2">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Кандидаты</h1>
        <Button>
          Добавить кандидата
        </Button>
      </div>

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
              placeholder="Поиск по имени, email или должности..."
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
              <option value="NEW">Новый</option>
              <option value="REVIEWING">На рассмотрении</option>
              <option value="APPROVED">Одобрен</option>
              <option value="REJECTED">Отклонен</option>
              <option value="HIRED">Нанят</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица кандидатов */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={candidates}
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
          <div className="text-sm font-medium text-gray-500">Всего кандидатов</div>
          <div className="text-2xl font-bold text-gray-900">{candidates.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Новые</div>
          <div className="text-2xl font-bold text-blue-600">
            {candidates.filter(c => c.status === 'NEW').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Одобрены</div>
          <div className="text-2xl font-bold text-green-600">
            {candidates.filter(c => c.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Наняты</div>
          <div className="text-2xl font-bold text-purple-600">
            {candidates.filter(c => c.status === 'HIRED').length}
          </div>
        </div>
      </div>
    </div>
  );
}
