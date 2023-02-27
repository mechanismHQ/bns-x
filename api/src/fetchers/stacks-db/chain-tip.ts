import type { StacksDb } from '@db';

export async function getChainTip(db: StacksDb) {
  const row = (await db.chainTip.findMany())[0];
  if (typeof row === 'undefined') {
    throw new Error('Unable to get chain tip.');
  }
  return row.blockHeight;
}
