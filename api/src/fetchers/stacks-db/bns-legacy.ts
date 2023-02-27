import type { StacksDb } from '@db';

export async function getSubdomainForAddress({
  address,
  maxHeight,
  db,
}: {
  address: string;
  maxHeight: number;
  db: StacksDb;
}) {
  const rows = await db.$queryRaw`
    WITH addr_subdomains AS (
      SELECT DISTINCT ON (fully_qualified_subdomain)
        fully_qualified_subdomain
      FROM
        subdomains
      WHERE
        owner = ${address}
        AND block_height <= ${maxHeight}
        AND canonical = TRUE
        AND microblock_canonical = TRUE
    )
    SELECT DISTINCT ON (fully_qualified_subdomain)
      fully_qualified_subdomain
    FROM
      subdomains
      INNER JOIN addr_subdomains USING (fully_qualified_subdomain)
    WHERE
      canonical = TRUE
      AND microblock_canonical = TRUE
    ORDER BY
      fully_qualified_subdomain
  `;
}

// export async function getImportedNameForAddress(address: string, db: StacksDb) {

// }
