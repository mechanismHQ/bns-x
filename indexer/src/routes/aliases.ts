import "../prisma-plugin";
import { FastifyPluginCallback } from "fastify";
import { dataRouter } from "./trpc-router";
import { createContext } from "./context";

export const aliasRoutes: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get("/all", async (req, res) => {
    const { prisma } = fastify;
    const users = await prisma.account.findMany({
      take: 10,
      include: {
        primaryName: true,
        names: {
          include: {
            wrapper: {
              select: {
                principal: true,
              },
            },
          },
        },
      },
    });

    return res.code(200).send({
      users,
    });
  });

  fastify.get<{
    Params: {
      name: string;
      namespace: string;
    };
  }>("/names/:name/:namespace", async (req, res) => {
    const caller = dataRouter.createCaller(createContext({ req, res }));
    const result = await caller.getName(req.params);
    return res.code(200).send(result);
  });

  fastify.get<{
    Params: {
      principal: string;
    };
  }>("/accounts/:principal", async (req, res) => {
    const caller = dataRouter.createCaller(createContext({ req, res }));
    const result = await caller.getAccount(req.params.principal);

    return res.status(200).send(result);
  });

  done();
};
