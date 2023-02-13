import type { NextPage } from 'next';
import { Layout } from '../components/layout';
import { Ui } from '@components/p/ui';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const UiPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      {/* <Stack> */}
      <Ui />
      {/* </Stack> */}
    </Layout>
  );
};

export default UiPage;
