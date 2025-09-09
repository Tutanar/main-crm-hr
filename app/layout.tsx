import '@/styles/output.css';
import '@/styles/global.css';
import '@/styles/globals.scss';

import { RoleProvider } from '@/components/RoleProvider/RoleProvider';
import AuthGuard from '@/components/AuthGuard/AuthGuard';

export const metadata = {
  title: 'CRM HR System',
  description: 'Human Resources Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <AuthGuard>{children}</AuthGuard>
        </RoleProvider>
      </body>
    </html>
  );
}