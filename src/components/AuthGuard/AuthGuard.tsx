'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const s = getSession();
    if (!s) {
      if (pathname !== '/login') router.replace('/login');
      return;
    }

    // если зашёл, но путь не соответствует роли — отправляем на домашнюю роль
    if (s.role === 'admin' && !pathname.startsWith('/admin')) router.replace('/admin/candidates');
    if (s.role === 'chief-hr' && !pathname.startsWith('/chief-hr')) router.replace('/chief-hr/candidates');
    if (s.role === 'hr' && !pathname.startsWith('/hr')) router.replace('/hr/candidates');
  }, [router, pathname]);

  return <>{children}</>;
}
