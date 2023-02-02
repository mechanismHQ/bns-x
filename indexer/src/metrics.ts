import { Gauge, Counter } from "prom-client";
import "fastify-metrics";
// import { FastifyInstance } from "fastify";
import type { FastifyServer } from "./routes/api-types";

export function makeMetrics(server: FastifyServer) {
  const requestCount = new Counter({
    name: "http_request_count",
    help: "Total number of requests made",
    labelNames: ["route", "method", "status_code"] as const,
  });

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
