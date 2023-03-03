import { clarigenAtom, nameRegistryState, registryAssetState } from '.';
import { atom } from 'jotai';
import { currentAccountAtom, networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { convertNameBuff, getContractParts } from '../utils';
import type { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { cvToValue } from '@clarigen/core';
import { deserializeCV } from 'micro-stacks/clarity';
import { atomFamily } from 'jotai/utils';
import { addressDisplayNameState, bnsApi, namesForAddressState } from './api';
import isEqual from 'lodash-es/isEqual';
import { trpc } from './api';
import { getApiUrl } from '@common/constants';
import type { ZoneFile } from '@fungible-systems/zone-file';
import { parseZoneFile, makeZoneFile } from '@fungible-systems/zone-file';
import { nameUpgradingAtom } from '@store/migration';
import type { NameInfoResponse } from '@bns-x/core';

export const currentUserNamesState = atom(get => {
  const address = get(stxAddressAtom);
  if (!address) return null;
  return get(namesForAddressState(address));
});

export const currentUserV1NameState = atom(get => {
  const names = get(currentUserNamesState);
  return names?.coreName ?? null;
});

export const addressPrimaryNameState2 = atomFamily((address: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['addr-primary-name', address],
    async queryFn() {
      const registry = get(nameRegistryState);
      const clarigen = get(clarigenAtom);
      const res = await clarigen.ro(registry.getPrimaryNameProperties(address));
      if (res) {
        return convertNameBuff(res);
      }
      return res;
    },
  }))[0];
}, isEqual);

export const userPrimaryNameState = atom(get => {
  const names = get(currentUserNamesState);
  if (names === null) return null;
  return names.primaryProperties;
});

export const userNameState = atom<string | null>(get => {
  const address = get(stxAddressAtom);
  if (!address) return null;
  return get(addressDisplayNameState(address));
});

export const currentUserNameIdsState = atom<number[]>(get => {
  const names = get(currentUserNamesState);
  if (!names) return [];
  return names.nameProperties.map(n => n.id);
});

export const currentUserNameIdsState2 = atomsWithQuery<number[]>(get => ({
  queryKey: ['cur-user-names', get(stxAddressAtom)],
  refetchInterval: 10000,
  queryFn: async () => {
    const network = get(networkAtom);
    const urlBase = network.getCoreApiUrl();
    const addr = get(stxAddressAtom);
    if (!addr) return [];
    const params = new URLSearchParams({
      principal: addr,
      unanchored: 'true',
      // asset_identifiers: asset,
    });
    const url = `${urlBase}/extended/v1/tokens/nft/holdings?${params.toString()}`;
    const res = await fetch(url);
    const data = (await res.json()) as NonFungibleTokenHoldingsList;
    return data.results
      .map(d => {
        const bign = cvToValue<bigint>(deserializeCV(d.value.hex));
        return Number(bign);
      })
      .filter(n => !Number.isNaN(n));
  },
}));

export const currentUserUpgradedState = atom(get => {
  const toUpgrade = get(nameUpgradingAtom);
  if (toUpgrade === null) return false;
  const nameDetails = get(nameDetailsAtom(toUpgrade));
  return nameDetails?.isBnsx ?? false;
});

export const nameDetailsAtom = atomFamily((name: string) => {
  return atomsWithQuery<NameInfoResponse | null>(get => ({
    queryKey: ['name-details', name],
    // If we're migrating this name, keep polling until the
    // name is migrated.
    refetchInterval(data) {
      const toUpgrade = get(nameUpgradingAtom);
      if (toUpgrade !== name) return false;
      if (data?.isBnsx) return false;
      return 5000;
    },
    async queryFn() {
      const details = await bnsApi.getNameDetailsFromFqn(name);
      return details;
    },
  }))[0];
}, isEqual);

export const userZonefileState = atomsWithQuery(get => ({
  queryKey: ['cur-user-zonefile', get(stxAddressAtom)],
  queryFn: () => {
    const nameFull = get(userNameState);
    if (nameFull === null) return null;
    const details = get(nameDetailsAtom(nameFull));
    return details?.zonefile;
  },
}));

export const zonefileBtcAddressAtom = atom('');

type ZoneFileObject = ZoneFile['jsonZoneFile'];

export const ZONEFILE_TEMPLATE =
  '{$origin}\n{$ttl}\n{uri}\n{a}\n{aaaa}\n{cname}\n{mx}\n{srv}\n{txt}\n';

export const combinedZonefileState = atom(get => {
  const baseZonefile = get(userZonefileState[0]);
  const btc = get(zonefileBtcAddressAtom);
  const userData = get(currentAccountAtom);
  const name = get(userNameState);
  if (!name) return null;
  let zonefile: ZoneFileObject;
  if (baseZonefile) {
    zonefile = parseZoneFile(baseZonefile);
    if (btc) {
      const txt = zonefile.txt ?? [];
      txt.push({
        name: '_btc._addr',
        txt: btc,
      });
      zonefile.txt = txt;
    }
  } else {
    const gaia = userData?.profile_url;
    const uri = gaia
      ? [
          {
            name: '_http._tcp',
            target: gaia,
            priority: 10,
            weight: 1,
          },
        ]
      : undefined;

    const txt = btc
      ? [
          {
            name: '_btc._addr',
            txt: btc,
          },
        ]
      : undefined;

    zonefile = {
      $origin: `${name}.`,
      $ttl: 3600,
      uri,
      txt,
    };
  }
  return makeZoneFile(zonefile, ZONEFILE_TEMPLATE);
});

export const inscriptionZonefileState = atom(get => {
  const name = get(userNameState);
  const zonefile = get(combinedZonefileState);
  const signed = get(signedInscriptionZonefileAtom);
  if (name === null || zonefile === null) {
    return null;
  }
  let zfPayload = `${name} - Bitcoin Name System
----------
${zonefile}
----------`;
  if (signed !== null) {
    zfPayload += `\n${signed.signature}\n${signed.publicKey}`;
  }
  return zfPayload;
});

export const signedInscriptionZonefileAtom = atom<{ publicKey: string; signature: string } | null>(
  null
);
