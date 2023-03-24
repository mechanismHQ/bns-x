import React from 'react';
import type { NextPage } from 'next';
import { Layout } from '../components/layout';
import { Punycode } from '@components/p/punycode';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps(() => {
  return {
    meta: {
      title: 'Punycode debugger',
      description: 'A simple page to debug BNS punycode.',
    },
  };
});

const PunycodePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Punycode />
    </Layout>
  );
};

export default PunycodePage;
