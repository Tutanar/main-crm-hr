'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type Staff } from '@/types';
import Button from '@/components/Button/Button';
import Table from '@/components/Table/Table';
import Pagination from '@/components/Pagination/Pagination';
import { useRole } from '@/components/RoleProvider/RoleProvider';

interface StaffViewProps {
  role?: string;
}

export default function StaffView({ role }: StaffViewProps) {
  const { user } = useRole();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Загрузка сотрудников
  const loadStaff = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      // Моковые данные сотрудников
      const mockStaff: Staff[] = [
        {
          id: '1',
          first_name: 'Анна',
          last_name: 'Иванова',
          email: 'anna.ivanova@company.com',
          phone: '+7 (999) 111-22-33',
          position: 'Senior Frontend Developer',
          department: 'Development',
          iban: 'RU12345678901234567890',
          salary: 150000,
          hire_date: '2023-01-15',
          is_active: true,
          created_at: '2023-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: user?.id,
          updated_by: user?.id,
          candidate_id: '1'
        },
        {
          id: '2',
          first_name: 'Дмитрий',
          last_name: 'Смирнов',
          email: 'dmitry.smirnov@company.com',
          phone: '+7 (999) 222-33-44',
          position: 'Backend Developer',
          department: 'Development',
          iban: 'RU12345678901234567891',
          salary: 140000,
          hire_date: '2023-03-20',
          is_active: true,
          created_at: '2023-03-20T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: user?.id,
          updated_by: user?.id,
          candidate_id: '2'
        },
        {
          id: '3',
          first_name: 'Елена',
          last_name: 'Петрова',
          email: 'elena.petrova@company.com',
          phone: '+7 (999) 333-44-55',
          position: 'HR Manager',
          department: 'Human Resources',
          iban: 'RU12345678901234567892',
          salary: 120000,
          hire_date: '2022-11-10',
          is_active: true,
          created_at: '2022-11-10T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: user?.id,
          updated_by: user?.id,
          candidate_id: '3'
        },
        {
          id: '4',
          first_name: 'Сергей',
          last_name: 'Козлов',
          email: 'sergey.kozlov@company.com',
          phone: '+7 (999) 444-55-66',
          position: 'DevOps Engineer',
          department: 'Infrastructure',
          iban: 'RU12345678901234567893',
          salary: 160000,
          hire_date: '2023-06-01',
          is_active: false,
          created_at: '2023-06-01T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z',
          created_by: user?.id,
          updated_by: user?.id,
          candidate_id: '4'
        }
      ];

      // Фильтрация по поиску
      let filteredStaff = mockStaff;
      if (searchTerm) {
        filteredStaff = mockStaff.filter(employee =>
          employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Фильтрация по отделу
      if (departmentFilter) {
        filteredStaff = filteredStaff.filter(employee =>
          employee.department === departmentFilter
        );
      }

      // Фильтрация по статусу
      if (statusFilter) {
        const isActive = statusFilter === 'active';
        filteredStaff = filteredStaff.filter(employee =>
          employee.is_active === isActive
        );
      }

      setStaff(filteredStaff);
      setTotalPages(Math.ceil(filteredStaff.length / 10));
    } catch (err) {
      setError('Ошибка загрузки сотрудников');
      console.error('Load staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [searchTerm, departmentFilter, statusFilter]);

  const handleStatusToggle = async (staffId: string, isActive: boolean) => {
    try {
      // Здесь будет реальный API запрос
      setStaff(prev => prev.map(employee =>
        employee.id === staffId
          ? { ...employee, is_active: isActive, updated_at: new Date().toISOString() }
          : employee
      ));
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const columns = [
    {
      key: 'name',
      label: 'Имя',
      render: (employee: Staff) => `${employee.first_name} ${employee.last_name}`
    },
    {
      key: 'email',
      label: 'Email',
      render: (employee: Staff) => employee.email
    },
    {
      key: 'position',
      label: 'Должность',
      render: (employee: Staff) => employee.position
    },
    {
      key: 'department',
      label: 'Отдел',
      render: (employee: Staff) => employee.department || 'Не указан'
    },
    {
      key: 'salary',
      label: 'Зарплата',
      render: (employee: Staff) => employee.salary ? formatSalary(employee.salary) : 'Не указана'
    },
    {
      key: 'hire_date',
      label: 'Дата найма',
      render: (employee: Staff) => employee.hire_date ? formatDate(employee.hire_date) : 'Не указана'
    },
    {
      key: 'status',
      label: 'Статус',
      render: (employee: Staff) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          employee.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {employee.is_active ? 'Активен' : 'Неактивен'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (employee: Staff) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusToggle(employee.id, !employee.is_active)}
            variant={employee.is_active ? 'outline' : 'primary'}
          >
            {employee.is_active ? 'Деактивировать' : 'Активировать'}
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
        <div className="text-lg">Загрузка сотрудников...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Ошибка</div>
        <div className="text-red-600">{error}</div>
        <Button onClick={loadStaff} className="mt-2">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
        <Button>
          Добавить сотрудника
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
              placeholder="Поиск по имени, email или должности..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отдел
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все отделы</option>
              <option value="Development">Development</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Marketing">Marketing</option>
            </select>
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

      {/* Таблица сотрудников */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          data={staff}
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
          <div className="text-sm font-medium text-gray-500">Всего сотрудников</div>
          <div className="text-2xl font-bold text-gray-900">{staff.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Активные</div>
          <div className="text-2xl font-bold text-green-600">
            {staff.filter(s => s.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Неактивные</div>
          <div className="text-2xl font-bold text-red-600">
            {staff.filter(s => !s.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm font-medium text-gray-500">Средняя зарплата</div>
          <div className="text-2xl font-bold text-blue-600">
            {staff.length > 0 
              ? formatSalary(staff.reduce((sum, s) => sum + (s.salary || 0), 0) / staff.length)
              : '0 ₽'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
