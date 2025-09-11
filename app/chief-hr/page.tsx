import Layout from '@/components/Layout/Layout';
import Link from 'next/link';

export default function ChiefIndex() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Панель главного HR</h1>
        <p className="text-gray-600">Управление кандидатами и сотрудниками</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/chief-hr/candidates" className="block bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Кандидаты</div>
                <div className="text-sm text-gray-500 mt-1">Полный доступ + найм</div>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/chief-hr/staff" className="block bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">Сотрудники</div>
                <div className="text-sm text-gray-500 mt-1">Редактирование и управление</div>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
