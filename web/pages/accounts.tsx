import type { NextPage } from 'next';
import { Layout } from '../components/layout';
import { withSSRProps } from '@common/page-utils';
import { Accounts } from '@components/p/accounts';

export const getServerSideProps = withSSRProps();

const AccountsPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Accounts />
    </Layout>
  );
};

export default AccountsPage;
