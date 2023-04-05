import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from '../../../common/session';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getNetworkKey } from '@common/constants';

async function saveSessionRoute(req: NextApiRequest, res: NextApiResponse) {
  const { dehydratedState, primaryAccountIndex } = (await req.body) as {
    dehydratedState?: string;
    primaryAccountIndex?: number;
  };

  if (!dehydratedState)
    return res.status(500).json({ message: 'No `dehydratedState` found is request body' });

  console.log('Saving session with primary index', primaryAccountIndex ?? '[none]');

  try {
    req.session.dehydratedState = dehydratedState;
    req.session.primaryAccountIndex = primaryAccountIndex;
    await req.session.save();
    res.json({ dehydratedState });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export default withIronSessionApiRoute(saveSessionRoute, sessionOptions);
