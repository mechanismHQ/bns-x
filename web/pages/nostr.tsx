import React from 'react';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Nostr } from '@components/p/nostr';
import type { NostrName } from '@store/api';
import { allNostrNamesState } from '@store/api';
import { trpc } from '@store/api';
import { useHydrateAtoms } from 'jotai/utils';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { results } = await trpc.zonefiles.allNostr.query();
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
      names: results,
      meta: {
        title: 'Nostr directory',
        description: 'A directory of BNS users with Nostr profiles linked to their names.',
      },
    },
  };
}

const NostrPage: NextPage<{ names: NostrName[] }> = ({ names }) => {
  useHydrateAtoms([[allNostrNamesState, names]]);
  return (
    <Layout centerBox={false}>
      <Nostr />
    </Layout>
  );
};

export default NostrPage;
