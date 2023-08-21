import { Gauge, Counter, Summary } from 'prom-client';
import 'fastify-metrics';
import type { FastifyPluginAsync } from './routes/api-types';
import { getTotalNames } from './fetchers/stacks-db';
import fp from 'fastify-plugin';
import { logger } from '~/logger';

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

  const db = server.stacksPrisma;
  if (typeof db !== 'undefined') {
    new Gauge({
      help: 'Total number of BNSx names',
      name: 'bnsx_names_total',
      async collect() {
        this.set(await getTotalNames(db));
      },
    });
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
