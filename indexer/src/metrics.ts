import { Gauge, Counter } from "prom-client";
import "fastify-metrics";
import type { FastifyPluginAsync } from "./routes/api-types";
import { getTotalNames } from "./fetchers/stacks-db";
import fp from "fastify-plugin";

export const serverMetricsPlugin: FastifyPluginAsync = fp(
  async (server, options) => {
    const requestCount = new Counter({
      name: "http_request_count",
      help: "Total number of requests made",
      labelNames: ["route", "method", "status_code"] as const,
    });

    const db = server.stacksPrisma;
    if (typeof db !== "undefined") {
      new Gauge({
        help: "Total number of BNSx names",
        name: "bnsx_names_total",
        async collect() {
          this.set(await getTotalNames(db));
        },
      });
    }

    server.addHook("onResponse", (request, reply, done) => {
      if (request.routeConfig.disableMetrics === true) {
        return done();
      }

      const method = request.routerMethod ?? request.method;

      const route = request.routeConfig.statsId ?? request.routerPath;
      const statusCode = reply.statusCode;

      requestCount
        .labels({
          route,
          method,
          status_code: statusCode,
        })
        .inc();
    });
  }
);
