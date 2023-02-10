import React from 'react';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Inscribe } from '@components/p/inscribe';

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      dehydratedState: await getDehydratedStateFromSession(ctx),
    },
  };
}

const InscribePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Inscribe />
    </Layout>
  );
};

export default InscribePage;
