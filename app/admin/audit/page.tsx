import Layout from '@/components/Layout/Layout';
import AuditView from '@/views/AuditView';

export default function Page() {
  return (
    <Layout>
      <AuditView role="admin" />
    </Layout>
  );
}