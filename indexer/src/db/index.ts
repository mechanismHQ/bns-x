export { PrismaClient as BnsDb } from '@prisma/client';
export { PrismaClient as StacksDb } from '../../prisma/generated/stacks-api-schema';
export type { Prisma as BnsDbTypes } from '@prisma/client';
export type { Prisma as StacksDbTypes } from '../../prisma/generated/stacks-api-schema';
import type { PrismaClient as BnsDb } from '@prisma/client';

export async function refreshMaterializedViews(db: BnsDb) {
  await db.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY names`;
  await db.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY primary_names`;
}
