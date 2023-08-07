import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { BridgeWrap } from '@components/p/bridge/wrap';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const BridgeWrapPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <BridgeWrap />
    </Layout>
  );
};

export default BridgeWrapPage;
