import * as Iron from 'iron-session';
import type { ClientConfig } from '@micro-stacks/client';
import { cleanDehydratedState, createClient } from '@micro-stacks/client';
import { sessionOptions } from './session';

import type { NextPageContext } from 'next';
import type { GetServerSidePropsContext } from 'next/types';
import type { IncomingMessage, ServerResponse } from 'http';
import { getAppUrl, getNetwork, ONLY_INSCRIPTIONS } from '@common/constants';

export const getIronSession = (req: NextPageContext['req'], res: NextPageContext['res']) => {
  return Iron.getIronSession(req as IncomingMessage, res as ServerResponse, sessionOptions);
};

export const getDehydratedStateFromSession = async (ctx: GetServerSidePropsContext) => {
  const { dehydratedState } = await getIronSession(ctx.req, ctx.res);
  /**
   * This is important:
   *
   * `cleanDehydratedState` removes any instance of `appPrivateKey` from the JSON payload
   * that will be sent down to the client. It's still possible to use `appPrivateKey` on the server,
   * because it's encrypted in a cookie. We just want to avoid passing it down the wire because
   * if someone is watching the data, they could gain access to it.
   */
  return typeof dehydratedState !== 'undefined' ? cleanDehydratedState(dehydratedState) : null;
};

export function getSessionClient(dehydratedState?: string) {
  const config: ClientConfig = {
    dehydratedState: dehydratedState,
    network: getNetwork(),
  };
  const client = createClient({ config });
  return client;
}
