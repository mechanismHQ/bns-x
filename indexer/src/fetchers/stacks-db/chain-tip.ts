import type { StacksPrisma } from '../../stacks-api-db/client';

export async function getChainTip(db: StacksPrisma) {
  const row = (await db.chainTip.findMany())[0];
  if (typeof row === 'undefined') {
    throw new Error('Unable to get chain tip.');
  }
  return row.blockHeight;
}
