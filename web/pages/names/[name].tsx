import type { NextPage } from 'next';
import { Layout } from '@components/layout';
import { NamePage } from '@components/p/name/name-page';
import { withSSRProps } from '@common/page-utils';
import { useHydrateAtoms } from 'jotai/utils';
import { currentNameAtom } from '@store/names';

export const getServerSideProps = withSSRProps(ctx => {
  return {
    name: ctx.params!.name as string,
  };
});

const Name: NextPage<{ name: string }> = ({ name }) => {
  useHydrateAtoms([[currentNameAtom, name]]);
  return (
    <Layout centerBox={false}>
      <NamePage />
    </Layout>
  );
};

export default Name;
