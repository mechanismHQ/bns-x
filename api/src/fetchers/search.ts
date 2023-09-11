import type { StacksDb } from '~/db';
import { BnsDb } from '~/db';

export async function searchNamesFuzzy({ query, db }: { query: string; db: StacksDb }) {
  const fuzzyMatch = `%${query}%`;
  const namespaceMatch = `${query}\.%`;
  const preMatch = `${query}%`;
  const results = await db.$queryRaw<{ name: string }[]>`
      with fuzzy as (
        select distinct on (name)
        name
        , 4 as rank
        from names
        where name like ${fuzzyMatch}
        order by name
      ), exact as (
        select distinct on (name)
        name
        , 1 as rank
        from names
        where name = ${query}
        order by name
      ), starts as (
        select distinct on (name)
        name
        , 3 as rank
        from names
        where name like ${preMatch}
        order by name
      ), pre as (
        select distinct on (name)
        name
        , 2 as rank
        from names
        where name like ${namespaceMatch}
        order by name
      ), combined as (
        select distinct on (fuzzy.name)
        fuzzy.name
        , least(fuzzy.rank, exact.rank, starts.rank, pre.rank) as rank
        from fuzzy
        left outer join exact on fuzzy.name = exact.name
        left outer join starts on fuzzy.name = starts.name
        left outer join pre on fuzzy.name = pre.name
        order by name
        , rank asc
      )

      select *
      from combined
      order by rank
      limit 10;`;

  return results.map(r => r.name);
}
