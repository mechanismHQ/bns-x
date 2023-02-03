import type {
  StacksNFTMintEventData,
  StacksNFTBurnEventData,
  StacksNFTTransferEventData,
} from '@hirosystems/chainhook-types';
import {
  BitcoinChainEvent,
  BitcoinTransactionMetadata,
  Block,
  StacksChainEvent,
  StacksFTBurnEventData,
  StacksTransactionEventType,
  Transaction,
  StacksTransactionMetadata,
  StacksSmartContractEventData,
  StacksTransactionEvent,
} from '@hirosystems/chainhook-types';

export type Mutation<Key extends string, Data> = {
  key: Key;
  data: Data;
};

export type UpdatePrimaryName = Mutation<
  'update-primary',
  {
    principal: string;
    previous: bigint;
    new: bigint;
  }
>;

export type NameMint = Mutation<
  'name-mint',
  {
    owner: string;
    name: {
      name: Uint8Array;
      namespace: Uint8Array;
    };
    id: bigint;
  }
>;

export type Transfer = Mutation<
  'transfer',
  {
    id: bigint;
    sender: string;
    recipient: string;
  }
>;

// NFT Events

export type NFTBurnEvent = {
  type: 'NFTBurnEvent';
  data: StacksNFTBurnEventData & { raw_value: string };
};
export type NFTTransferEvent = {
  type: 'NFTTransferEvent';
  data: StacksNFTTransferEventData & { raw_value: string };
};
export type NFTMintEvent = {
  type: 'NFTMintEvent';
  data: StacksNFTMintEventData & { raw_value: string };
};

// Prints

export interface NewNamePrint {
  topic: 'new-name';
  owner: string;
  name: {
    name: Uint8Array;
    namespace: Uint8Array;
  };
  id: bigint;
}

export interface MigratePrint {
  topic: 'migrate';
  wrapper: string;
  id: bigint;
}

export interface PrimaryUpdatePrint {
  topic: 'primary-update';
  account: string;
  id: bigint;
  prev: bigint | null;
}
