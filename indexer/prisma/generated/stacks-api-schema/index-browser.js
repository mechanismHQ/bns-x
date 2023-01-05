
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum
} = require('./runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.7.1
 * Query Engine version: 272861e07ab64f234d3ffc4094e32bd61775599c
 */
Prisma.prismaVersion = {
  client: "4.7.1",
  engine: "272861e07ab64f234d3ffc4094e32bd61775599c"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = () => (val) => val


/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

exports.Prisma.BlocksScalarFieldEnum = makeEnum({
  index_block_hash: 'index_block_hash',
  block_hash: 'block_hash',
  block_height: 'block_height',
  burn_block_time: 'burn_block_time',
  burn_block_hash: 'burn_block_hash',
  burn_block_height: 'burn_block_height',
  miner_txid: 'miner_txid',
  parent_index_block_hash: 'parent_index_block_hash',
  parent_block_hash: 'parent_block_hash',
  parent_microblock_hash: 'parent_microblock_hash',
  parent_microblock_sequence: 'parent_microblock_sequence',
  canonical: 'canonical',
  execution_cost_read_count: 'execution_cost_read_count',
  execution_cost_read_length: 'execution_cost_read_length',
  execution_cost_runtime: 'execution_cost_runtime',
  execution_cost_write_count: 'execution_cost_write_count',
  execution_cost_write_length: 'execution_cost_write_length'
});

exports.Prisma.Burnchain_rewardsScalarFieldEnum = makeEnum({
  id: 'id',
  canonical: 'canonical',
  burn_block_hash: 'burn_block_hash',
  burn_block_height: 'burn_block_height',
  burn_amount: 'burn_amount',
  reward_recipient: 'reward_recipient',
  reward_amount: 'reward_amount',
  reward_index: 'reward_index'
});

exports.Prisma.Config_stateScalarFieldEnum = makeEnum({
  id: 'id',
  bns_names_onchain_imported: 'bns_names_onchain_imported',
  bns_subdomains_imported: 'bns_subdomains_imported',
  token_offering_imported: 'token_offering_imported'
});

exports.Prisma.ContractLogsScalarFieldEnum = makeEnum({
  id: 'id',
  event_index: 'event_index',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  canonical: 'canonical',
  contract_identifier: 'contract_identifier',
  topic: 'topic',
  value: 'value'
});

exports.Prisma.Event_observer_requestsScalarFieldEnum = makeEnum({
  id: 'id',
  receive_timestamp: 'receive_timestamp',
  event_path: 'event_path',
  payload: 'payload'
});

exports.Prisma.Faucet_requestsScalarFieldEnum = makeEnum({
  id: 'id',
  currency: 'currency',
  address: 'address',
  ip: 'ip',
  occurred_at: 'occurred_at'
});

exports.Prisma.Ft_eventsScalarFieldEnum = makeEnum({
  id: 'id',
  event_index: 'event_index',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  canonical: 'canonical',
  asset_event_type_id: 'asset_event_type_id',
  asset_identifier: 'asset_identifier',
  amount: 'amount',
  sender: 'sender',
  recipient: 'recipient'
});

exports.Prisma.Ft_metadataScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  token_uri: 'token_uri',
  description: 'description',
  image_uri: 'image_uri',
  image_canonical_uri: 'image_canonical_uri',
  contract_id: 'contract_id',
  symbol: 'symbol',
  decimals: 'decimals',
  tx_id: 'tx_id',
  sender_address: 'sender_address'
});

exports.Prisma.JsonNullValueFilter = makeEnum({
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
});

exports.Prisma.JsonNullValueInput = makeEnum({
  JsonNull: Prisma.JsonNull
});

exports.Prisma.Mempool_txsScalarFieldEnum = makeEnum({
  id: 'id',
  pruned: 'pruned',
  tx_id: 'tx_id',
  type_id: 'type_id',
  anchor_mode: 'anchor_mode',
  status: 'status',
  post_conditions: 'post_conditions',
  nonce: 'nonce',
  fee_rate: 'fee_rate',
  sponsored: 'sponsored',
  sponsor_address: 'sponsor_address',
  sponsor_nonce: 'sponsor_nonce',
  sender_address: 'sender_address',
  origin_hash_mode: 'origin_hash_mode',
  raw_tx: 'raw_tx',
  receipt_time: 'receipt_time',
  receipt_block_height: 'receipt_block_height',
  token_transfer_recipient_address: 'token_transfer_recipient_address',
  token_transfer_amount: 'token_transfer_amount',
  token_transfer_memo: 'token_transfer_memo',
  smart_contract_clarity_version: 'smart_contract_clarity_version',
  smart_contract_contract_id: 'smart_contract_contract_id',
  smart_contract_source_code: 'smart_contract_source_code',
  contract_call_contract_id: 'contract_call_contract_id',
  contract_call_function_name: 'contract_call_function_name',
  contract_call_function_args: 'contract_call_function_args',
  poison_microblock_header_1: 'poison_microblock_header_1',
  poison_microblock_header_2: 'poison_microblock_header_2',
  coinbase_payload: 'coinbase_payload',
  coinbase_alt_recipient: 'coinbase_alt_recipient',
  tx_size: 'tx_size'
});

exports.Prisma.MicroblocksScalarFieldEnum = makeEnum({
  id: 'id',
  receive_timestamp: 'receive_timestamp',
  canonical: 'canonical',
  microblock_canonical: 'microblock_canonical',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_parent_hash: 'microblock_parent_hash',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  block_height: 'block_height',
  parent_block_height: 'parent_block_height',
  parent_block_hash: 'parent_block_hash',
  parent_burn_block_height: 'parent_burn_block_height',
  parent_burn_block_time: 'parent_burn_block_time',
  parent_burn_block_hash: 'parent_burn_block_hash',
  block_hash: 'block_hash'
});

exports.Prisma.Miner_rewardsScalarFieldEnum = makeEnum({
  id: 'id',
  block_hash: 'block_hash',
  index_block_hash: 'index_block_hash',
  from_index_block_hash: 'from_index_block_hash',
  mature_block_height: 'mature_block_height',
  canonical: 'canonical',
  recipient: 'recipient',
  miner_address: 'miner_address',
  coinbase_amount: 'coinbase_amount',
  tx_fees_anchored: 'tx_fees_anchored',
  tx_fees_streamed_confirmed: 'tx_fees_streamed_confirmed',
  tx_fees_streamed_produced: 'tx_fees_streamed_produced'
});

exports.Prisma.NamesScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  address: 'address',
  registered_at: 'registered_at',
  expire_block: 'expire_block',
  zonefile_hash: 'zonefile_hash',
  namespace_id: 'namespace_id',
  grace_period: 'grace_period',
  renewal_deadline: 'renewal_deadline',
  resolver: 'resolver',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  event_index: 'event_index',
  status: 'status',
  canonical: 'canonical',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical'
});

exports.Prisma.NamespacesScalarFieldEnum = makeEnum({
  id: 'id',
  namespace_id: 'namespace_id',
  launched_at: 'launched_at',
  address: 'address',
  reveal_block: 'reveal_block',
  ready_block: 'ready_block',
  buckets: 'buckets',
  base: 'base',
  coeff: 'coeff',
  nonalpha_discount: 'nonalpha_discount',
  no_vowel_discount: 'no_vowel_discount',
  lifetime: 'lifetime',
  status: 'status',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  canonical: 'canonical',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical'
});

exports.Prisma.Nft_eventsScalarFieldEnum = makeEnum({
  id: 'id',
  event_index: 'event_index',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  canonical: 'canonical',
  asset_event_type_id: 'asset_event_type_id',
  asset_identifier: 'asset_identifier',
  value: 'value',
  sender: 'sender',
  recipient: 'recipient'
});

exports.Prisma.Nft_metadataScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  token_uri: 'token_uri',
  description: 'description',
  image_uri: 'image_uri',
  image_canonical_uri: 'image_canonical_uri',
  contract_id: 'contract_id',
  tx_id: 'tx_id',
  sender_address: 'sender_address'
});

exports.Prisma.PgmigrationsScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  run_on: 'run_on'
});

exports.Prisma.Pox2_eventsScalarFieldEnum = makeEnum({
  id: 'id',
  event_index: 'event_index',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  canonical: 'canonical',
  stacker: 'stacker',
  locked: 'locked',
  balance: 'balance',
  burnchain_unlock_height: 'burnchain_unlock_height',
  name: 'name',
  pox_addr: 'pox_addr',
  pox_addr_raw: 'pox_addr_raw',
  first_cycle_locked: 'first_cycle_locked',
  first_unlocked_cycle: 'first_unlocked_cycle',
  lock_period: 'lock_period',
  lock_amount: 'lock_amount',
  start_burn_height: 'start_burn_height',
  unlock_burn_height: 'unlock_burn_height',
  delegator: 'delegator',
  increase_by: 'increase_by',
  total_locked: 'total_locked',
  extend_count: 'extend_count',
  reward_cycle: 'reward_cycle',
  amount_ustx: 'amount_ustx'
});

exports.Prisma.Pox_stateScalarFieldEnum = makeEnum({
  id: 'id',
  pox_v1_unlock_height: 'pox_v1_unlock_height'
});

exports.Prisma.Principal_stx_txsScalarFieldEnum = makeEnum({
  id: 'id',
  principal: 'principal',
  tx_id: 'tx_id',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  tx_index: 'tx_index',
  canonical: 'canonical',
  microblock_canonical: 'microblock_canonical'
});

exports.Prisma.QueryMode = makeEnum({
  default: 'default',
  insensitive: 'insensitive'
});

exports.Prisma.Reward_slot_holdersScalarFieldEnum = makeEnum({
  id: 'id',
  canonical: 'canonical',
  burn_block_hash: 'burn_block_hash',
  burn_block_height: 'burn_block_height',
  address: 'address',
  slot_index: 'slot_index'
});

exports.Prisma.Smart_contractsScalarFieldEnum = makeEnum({
  id: 'id',
  tx_id: 'tx_id',
  canonical: 'canonical',
  contract_id: 'contract_id',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  clarity_version: 'clarity_version',
  source_code: 'source_code',
  abi: 'abi'
});

exports.Prisma.SortOrder = makeEnum({
  asc: 'asc',
  desc: 'desc'
});

exports.Prisma.Stx_eventsScalarFieldEnum = makeEnum({
  id: 'id',
  event_index: 'event_index',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  canonical: 'canonical',
  asset_event_type_id: 'asset_event_type_id',
  amount: 'amount',
  sender: 'sender',
  recipient: 'recipient',
  memo: 'memo'
});

exports.Prisma.Stx_lock_eventsScalarFieldEnum = makeEnum({
  id: 'id',
  event_index: 'event_index',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  block_height: 'block_height',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical',
  canonical: 'canonical',
  locked_amount: 'locked_amount',
  unlock_height: 'unlock_height',
  locked_address: 'locked_address',
  contract_name: 'contract_name'
});

exports.Prisma.SubdomainsScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  namespace_id: 'namespace_id',
  fully_qualified_subdomain: 'fully_qualified_subdomain',
  owner: 'owner',
  zonefile_hash: 'zonefile_hash',
  parent_zonefile_hash: 'parent_zonefile_hash',
  parent_zonefile_index: 'parent_zonefile_index',
  tx_index: 'tx_index',
  block_height: 'block_height',
  zonefile_offset: 'zonefile_offset',
  resolver: 'resolver',
  tx_id: 'tx_id',
  canonical: 'canonical',
  index_block_hash: 'index_block_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  microblock_hash: 'microblock_hash',
  microblock_sequence: 'microblock_sequence',
  microblock_canonical: 'microblock_canonical'
});

exports.Prisma.Token_metadata_queueScalarFieldEnum = makeEnum({
  queue_id: 'queue_id',
  tx_id: 'tx_id',
  contract_id: 'contract_id',
  contract_abi: 'contract_abi',
  block_height: 'block_height',
  processed: 'processed',
  retry_count: 'retry_count'
});

exports.Prisma.Token_offering_lockedScalarFieldEnum = makeEnum({
  id: 'id',
  address: 'address',
  value: 'value',
  block: 'block'
});

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TxsScalarFieldEnum = makeEnum({
  id: 'id',
  tx_id: 'tx_id',
  tx_index: 'tx_index',
  raw_result: 'raw_result',
  index_block_hash: 'index_block_hash',
  block_hash: 'block_hash',
  block_height: 'block_height',
  parent_block_hash: 'parent_block_hash',
  burn_block_time: 'burn_block_time',
  parent_burn_block_time: 'parent_burn_block_time',
  type_id: 'type_id',
  anchor_mode: 'anchor_mode',
  status: 'status',
  canonical: 'canonical',
  post_conditions: 'post_conditions',
  nonce: 'nonce',
  fee_rate: 'fee_rate',
  sponsored: 'sponsored',
  sponsor_address: 'sponsor_address',
  sponsor_nonce: 'sponsor_nonce',
  sender_address: 'sender_address',
  origin_hash_mode: 'origin_hash_mode',
  event_count: 'event_count',
  execution_cost_read_count: 'execution_cost_read_count',
  execution_cost_read_length: 'execution_cost_read_length',
  execution_cost_runtime: 'execution_cost_runtime',
  execution_cost_write_count: 'execution_cost_write_count',
  execution_cost_write_length: 'execution_cost_write_length',
  raw_tx: 'raw_tx',
  microblock_canonical: 'microblock_canonical',
  microblock_sequence: 'microblock_sequence',
  microblock_hash: 'microblock_hash',
  parent_index_block_hash: 'parent_index_block_hash',
  token_transfer_recipient_address: 'token_transfer_recipient_address',
  token_transfer_amount: 'token_transfer_amount',
  token_transfer_memo: 'token_transfer_memo',
  smart_contract_clarity_version: 'smart_contract_clarity_version',
  smart_contract_contract_id: 'smart_contract_contract_id',
  smart_contract_source_code: 'smart_contract_source_code',
  contract_call_contract_id: 'contract_call_contract_id',
  contract_call_function_name: 'contract_call_function_name',
  contract_call_function_args: 'contract_call_function_args',
  poison_microblock_header_1: 'poison_microblock_header_1',
  poison_microblock_header_2: 'poison_microblock_header_2',
  coinbase_payload: 'coinbase_payload',
  coinbase_alt_recipient: 'coinbase_alt_recipient'
});

exports.Prisma.ZonefilesScalarFieldEnum = makeEnum({
  id: 'id',
  name: 'name',
  zonefile: 'zonefile',
  zonefile_hash: 'zonefile_hash',
  tx_id: 'tx_id',
  index_block_hash: 'index_block_hash'
});


exports.Prisma.ModelName = makeEnum({
  blocks: 'blocks',
  burnchain_rewards: 'burnchain_rewards',
  config_state: 'config_state',
  ContractLogs: 'ContractLogs',
  event_observer_requests: 'event_observer_requests',
  faucet_requests: 'faucet_requests',
  ft_events: 'ft_events',
  ft_metadata: 'ft_metadata',
  mempool_txs: 'mempool_txs',
  microblocks: 'microblocks',
  miner_rewards: 'miner_rewards',
  names: 'names',
  namespaces: 'namespaces',
  nft_events: 'nft_events',
  nft_metadata: 'nft_metadata',
  pgmigrations: 'pgmigrations',
  pox2_events: 'pox2_events',
  pox_state: 'pox_state',
  principal_stx_txs: 'principal_stx_txs',
  reward_slot_holders: 'reward_slot_holders',
  smart_contracts: 'smart_contracts',
  stx_events: 'stx_events',
  stx_lock_events: 'stx_lock_events',
  subdomains: 'subdomains',
  token_metadata_queue: 'token_metadata_queue',
  token_offering_locked: 'token_offering_locked',
  txs: 'txs',
  zonefiles: 'zonefiles'
});

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
