import Layout from '@/components/Layout/Layout';
import HasuraTest from '@/components/HasuraTest/HasuraTest';

export default function HasuraTestPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Тестирование Hasura</h1>
        <HasuraTest />
      </div>
    </Layout>
  );
}