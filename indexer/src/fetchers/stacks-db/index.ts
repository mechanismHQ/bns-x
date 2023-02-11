import { registryContract, registryContractAsset } from '../../contracts';
import type { StacksDb } from '@db';
import { decodeClarityValue } from 'stacks-encoding-native-js';
import {
  deserializeCV,
  cvToTrueValue,
  contractPrincipalCV,
  principalCV,
  standardPrincipalCV,
  serializeCV,
} from 'micro-stacks/clarity';
import { cvToJSON, cvToValue } from '@clarigen/core';
import { bytesToHex } from 'micro-stacks/common';
import { convertLegacyDetailsJson, convertNameBuff } from '../../contracts/utils';
import type { NamesByAddressResponse } from '../../routes/api-types';
import { getLegacyName } from '../query-helper';
import { fetchPrimaryId } from '../stacks-api';

export async function getAssetIds(address: string, db: StacksDb) {
  const custodies = await db.nftCustody.findMany({
    where: {
      recipient: address,
      assetIdentifier: registryContractAsset(),
    },
  });

  const ids = custodies.map(nft => {
    const dec = decodeClarityValue(nft.value);
    const cv = deserializeCV(dec.hex);
    return cvToJSON<number>(cv);
  });

  return ids;
}

function deserializeTuple<T>(row: { value: Buffer }): T {
  return cvToJSON<T>(deserializeCV(decodeClarityValue(row.value).hex));
}

export async function getPrimaryNameId(address: string, db: StacksDb) {
  const principalCV = address.includes('.')
    ? contractPrincipalCV(address)
    : standardPrincipalCV(address);
  const registry = registryContract().identifier;
  const principalHex = `${bytesToHex(serializeCV(principalCV))}`;
  const results = (await db.$queryRaw`
    select value
    from contract_logs
    where
      contract_identifier = ${registry}
      
      and position(bytea '\\x0e7072696d6172792d757064617465' in value) > 0
      and position(decode(${principalHex}, 'hex') in value) > 0
      and canonical = true
    order by
      block_height desc,
      microblock_sequence desc,
      tx_index desc,
      event_index desc
    limit 10
  `) as { value: Buffer }[];
  const [result] = results;

  if (typeof result === 'undefined') return null;

  const print = deserializeTuple<{
    topic: 'primary-update';
    id: bigint | null;
    account: string;
    prev: bigint | null;
  }>(result);

  return print;
}

export async function getNamesForAddress(address: string, db: StacksDb) {
  const asset = registryContractAsset();
  const registry = registryContract().identifier;

  const results = (await db.$queryRaw`
  with ids as (
    select value
    from nft_custody_unanchored
    where asset_identifier = ${asset}
    and recipient = ${address}
  )
  select contract_logs.value
  from contract_logs, ids
  where 
    contract_identifier = ${registry}
    and position(bytea '\\x6e65772d6e616d65' in contract_logs.value) > 0
    and position(ids.value in "contract_logs"."value") > 0
    and microblock_canonical = true;
  `) as { value: Buffer }[];

  const prints = results.map(row => {
    const { topic, owner, ...print } = deserializeTuple<{
      id: string;
      name: {
        name: string;
        namespace: string;
      };
      owner: string;
      topic: 'new-name';
    }>(row);
    return convertNameBuff({
      ...print,
      ...print.name,
      id: parseInt(print.id, 10),
    });
    // return print;
  });

  return prints;
}

export async function getAddressNamesDb(
  address: string,
  db: StacksDb
): Promise<NamesByAddressResponse> {
  const [_legacy, _names, primaryId] = await Promise.all([
    getLegacyName(address),
    getNamesForAddress(address, db),
    fetchPrimaryId(address),
  ]);

  const legacy = _legacy === null ? null : convertLegacyDetailsJson(convertNameBuff(_legacy));

  const nameStrings = _names.map(n => n.combined);
  if (legacy !== null) {
    nameStrings.push(legacy.combined);
  }
  const displayName = nameStrings[0] ?? null;

  const primaryProperties = _names.find(n => n.id === primaryId) ?? null;

  const primaryName = primaryProperties?.combined ?? null;

  return {
    legacy,
    names: nameStrings,
    nameProperties: _names,
    primaryProperties,
    displayName,
    primaryName,
  };
}

export async function getTotalNames(db: StacksDb) {
  const count = db.nftCustody.count({
    where: {
      assetIdentifier: registryContractAsset(),
    },
  });
  return count;
}
