import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { Upgrade } from '@components/upgrade';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const MigratePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Upgrade />
    </Layout>
  );
};

export default MigratePage;
