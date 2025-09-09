import Layout from '@/components/Layout/Layout';
import IpAllowlistView from '@/views/IpAllowlistView';

export default function Page() {
  return (
    <Layout>
      <IpAllowlistView role="admin" />
    </Layout>
  );
}