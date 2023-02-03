import type {
  Block,
  StacksTransactionMetadata,
  StacksSmartContractEventData,
} from '@hirosystems/chainhook-types';
import {
  BitcoinChainEvent,
  BitcoinTransactionMetadata,
  StacksChainEvent,
  StacksFTBurnEventData,
  StacksNFTMintEventData,
  StacksNFTBurnEventData,
  StacksNFTTransferEventData,
  StacksTransactionEventType,
  Transaction,
  StacksTransactionEvent,
} from '@hirosystems/chainhook-types';
import { deserializeCV, hexToCV } from 'micro-stacks/clarity';
import { cvToValue, NftBurnEvent } from '@clarigen/core';
import type { NFTTransferEvent } from './types';

type TxWithPrint<T> = {
  tx: StacksTransactionMetadata;
  print: T;
};

export function filterEvents<T>(blocks: Block[], topic: string) {
  const txs: TxWithPrint<T>[] = [];
  blocks.forEach(block => {
    block.transactions.forEach(tx => {
      const meta = tx.metadata as StacksTransactionMetadata;
      meta.receipt.events.forEach(e => {
        // console.log(e.type);
        if (e.type !== 'SmartContractEvent') return;
        const print = e.data as StacksSmartContractEventData;
        if (!isDeployer(print.contract_identifier)) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const hex = (print as any).raw_value as string;
        const cv = deserializeCV(hex);
        const data = cvToValue<T>(cv);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((data as any).topic === topic) {
          txs.push({
            tx: meta,
            print: data,
          });
        }
      });
    });
  });
  return txs;
}

function isDeployer(contractId: string) {
  const [deployer] = contractId.split('.');
  return deployer === 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
}

function hexToId(hex: string) {
  const cv = deserializeCV(hex);
  const idNum = cvToValue<bigint>(cv);
  return Number(idNum);
}

interface NameTransfer {
  sender: string;
  recipient: string;
  id: number;
}

export function filterTransfers(blocks: Block[]) {
  const transfers: NameTransfer[] = [];
  blocks.forEach(block => {
    block.transactions.forEach(tx => {
      const meta = tx.metadata as StacksTransactionMetadata;
      meta.receipt.events.forEach(e => {
        if (e.type !== 'NFTTransferEvent') return;
        const event = e as NFTTransferEvent;
        if (!isDeployer(event.data.asset_identifier)) return;
        transfers.push({
          id: hexToId(event.data.raw_value),
          sender: event.data.sender,
          recipient: event.data.recipient,
        });
      });
    });
  });
  return transfers;
}
