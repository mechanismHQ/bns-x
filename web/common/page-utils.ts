import { getDehydratedStateFromSession, getSessionClient } from '@common/session-helpers';
import type { GetServerSidePropsContext } from 'next';
import { trpc, bnsApi } from '@store/api';
import { getNetwork } from '@common/constants';
import { findAccountIndexForAddress } from '@store/micro-stacks';
import type { PageProps } from '@pages/_app';

type GetProps = (
  ctx: GetServerSidePropsContext
) => Promise<Record<string, any>> | Record<string, any>;

export function withSSRProps(cb?: GetProps) {
  return async (ctx: GetServerSidePropsContext) => {
    const user = ctx.req.headers['x-auth-user'];
    if (typeof user === 'string') {
      console.log(`Auth: ${user}`);
    }
    const { dehydratedState, primaryAccountIndex } = await getDehydratedStateFromSession(ctx);
    let baseProps: Partial<PageProps> = {
      dehydratedState: dehydratedState,
    };
    if (dehydratedState !== null) {
      const client = getSessionClient(dehydratedState)!;
      const state = client.getState();
      const address = client.selectStxAddress(state)!;
      baseProps.accountIndex = primaryAccountIndex ?? state.currentAccountIndex;
      baseProps.stxAddress = address;
      if (typeof ctx.params?.address === 'string') {
        const address = ctx.params.address;
        const network = getNetwork();
        const account = findAccountIndexForAddress({
          network,
          address,
          accounts: state.accounts,
        });
        if (typeof account !== 'undefined') {
          baseProps.dehydratedState = setAccountIndexInDehydratedState(
            dehydratedState,
            account.index
          );
          baseProps.pathAccountIndex = account.index;
          baseProps.stxAddress = account.stxAddress;
        }
      }
      const displayName = await bnsApi.getDisplayName(address);
      baseProps.displayName = displayName;
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

type Dehydrated = [[number, string], [number | undefined, any[]]];

function setAccountIndexInDehydratedState(dehydratedState: string, accountIndex: number) {
  const state = JSON.parse(dehydratedState) as Dehydrated;
  state[1][0] = accountIndex;
  return JSON.stringify(state);
}
