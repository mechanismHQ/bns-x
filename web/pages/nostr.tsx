import React from 'react';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Nostr } from '@components/p/nostr';
import type { NostrName } from '@store/api';
import { allNostrNamesState } from '@store/api';
import { trpc } from '@store/api';
import { useHydrateAtoms } from 'jotai/utils';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps(async () => {
  const { results } = await trpc.zonefiles.allNostr.query();
  return {
    names: results,
    meta: {
      title: 'Nostr directory',
      description: 'A directory of BNS users with Nostr profiles linked to their names.',
    },
  };
});

const NostrPage: NextPage<{ names: NostrName[] }> = ({ names }) => {
  useHydrateAtoms([[allNostrNamesState, names]]);
  return (
    <Layout centerBox={false}>
      <Nostr />
    </Layout>
  );
};

export default NostrPage;
