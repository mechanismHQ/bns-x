import type { NextPage } from 'next';
import { Layout } from '../../components/layout';
import { withSSRProps } from '@common/page-utils';
import { AccountsList } from '@components/p/accounts/accounts-list';

export const getServerSideProps = withSSRProps();

const AccountsPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <AccountsList />
    </Layout>
  );
};

export default AccountsPage;
