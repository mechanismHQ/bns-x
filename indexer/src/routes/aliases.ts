import "../prisma-plugin";
import { FastifyPluginCallback } from "fastify";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { queryHelperRouter } from "./query-helper-router";
import { createContext } from "./context";
import { TRPCError } from "@trpc/server";

export const aliasRoutes: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get<{
    Params: {
      name: string;
      namespace: string;
    };
  }>("/names/:name/:namespace", async (req, res) => {
    const caller = queryHelperRouter.createCaller(createContext({ req, res }));
    const { name, namespace } = req.params;
    try {
      const details = await caller.getNameDetails(req.params);
      return res.status(200).send(details);
    } catch (error) {
      if (error instanceof TRPCError) {
        const status = getHTTPStatusCodeFromError(error);
        if (status !== 404) {
          console.error(
            `Error fetching details for ${name}.${namespace}:`,
            error
          );
        }
        return res.status(status).send({ error: { message: error.message } });
      }
      console.error(
        `Unexpected error fetching details for ${name}.${namespace}:`,
        error
      );
      return res.status(500).send({ error: { message: "Unexpected error" } });
    }
  });

  fastify.get<{
    Params: {
      principal: string;
    };
  }>("/addresses/stacks/:principal", async (req, res) => {
    const caller = queryHelperRouter.createCaller(createContext({ req, res }));
    const { principal } = req.params;
    try {
      const names = await caller.getAddressNames(principal);
      return res.status(200).send(names);
    } catch (error) {
      if (error instanceof TRPCError) {
        const status = getHTTPStatusCodeFromError(error);
        console.error(`Error fetching details for ${principal}:`, error);
        return res.status(status).send({ error: { message: error.message } });
      }
      console.error(
        `Unexpected error fetching details for ${principal}:`,
        error
      );
      return res.status(500).send({ error: { message: "Unexpected error" } });
    }
  });

  done();
};
