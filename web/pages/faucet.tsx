import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Faucet } from '../components/faucet';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const FaucetPage: NextPage = () => {
  return (
    <Layout centerBox={true}>
      <Faucet />
    </Layout>
  );
};

export default FaucetPage;
