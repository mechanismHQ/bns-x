import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { ManageName } from '@components/p/manage';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const NamePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <ManageName />
    </Layout>
  );
};

export default NamePage;
