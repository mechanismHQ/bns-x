import '../prisma-plugin';
import type { FastifyPluginCallback } from 'fastify';
// import { dataRouter } from "./trpc-router";
import { createContext } from './trpc/context';

export interface CoreNodeAttachmentMessage {
  attachment_index: number;
  index_block_hash: string;
  block_height: string; // string quoted integer?
  content_hash: string;
  contract_id: string;
  /** Hex serialized Clarity value */
  metadata: string;
  tx_id: string;
  /* Hex encoded attachment content bytes */
  content: string;
}

export const eventObserverRoutes: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.post<{
    Body: CoreNodeAttachmentMessage[];
  }>('/attachments/new', async (req, res) => {
    const data = req.body;
    console.log('---');
    console.log('Attachments:');
    data.forEach(a => console.log(a));
    console.log('---');
    return res.status(200).send({ result: 'ok' });
  });

  fastify.post('*', async (req, res) => {
    console.log(req.url);
    return res.status(200).send({ result: 'ok' });
  });

  done();
};
