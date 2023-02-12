import { router, procedure } from './base';
import { expectDb } from '@db/db-utils';
import { z } from 'zod';
import { fetchNostrNames } from '@fetchers/stacks-db/zonefiles';
import { fetchNostrNames as fetchNostrNamesBns } from '@fetchers/bns-db/zonefiles';
import { parseZoneFile } from '@fungible-systems/zone-file';
import { toUnicode } from 'punycode';

export const nostrNames = z.object({
  name: z.string(),
  zonefile: z.string(),
  nostr: z.string(),
});

export type NostrNames = z.infer<typeof nostrNames>;

export const zonefileRouter = router({
  allNostr: procedure.output(z.object({ results: z.array(nostrNames) })).query(async ({ ctx }) => {
    expectDb(ctx.prisma);
    expectDb(ctx.bnsxDb);
    const queryResults = await Promise.all([
      fetchNostrNames(ctx.prisma),
      fetchNostrNamesBns(ctx.bnsxDb),
    ]);

    const all = queryResults.flat(1);

    const unique = all.filter((row, index) => {
      return (
        index ===
        all.findIndex(r2 => {
          return r2.name === row.name;
        })
      );
    });

    const withNostr = unique
      .map(row => {
        const zonefile = parseZoneFile(row.zonefile);
        let nostr = zonefile.txt?.find(record => record.name === '_._nostr')?.txt;

        if (typeof nostr !== 'string') nostr = undefined;

        return {
          ...row,
          name: toUnicode(row.name),
          nostr,
        };
      })
      .filter((n): n is NostrNames => typeof n.nostr !== 'undefined');

    return {
      results: withNostr,
    };
  }),
});
