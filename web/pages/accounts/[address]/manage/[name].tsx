import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { Name } from '@components/p/name';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const NamePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Name />
    </Layout>
  );
};

export default NamePage;
