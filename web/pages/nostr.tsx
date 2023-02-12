import React from 'react';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Nostr } from '@components/p/nostr';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const NostrPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Nostr />
    </Layout>
  );
};

export default NostrPage;
