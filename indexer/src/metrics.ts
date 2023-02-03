import { Gauge, Counter } from "prom-client";
import "fastify-metrics";
// import { FastifyInstance } from "fastify";
import type { FastifyServer } from "./routes/api-types";
import { getTotalNames } from "./fetchers/stacks-db";

export function makeMetrics(server: FastifyServer) {
  const requestCount = new Counter({
    name: "http_request_count",
    help: "Total number of requests made",
    labelNames: ["route", "method", "status_code"] as const,
  });

  if (typeof server.stacksPrisma !== "undefined") {
    new Gauge({
      help: "Total number of BNSx names",
      name: "bnsx_names_total",
      async collect() {
        if (server.stacksPrisma) {
          this.set(await getTotalNames(server.stacksPrisma));
        }
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
