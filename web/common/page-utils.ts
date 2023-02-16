import { getDehydratedStateFromSession, getSessionAccount } from '@common/session-helpers';
import type { GetServerSidePropsContext } from 'next';
import { trpc } from '@store/api';

type GetProps = (
  ctx: GetServerSidePropsContext
) => Promise<Record<string, any>> | Record<string, any>;

export function withSSRProps(cb?: GetProps) {
  return async (ctx: GetServerSidePropsContext) => {
    const dehydratedState = await getDehydratedStateFromSession(ctx);
    let baseProps: Record<string, any> = {
      dehydratedState,
    };
    if (dehydratedState !== null) {
      const address = getSessionAccount(dehydratedState)!;
      // const { name: displayName } = await trpc.getDisplayName.query(address);
      // baseProps.displayName = displayName;
      baseProps.stxAddress = address;
    }
    if (typeof cb !== 'undefined') {
      const extra = await cb(ctx);
      baseProps = {
        ...baseProps,
        ...extra,
      };
    }
    return {
      props: baseProps,
    };
  };
}
