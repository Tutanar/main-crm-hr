import Layout from '@/components/Layout/Layout';
import StaffView from '@/views/StaffView';

export default function Page() {
  return (
    <Layout>
      <StaffView role="admin" />
    </Layout>
  );
}