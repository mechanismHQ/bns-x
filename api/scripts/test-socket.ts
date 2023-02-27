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

function run() {
  const client = makeSocket();
  client.socket.on('mempool', () => {
    console.log('connected');
  });
  client.socket.on('connect', () => {
    log.debug('Connected to websocket');
  });
  client.socket.on('connect_error', () => {
    log.error('connect_error to websocket');
  });
  client.socket.on('disconnect', e => {
    console.log(e);
    if (e === 'io server disconnect') {
      client.socket.connect();
    }
    log.error('Disconnected from websocket');
  });
}

run();
