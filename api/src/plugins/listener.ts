import type { BnsDb, StacksDb } from '@db';
import { refreshMaterializedViews } from '@db';
import { io } from 'socket.io-client';
import type { StacksApiSocket } from '@stacks/blockchain-api-client';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { getNodeUrl } from '~/constants';
import { syncPrints } from '~/sync/prints';
import type { FastifyPluginAsync } from '@routes/api-types';
import fp from 'fastify-plugin';
import { logger } from '~/logger';

const log = logger.child({
  topic: 'listener',
});

export function makeSocket() {
  // const url = new URL(getNodeUrl());
  // const wsScheme = url.protocol === 'https:' ? 'wss:' : 'ws:';
  // const wsUrl = `${wsScheme}//${url.host}`;
  const socket = io(getNodeUrl(), {
    reconnection: true,
    query: {
      subscriptions: 'block',
    },
    // transportOptions: ['websocket'],
  }) as unknown as StacksApiSocket;
  const sc = new StacksApiSocketClient(socket);

  return sc;
}

let blocked = false;

export function listenAndSyncPrints(bnsDb: BnsDb, stacksDb: StacksDb) {
  const client = makeSocket();

  async function handler() {
    if (blocked) {
      log.info('aleady running');
    } else {
      try {
        blocked = true;
        await syncPrints({ bnsDb, stacksDb });
        await refreshMaterializedViews(bnsDb);
        blocked = false;
      } catch (error) {
        log.error({ error }, 'Error in listener handler');
        blocked = false;
      }
    }
  }
  setTimeout(() => {
    void handler();
  }, 0);
  client.socket.on('microblock', async mb => {
    log.info(
      {
        microblockSequence: mb.microblock_sequence,
        blockHeight: mb.block_height,
      },
      'New microblock'
    );
    await handler();
  });
  client.socket.on('block', async block => {
    log.info(
      {
        blockHeight: block.height,
      },
      'New block'
    );
    await handler();
  });
  client.socket.on('connect', () => {
    log.debug('Connected to websocket');
  });
  client.socket.on('connect_error', () => {
    log.error('connect_error to websocket');
  });
  client.socket.on('disconnect', e => {
    log.debug({ event: e }, 'Disconnected from websocket');
    if (e === 'io server disconnect') {
      client.socket.connect();
    }
    log.error('Disconnected from websocket');
  });
  client.subscribeBlocks();
  client.subscribeMicroblocks();

  return client;
}

export const listenerPlugin: FastifyPluginAsync = fp(async server => {
  if (!server.prisma || !server.stacksPrisma) return;
  if (process.env.SKIP_SYNC === 'true') return;
  logger.info('Starting worker');

  const socket = listenAndSyncPrints(server.prisma, server.stacksPrisma);

  const pingInterval = setInterval(() => {
    if (socket.socket.connected) {
      socket.socket.send('ping');
    }
  }, 1000);

  server.addHook('onClose', () => {
    log.info('Server closing - restart');
    clearInterval(pingInterval);
    socket.socket.close();
  });
  return Promise.resolve();
});
