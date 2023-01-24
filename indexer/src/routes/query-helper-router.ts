import { TRPCError } from "@trpc/server";
import { z } from "zod";
// import { getAddressNames } from "../fetchers/query-helper";
import { getNameDetails, getAddressNames } from "../fetchers";
import { router, procedure } from "./trpc";

export const queryHelperRouter = router({
  getAddressNames: procedure.input(z.string()).query(async ({ ctx, input }) => {
    const namesResponse = await getAddressNames(input);
    return namesResponse;
  }),

  getNameDetails: procedure
    .input(
      z.object({
        name: z.string(),
        namespace: z.string(),
      })
    )
    .query(async ({ ctx, input: { name, namespace } }) => {
      const details = await getNameDetails(name, namespace);
      if (details === null) {
        throw new TRPCError({
          message: `Unable to fetch details for ${name}.${namespace}`,
          code: "NOT_FOUND",
        });
      }
      return details;
    }),
});

export type QueryHelperRouter = typeof queryHelperRouter;
