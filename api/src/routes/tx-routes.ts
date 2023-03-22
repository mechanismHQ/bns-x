import type { FastifyPlugin } from './api-types';
import { errorSchema } from './api-types';
import { z } from 'zod';
import { getNodeUrl, getNetwork, getNetworkKey } from '~/constants';
import { broadcastRawTransaction } from 'micro-stacks/transactions';
import { hexToBytes } from 'micro-stacks/common';
import { logger } from '~/logger';
import { StacksMainnet } from 'micro-stacks/network';

export const mainnetBroadcastURLs = [
  new StacksMainnet().getCoreApiUrl(),
  'https://api.hiro.so',
  'http://seed.hiro.so:20443',
  'http://seed.mainnet.hiro.so:20443',
];

async function tryBroadcast(txBytes: Uint8Array, baseUrl: string, attachment?: Uint8Array) {
  try {
    const url = `${baseUrl}/v2/transactions`;
    await broadcastRawTransaction(txBytes, url, attachment);
  } catch (error) {
    logger.debug({ error }, `Error broadcasting to URL ${baseUrl}`);
  }
}

export const txRoutes: FastifyPlugin = (fastify, _opts, done) => {
  fastify.post(
    '/broadcast',
    {
      schema: {
        tags: ['utilities'],
        summary: 'Broadcast transaction to many neighbors',
        body: z.object({
          txHex: z.string(),
          attachment: z.optional(z.string()),
        }),
        response: {
          200: z.object({
            success: z.literal(true),
          }),
        },
      },
    },
    async (req, res) => {
      const { txHex, attachment } = req.body;
      const txBytes = hexToBytes(txHex.replace('0x', ''));
      const broadcastUrl = getNetwork().getBroadcastApiUrl();
      const attachmentBytes =
        typeof attachment === 'undefined' ? undefined : hexToBytes(attachment);
      const broadcastRes = await broadcastRawTransaction(txBytes, broadcastUrl, attachmentBytes);
      if (getNetworkKey() === 'mainnet') {
        await Promise.all(
          mainnetBroadcastURLs.map(baseUrl => tryBroadcast(txBytes, baseUrl, attachmentBytes))
        );
      }
      logger.debug(
        {
          ...broadcastRes,
        },
        'Broadcasted transaction to network.'
      );
      return res.status(200).send({
        success: true,
      });
    }
  );

  done();
};
