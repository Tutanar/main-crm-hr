'use client';
import Link from 'next/link';
import { useRole } from '@/components/RoleProvider/RoleProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { role, isAuthenticated, loading } = useRole();
  const router = useRouter();
  const [stats, setStats] = useState({
    candidates: 0,
    staff: 0,
    users: 0,
    ipAddresses: 0
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated && role !== 'admin') {
      router.push('/');
      return;
    }

    // Загружаем статистику
    loadStats();
  }, [loading, isAuthenticated, role, router]);

  const loadStats = async () => {
    try {
      // Пока используем моковые данные
      // В будущем здесь будут реальные API запросы
      setStats({
        candidates: 12,
        staff: 8,
        users: 4,
        ipAddresses: 6
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setStats({
        candidates: 0,
        staff: 0,
        users: 0,
        ipAddresses: 0
      });
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600">У вас нет прав для просмотра этой страницы</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
      <p className="text-gray-600 mb-8">Управление системой HR</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Кандидаты" 
          value={stats.candidates} 
          href="/admin/candidates"
          description="Управление кандидатами"
        />
        <StatCard 
          label="Сотрудники" 
          value={stats.staff} 
          href="/admin/staff"
          description="Управление сотрудниками"
        />
        <StatCard 
          label="Пользователи" 
          value={stats.users} 
          href="/admin/users"
          description="Управление пользователями"
        />
        <StatCard 
          label="IP Allowlist" 
          value={stats.ipAddresses} 
          href="/admin/ip-allowlist"
          description="Управление доступом по IP"
        />
        <StatCard 
          label="Аудит" 
          value="→" 
          href="/admin/audit"
          description="Просмотр логов действий"
        />
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  href, 
  description 
}: { 
  label: string; 
  value: number | string; 
  href: string;
  description?: string;
}) {
  return (
    <Link href={href} className="block bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {description && (
            <div className="text-xs text-gray-400 mt-2">{description}</div>
          )}
        </div>
        <div className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
