import type { NextPage } from 'next';
import { Layout } from '../components/layout';
import { Profile } from '../components/profile';
import { withSSRProps } from '@common/page-utils';

export const getServerSideProps = withSSRProps();

const ProfilePage: NextPage = () => {
  return (
    <Layout centerBox={false}>
      <Profile />
    </Layout>
  );
};

export default ProfilePage;
