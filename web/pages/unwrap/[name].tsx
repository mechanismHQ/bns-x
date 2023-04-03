import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { Unwrap } from '@components/p/unwrap';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const UnwrapPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Unwrap />
    </Layout>
  );
};

export default UnwrapPage;
