import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { useIsSSR } from '../common/hooks/use-is-ssr';
import { Layout } from '../components/layout';
import { Stack, Text } from '@nelson-ui/react';
import { Link } from '../components/link';
import { useAccount } from '@micro-stacks/react';
import { Migrate } from '../components/migrate';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const MigratePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Stack>
        <Migrate />
      </Stack>
    </Layout>
  );
};

export default MigratePage;
