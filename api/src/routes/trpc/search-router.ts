import { router, procedure } from './base';
import { z } from 'zod';

export const nameSearchResultSchema = z.object({
  name: z.string(),
});

export const searchRouter = router({
  searchNames: procedure
    .output(z.object({ results: z.array(nameSearchResultSchema) }))
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const names = await ctx.fetcher.searchNames(input.query);
      return {
        results: names.map(name => ({ name })),
      };
    }),
});
