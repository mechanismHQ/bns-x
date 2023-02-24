import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import type { OpenApiMeta } from 'trpc-openapi';

const t = initTRPC.meta<OpenApiMeta>().context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
