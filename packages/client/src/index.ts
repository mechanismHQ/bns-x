export type { AppRouter } from '@bns-x/client';
export { trpcClient } from './trpc';
export * from './contracts';
export * from './client';
// export { NameInfoResponse, NamesByAddressResponse } from '@routes/api-types';
export { hasZeroWidth, replaceZeroWidth } from './zero-width';