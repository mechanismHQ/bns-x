import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const dataRouter = t.router({
  getAccounts: t.procedure.query(async ({ ctx }) => {
    const accounts = await ctx.prisma.account.findMany({
      take: 10,
      include: {
        primaryName: true,
        names: {
          include: {
            wrapper: {
              select: {
                principal: true,
              },
            },
          },
        },
      },
    });
    return { accounts };
  }),

  getName: t.procedure
    .input(
      z.object({
        name: z.string(),
        namespace: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const name = await ctx.prisma.name.findFirst({
        where: input,
        include: {
          wrapper: true,
          owner: true,
          primaryOwner: true,
        },
      });
      return {
        name,
      };
    }),

  getAccount: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
    const account = await ctx.prisma.account.findUnique({
      where: { principal: input },
      include: {
        primaryName: true,
        names: true,
      },
    });
    return {
      account,
    };
  }),
});
