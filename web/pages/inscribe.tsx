import React from 'react';
import { getDehydratedStateFromSession } from '../common/session-helpers';
import type { NextPage, GetServerSidePropsContext } from 'next';
import { Layout } from '../components/layout';
import { Inscribe } from '@components/p/inscribe';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps(() => {
  return {
    meta: {
      title: 'Inscribe your zonefile',
      description: 'Add permanence and provenance to your name by inscribing your zonefile.',
    },
  };
});

const InscribePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Inscribe />
    </Layout>
  );
};

export default InscribePage;
