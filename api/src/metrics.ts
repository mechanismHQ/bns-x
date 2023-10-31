import { Gauge, Counter, Summary } from 'prom-client';
import 'fastify-metrics';
import type { FastifyPluginAsync } from './routes/api-types';
import { getTotalNames } from './fetchers/stacks-db';
import fp from 'fastify-plugin';
import { logger } from '~/logger';
import {
  getPendingWrappers,
  getUndeployedWrappers,
  isDeployerEnabled,
  wrapperDeployerLogger,
} from '~/deployer';
import { DEPLOY_FEE, getDeployerBalance } from '~/deployer/deploy';
import { LRUCache } from 'lru-cache';
import { DbFetcher } from '@fetchers/adapters/db-fetcher';

export enum DbQueryTag {
  NAME_BY_ADDRESS = 'name_by_address',
  SUBDOMAIN_BY_ADDRESS = 'subdomain_by_address',
  BNSX_NAMES_BY_ADDRESS = 'bnsx_names_by_address',
  BNSX_NAME_DETAILS = 'bnsx_name_details',
  NAME_DETAILS = 'name_details',
  BNSX_PRIMARY_NAME = 'bnsx_primary_name',
  BNSX_PRIMARY_NAME_ID = 'bnsx_primary_name_id',
}

export const dbQuerySummary = new Summary({
  name: 'db_query_summary_seconds',
  help: 'Summary metric for DB query time',
  labelNames: ['query'] as const,
});

enum CacheTags {
  total_names = 'total_names',
  deployer_balance = 'deployer_balance',
  undeployed_wrappers = 'undeployed_wrappers',
  pending_wrappers = 'pending_wrappers',
  total_bridged_names = 'total_bridged_names',
}

export function observeQuery(query: DbQueryTag) {
  const timer = dbQuerySummary.startTimer();
  return () => {
    const duration = timer({ query });
    logger.trace({
      query,
      duration,
      type: 'db-query',
    });
  };
}

export const serverMetricsPlugin: FastifyPluginAsync = fp(async (server, _options) => {
  const requestCount = new Counter({
    name: 'http_request_count',
    help: 'Total number of requests made',
    labelNames: ['route', 'method', 'status_code'] as const,
  });

  const fetcher = server.fetcher;
  if (DbFetcher.isDb(fetcher)) {
    const db = fetcher.stacksDb;
    const cache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 2,
      async fetchMethod(key: string): Promise<number> {
        if (key === CacheTags.total_names) {
          return await getTotalNames(db);
        }
        if (key === CacheTags.deployer_balance) {
          return Number(await getDeployerBalance());
        }
        if (key === CacheTags.undeployed_wrappers) {
          return (await getUndeployedWrappers(db)).length;
        }
        if (key === CacheTags.pending_wrappers) {
          const rows = await getPendingWrappers(db);
          return rows.length;
        }
        if (key === CacheTags.total_bridged_names) {
          return fetcher.fetchTotalInscribedNames();
        }
        return 0;
      },
    });
    new Gauge({
      help: 'Total number of BNSx names',
      name: 'bnsx_names_total',
      async collect() {
        this.set((await cache.fetch(CacheTags.total_names)) ?? -1);
      },
    });

    if (isDeployerEnabled()) {
      new Gauge({
        help: 'Wrapper deployer balance',
        name: 'wrapper_deployer_balance',
        async collect() {
          const balance = await cache.fetch(CacheTags.deployer_balance);
          this.set(balance ?? -1);
        },
      });

      new Gauge({
        help: 'Total number of undeployed wrappers',
        name: 'undeployed_wrappers_total',
        async collect() {
          const count = await cache.fetch(CacheTags.undeployed_wrappers);
          this.set(count ?? -1);
        },
      });

      new Gauge({
        help: 'Available STX for deployments',
        name: 'available_deployer_contract',
        async collect() {
          const balance = await cache.fetch(CacheTags.deployer_balance);
          if (typeof balance === 'undefined') {
            return;
          }
          const available = balance / Number(DEPLOY_FEE);
          this.set(available);
        },
      });

      new Gauge({
        help: 'Total inscribed names',
        name: 'total_inscribed_names',
        async collect() {
          const count = await cache.fetch(CacheTags.total_bridged_names);
          this.set(count ?? -1);
        },
      });

      new Gauge({
        help: 'Total pending inscription wrappers',
        name: 'pending_wrappers_total',
        async collect() {
          const count = await cache.fetch(CacheTags.pending_wrappers);
          this.set(count ?? -1);
        },
      });
    }
  }

  const reqSummaryRolling = new Summary({
    name: 'request_summary_seconds_rolling',
    help: 'Rolling metric for request time',
    labelNames: ['route', 'method', 'status_code'] as const,
    maxAgeSeconds: 600,
    ageBuckets: 5,
  });

  server.addHook('onResponse', (request, reply, done) => {
    if (request.routeConfig.disableMetrics === true) {
      return done();
    }

    const method = request.routerMethod ?? request.method;

    const route = request.routeConfig.statsId ?? request.routerPath;
    const statusCode = reply.statusCode;

    const duration = reply.getResponseTime();

    reply.log.info(
      {
        route,
        statusCode,
        duration,
      },
      'outgoing response'
    );

    const labels = {
      route,
      method,
      status_code: statusCode,
    };

    reqSummaryRolling.labels(labels).observe(duration / 1000);

    requestCount.labels(labels).inc();
  });
  return await Promise.resolve();
});
