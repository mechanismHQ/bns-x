import { mergeRouters } from "./base";
import { queryHelperRouter } from "./query-helper-router";

export const appRouter = mergeRouters(queryHelperRouter);

export type AppRouter = typeof appRouter;
