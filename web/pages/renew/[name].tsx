import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { withSSRProps } from '@common/page-utils';
import { Renew } from '@components/p/renew';

export const getServerSideProps = withSSRProps();

const RenewPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Renew />
    </Layout>
  );
};

export default RenewPage;
