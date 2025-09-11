'use client';
import { useState, useEffect } from 'react';

// Types
interface Employee {
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
  created_at: string;
  updated_at: string;
}

export default function EmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

      if (search.trim()) {
        params.append('search', search.trim());
      }

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
  }, [currentPage, search]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEmployees();
  };

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

  return (
    <div>
      {/* Header */}
      <div className="card card--panel">
        <div className="card__head">
          <h1>Employees</h1>
          <div>
            Total: {totalCount} employees
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card__body">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
            <input
              type="text"
              placeholder="Search employees by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn--primary">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ marginTop: '20px', background: '#fee2e2', borderColor: '#fca5a5' }}>
          <div className="card__body" style={{ textAlign: 'center' }}>
            <p style={{ color: '#dc2626', margin: '0 0 15px 0' }}>{error}</p>
            <button className="btn btn--primary" onClick={loadEmployees}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center', padding: '40px' }}>
          <div className="card__body">
            Loading employees...
          </div>
        </div>
      ) : (
        <>
          {/* Employees List */}
          <div style={{ marginTop: '20px' }}>
            {employees.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="card__body">
                  <p>No employees found</p>
                </div>
              </div>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="card" style={{ marginBottom: '20px' }}>
                  <div className="card__head">
                    <div>
                      <h3 style={{ margin: '0 0 8px 0' }}>{employee.name}</h3>
                      <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
                        {employee.phone || 'No phone'}
                      </p>
                      <p style={{ margin: '0', color: '#9ca3af', fontSize: '13px' }}>
                        Registered: {formatDate(employee.registration_date)}
                      </p>
                    </div>
                    <div>
                      <span className={`badge badge--${getStatusBadgeColor(employee.status_code)}`}>
                        {employee.status_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card__body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', minWidth: '80px' }}>Segment:</span>
                        <span style={{ fontSize: '14px' }}>{employee.segment_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', minWidth: '80px' }}>Team:</span>
                        <span style={{ fontSize: '14px' }}>{employee.team_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', minWidth: '80px' }}>Language:</span>
                        <span style={{ fontSize: '14px' }}>{employee.language_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', minWidth: '80px' }}>Source:</span>
                        <span style={{ fontSize: '14px' }}>{employee.source_name}</span>
                      </div>
                      {employee.comment && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', minWidth: '80px' }}>Comment:</span>
                          <span style={{ fontSize: '14px' }}>{employee.comment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalCount > 20 && (
            <div className="card" style={{ marginTop: '20px', textAlign: 'center' }}>
              <div className="card__body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <button 
                  className="btn btn--secondary"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  Page {currentPage} of {Math.ceil(totalCount / 20)}
                </span>
                <button 
                  className="btn btn--secondary"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / 20)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}