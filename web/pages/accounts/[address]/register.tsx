import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { Register } from '@components/p/register';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const RegisterPage: NextPage & { authRequired?: boolean } = () => {
  return (
    <Layout centerBox={false}>
      <Register />
    </Layout>
  );
};
RegisterPage.authRequired = true;

export default RegisterPage;
