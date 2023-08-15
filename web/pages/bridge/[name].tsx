import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { BridgeName } from '@components/p/bridge/bridge';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const BridgeNamePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <BridgeName />
    </Layout>
  );
};

export default BridgeNamePage;
