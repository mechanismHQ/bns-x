export { PrismaClient as BnsDb } from '@prisma/client';
export { PrismaClient as StacksDb } from '../../prisma/generated/stacks-api-schema';
export type { Prisma as BnsDbTypes } from '@prisma/client';
export type { Prisma as StacksDbTypes } from '../../prisma/generated/stacks-api-schema';
import type { PrismaClient as BnsDb } from '@prisma/client';
import { logger } from '~/logger';

export async function refreshMaterializedViews(db: BnsDb) {
  try {
    await db.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY names`;
    await db.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY primary_names`;
    await db.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY name_ownership`;
  } catch (error) {
    logger.error({
      error,
      topic: 'refresh-materialized-views',
    });
  }
}
