import { hashAtom, txidQueryAtom } from './migration';

export const registerTxIdAtom = hashAtom('registerTxid');
export const registerTxAtom = txidQueryAtom(registerTxIdAtom)[0];
