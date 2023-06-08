import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { Register } from '@components/Register';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const RegisterPage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Register />
    </Layout>
  );
};

export default RegisterPage;
