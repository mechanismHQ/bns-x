import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Faucet } from '../components/faucet';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const FaucetPage: NextPage = () => {
  return (
    <Layout centerBox={true}>
      {/* <Stack> */}
      <Faucet />
      {/* </Stack> */}
    </Layout>
  );
};

export default FaucetPage;
