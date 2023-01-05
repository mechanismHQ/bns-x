import {
  BitcoinChainEvent,
  BitcoinTransactionMetadata,
  Block,
  StacksChainEvent,
  StacksFTBurnEventData,
  StacksNFTMintEventData,
  StacksNFTBurnEventData,
  StacksNFTTransferEventData,
  StacksTransactionEventType,
  Transaction,
  StacksTransactionMetadata,
  StacksSmartContractEventData,
  StacksTransactionEvent,
} from "@hirosystems/chainhook-types";
import { FastifyPluginAsync, FastifyPluginCallback } from "fastify";
import { deserializeCV, hexToCV } from "micro-stacks/clarity";
import { cvToValue, NftBurnEvent } from "@clarigen/core";
import { PrismaClient, Name, Account, Prisma } from "@prisma/client";
import "./prisma-plugin";
import PQueue from "p-queue";
import { bytesToAscii, bytesToHex } from "micro-stacks/common";

export interface NewNamePrint {
  topic: "new-name";
  owner: string;
  name: {
    name: Uint8Array;
    namespace: Uint8Array;
  };
  id: bigint;
}

export interface MigratePrint {
  topic: "migrate";
  wrapper: string;
  id: BigInt;
}

type TxWithPrint<T> = {
  tx: StacksTransactionMetadata;
  print: T;
};

export function filterEvents<T>(blocks: Block[], topic: string) {
  const txs: TxWithPrint<T>[] = [];
  blocks.forEach((block) => {
    block.transactions.forEach((tx) => {
      const meta = tx.metadata as StacksTransactionMetadata;
      meta.receipt.events.forEach((e) => {
        // console.log(e.type);
        if (e.type !== "SmartContractEvent") return;
        const print = e.data as StacksSmartContractEventData;
        const hex = (print as any).raw_value as string;
        const cv = deserializeCV(hex);
        const data = cvToValue<T>(cv);
        if ((data as any).topic === topic) {
          txs.push({
            tx: meta,
            print: data,
          });
        }
        // console.log(data);
        // console.log(print);
        // console.log(print.value);
      });
    });
  });
  return txs;
}

type TxWithNftEvent = {
  tx: StacksTransactionMetadata;
  id: number;
  newOwner?: string;
};

type NFTBurnEvent = {
  type: "NFTBurnEvent";
  data: StacksNFTBurnEventData & { raw_value: string };
};
type NFTTransferEvent = {
  type: "NFTTransferEvent";
  data: StacksNFTTransferEventData & { raw_value: string };
};
type NFTMintEvent = {
  type: "NFTMintEvent";
  data: StacksNFTMintEventData & { raw_value: string };
};

type EventFilter<T> = (event: T) => void;

export function useNFTBurnEvent(
  event: StacksTransactionEvent,
  cb: EventFilter<NFTBurnEvent>
) {
  if (event.type === "NFTBurnEvent") {
    cb(event as NFTBurnEvent);
  }
}

export function useNFTMintEvent(
  event: StacksTransactionEvent,
  cb: EventFilter<NFTMintEvent>
) {
  if (event.type === "NFTMintEvent") {
    cb(event as NFTMintEvent);
  }
}

export function useNFTTransferEvent(
  event: StacksTransactionEvent,
  cb: EventFilter<NFTTransferEvent>
) {
  if (event.type === "NFTTransferEvent") {
    cb(event as NFTTransferEvent);
  }
}

function hexToId(hex: string) {
  const cv = deserializeCV(hex);
  const idNum = cvToValue<bigint>(cv);
  return Number(idNum);
}

export function filterNftEvents(blocks: Block[]) {
  const txs: TxWithNftEvent[] = [];
  blocks.forEach((block) => {
    block.transactions.forEach((tx) => {
      const meta = tx.metadata as StacksTransactionMetadata;
      meta.receipt.events.forEach((e) => {
        useNFTBurnEvent(e, (event) => {
          if (
            event.data.asset_identifier ===
            "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry::names"
          )
            txs.push({
              tx: meta,
              id: hexToId(event.data.raw_value),
            });
        });
        useNFTTransferEvent(e, (event) => {
          if (
            event.data.asset_identifier ===
            "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry::names"
          )
            txs.push({
              tx: meta,
              id: hexToId(event.data.raw_value),
              newOwner: event.data.recipient,
            });
        });
        useNFTMintEvent(e, (event) => {
          if (
            event.data.asset_identifier ===
            "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry::names"
          )
            txs.push({
              tx: meta,
              id: hexToId(event.data.raw_value),
              newOwner: event.data.recipient,
            });
        });
      });
    });
  });
  return txs;
}

async function handleNewNames(prisma: PrismaClient, event: StacksChainEvent) {
  const txs = filterEvents<NewNamePrint>(event.apply, "new-name");
  const queue = new PQueue({ concurrency: 1 });
  txs.forEach(({ tx, print }) => {
    queue.add(async () => {
      const principal = print.owner;
      const id = Number(print.id);
      // await fastify.prisma.account.
      const account = await prisma.account.upsert({
        where: {
          principal,
        },
        create: {
          principal,
        },
        update: {},
      });
      const nameProps = {
        name: bytesToAscii(print.name.name),
        namespace: bytesToAscii(print.name.namespace),
        nftId: id,
        owner: {
          connect: {
            id: account.id,
          },
        },
      };
      const name = await prisma.name.upsert({
        where: {
          nftId: id,
        },
        create: nameProps,
        update: nameProps,
      });

      if (account.primaryNameId === null) {
        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            primaryNameId: id,
          },
        });
      }
    });
  });
  await queue.onIdle();
}

async function handleWrappers(prisma: PrismaClient, event: StacksChainEvent) {
  const txs = filterEvents<MigratePrint>(event.apply, "migrate");
  const queue = new PQueue({ concurrency: 1 });

  txs.forEach(({ tx, print }) => {
    queue.add(async () => {
      const wrapperProps = {
        name: {
          connect: { nftId: Number(print.id) },
        },
        principal: print.wrapper,
      };
      await prisma.wrapper.upsert({
        where: {
          principal: print.wrapper,
        },
        create: wrapperProps,
        update: wrapperProps,
      });
    });
  });
  await queue.onIdle();
  return txs;
}

async function handleNfts(prisma: PrismaClient, event: StacksChainEvent) {
  const txs = filterNftEvents(event.apply);
  const queue = new PQueue({ concurrency: 1 });
  txs.forEach((nft) => {
    queue.add(async () => {
      if (nft.newOwner) {
        const name = await prisma.name.update({
          where: {
            nftId: nft.id,
          },
          include: {
            owner: true,
          },
          data: {
            owner: {
              connectOrCreate: {
                where: { principal: nft.newOwner },
                create: { principal: nft.newOwner },
              },
            },
          },
        });
        await prisma.account.update({
          where: {
            principal: nft.newOwner,
            primaryNameId: undefined,
          },
          data: {
            primaryNameId: nft.id,
          },
        });
      }
    });
  });
  await queue.onIdle();
  return txs;
}

export const hooksRouter: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.post<{
    Body: StacksChainEvent;
  }>("/hooks/nft-event", async (req, res) => {
    // console.log(req.body);
    const event = req.body;
    console.log(event);
    return res.send({
      success: true,
    });
  });

  fastify.post<{ Body: StacksChainEvent }>(
    "/hooks/new-name",
    async (req, res) => {
      await handleNewNames(fastify.prisma, req.body);
      const wraps = await handleWrappers(fastify.prisma, req.body);
      wraps.forEach(({ print }) => {
        fastify.log.info(print);
      });
      const nfts = await handleNfts(fastify.prisma, req.body);
      nfts.forEach((nft) => {
        fastify.log.info({
          id: nft.id,
          newOwner: nft.newOwner,
        });
      });
      return res.send({
        success: true,
      });
    }
  );

  done();
};
