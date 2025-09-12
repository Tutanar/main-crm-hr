import '@/styles/output.css';
import '@/styles/global.css';
import '@/styles/globals.scss';

import { RoleProvider } from '@/components/RoleProvider/RoleProvider';
import AuthGuard from '@/components/AuthGuard/AuthGuard';
import Providers from './providers';
import { ColorModeScript } from '@chakra-ui/react';

export const metadata = {
  title: 'CRM HR System',
  description: 'Human Resources Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ColorModeScript initialColorMode="light" />
        <Providers>
          <RoleProvider>
            <AuthGuard>{children}</AuthGuard>
          </RoleProvider>
        </Providers>
      </body>
    </html>
  );
}