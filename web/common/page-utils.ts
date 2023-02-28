import { getDehydratedStateFromSession, getSessionAccount } from '@common/session-helpers';
import type { GetServerSidePropsContext } from 'next';
import { trpc, bnsApi } from '@store/api';

type GetProps = (
  ctx: GetServerSidePropsContext
) => Promise<Record<string, any>> | Record<string, any>;

export function withSSRProps(cb?: GetProps) {
  return async (ctx: GetServerSidePropsContext) => {
    const user = ctx.req.headers['x-auth-user'];
    if (typeof user === 'string') {
      console.log(`Auth: ${user}`);
    }
    const dehydratedState = await getDehydratedStateFromSession(ctx);
    let baseProps: Record<string, any> = {
      dehydratedState,
    };
    if (dehydratedState !== null) {
      const address = getSessionAccount(dehydratedState)!;
      const displayName = await bnsApi.getDisplayName(address);
      baseProps.displayName = displayName;
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
