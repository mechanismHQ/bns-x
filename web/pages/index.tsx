import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { Home } from '@components/home';
import { withSSRProps } from '@common/page-utils';
import { ONLY_INSCRIPTIONS } from '@common/constants';

export const getServerSideProps = withSSRProps(() => {
  if (ONLY_INSCRIPTIONS) {
    return {
      meta: {
        title: '',
        description: 'Manage your BNS names',
      },
    };
  }
  return {
    meta: {
      title: '',
      description: 'Upgrade to your name to BNSx',
    },
  };
});

const HomePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Home />
    </Layout>
  );
};

export default HomePage;
