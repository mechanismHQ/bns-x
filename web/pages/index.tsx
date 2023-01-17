import styles from '../styles/Home.module.css';
import { WalletConnectButton } from '../components/wallet-connect-button';
import { UserCard } from '../components/user-card';
import { getDehydratedStateFromSession } from '../common/session-helpers';

import type { NextPage, GetServerSidePropsContext } from 'next';
import { useIsSSR } from '../common/hooks/use-is-ssr';
import { Layout } from '../components/layout';
import { Stack, Text } from '@nelson-ui/react';
import { Link } from '../components/link';
import { useAccount } from '@micro-stacks/react';
import { Home } from '@components/home';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const HomePage: NextPage = () => {
  const isSSR = useIsSSR();
  const { stxAddress } = useAccount();
  return (
    <Layout centerBox={false}>
      <Home />
    </Layout>
  );
};

export default HomePage;
