import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { BridgeNames } from '@components/p/bridge/names';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const BridgeNamesPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <BridgeNames />
    </Layout>
  );
};

export default BridgeNamesPage;
