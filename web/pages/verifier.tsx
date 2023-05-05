import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { withSSRProps } from '@common/page-utils';
import { Verifier } from '@components/p/verifier';

export const getServerSideProps = withSSRProps();

const VerifierPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Verifier />
    </Layout>
  );
};

export default VerifierPage;
