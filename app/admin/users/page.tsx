import Layout from '@/components/Layout/Layout';
import UsersView from '@/views/UsersView';

export default function Page() {
  return (
    <Layout>
      <UsersView role="admin" />
    </Layout>
  );
}