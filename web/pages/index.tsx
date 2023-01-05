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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const Home: NextPage = () => {
  const isSSR = useIsSSR();
  const { stxAddress } = useAccount();
  return (
    <Layout>
      <Stack>
        <Text variant="Heading02">
          Welcome to the <Link href="https://clarigen.dev">Clarigen</Link> demo app
        </Text>
        {stxAddress ? (
          <Link href="/create-stream">Create a stream</Link>
        ) : (
          <Text variant="Body01">Please sign in before continuing</Text>
        )}
      </Stack>
    </Layout>
  );
};

export default Home;
