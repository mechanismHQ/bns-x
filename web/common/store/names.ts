import { clarigenAtom, nameRegistryState, registryAssetState } from '.';
import { atom } from 'jotai';
import {
  currentAccountAtom,
  networkAtom,
  primaryAccountState,
  stxAddressAtom,
} from '@store/micro-stacks';
import { convertNameBuff, getContractParts } from '../utils';
import type { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { cvToValue } from '@clarigen/core';
import { deserializeCV } from 'micro-stacks/clarity';
import { atomFamily, waitForAll } from 'jotai/utils';
import { addressDisplayNameState, bnsApi, contractSrcState, namesForAddressState } from './api';
import { trpc } from './api';
import { getApiUrl } from '@common/constants';
import { parseZoneFile, makeZoneFile } from '@fungible-systems/zone-file';
import { nameUpgradingAtom } from '@store/migration';
import type { NameInfoResponse } from '@bns-x/core';
import { doesNamespaceExpire, parseFqn } from '@bns-x/core';
import type { ZoneFileObject } from '@bns-x/client';
import { ZoneFile } from '@bns-x/client';

export const currentUserNamesState = atom(get => {
  const address = get(stxAddressAtom);
  if (!address) return null;
  return get(namesForAddressState(address));
});

export const currentUserV1NameState = atom(get => {
  const addr = get(stxAddressAtom);
  if (!addr) return null;
  return get(addressCoreNameAtom(addr));
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
});

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

export const primaryNameState = atom(get => {
  const primary = get(primaryAccountState);
  if (!primary) return null;
  return get(addressDisplayNameState(primary.stxAddress));
});

export const currentUserNameIdsState = atom<number[]>(get => {
  const names = get(currentUserNamesState);
  if (!names) return [];
  return names.nameProperties.map(n => n.id);
});

export const currentUserUpgradedState = atom(get => {
  const toUpgrade = get(nameUpgradingAtom);
  if (toUpgrade === null) return false;
  const nameDetails = get(nameDetailsAtom(toUpgrade));
  return nameDetails?.isBnsx ?? false;
});

export function addressCoreNameQueryKey(address: string) {
  return ['addr-core-name', address];
}

export const addressCoreNameAtom = atomFamily((address: string) => {
  return atomsWithQuery(() => ({
    queryKey: addressCoreNameQueryKey(address),
    // refetchInterval: 15000,
    async queryFn() {
      return trpc.getCoreName.query({ address });
    },
  }))[0];
});

export const addressNameStringsAtom = atomFamily((address: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['addr-name-strings', address],
    refetchInterval: 15000,
    async queryFn() {
      const res = await trpc.getAddressNameStrings.query({ address });
      return res;
    },
  }))[0];
});

export const currentUserAddressNameStringsState = atom(get => {
  const addr = get(stxAddressAtom);
  if (typeof addr === 'undefined') {
    throw new Error('Unable to get current user address');
  }
  return get(addressNameStringsAtom(addr));
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
});

export const nameExpirationBlockState = atomFamily((name: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['name-expiration-block', name],
    queryFn: () => {
      const details = get(nameDetailsAtom(name));
      if (details === null) return null;
      const { namespace } = parseFqn(name);
      if (!doesNamespaceExpire(namespace)) return null;
      if (typeof details.expire_block === 'undefined') return null;
      return details.expire_block;
    },
  }))[0];
});

export enum WrapperVersion {
  V1,
  V2,
}

export const nameWrapperVersionState = atomFamily((wrapperId: string) => {
  return atom(get => {
    const source = get(contractSrcState(wrapperId));
    if (source.includes('name-renewal')) return WrapperVersion.V2;
    return WrapperVersion.V1;
  });
});

export const canNameBeRenewedState = atomFamily((name: string) => {
  return atom(get => {
    const [details, expireBlock] = get(
      waitForAll([nameDetailsAtom(name), nameExpirationBlockState(name)])
    );
    if (details === null || expireBlock === null) return false;
    if (details.isBnsx === false) return true;
    const wrapperVersion = get(nameWrapperVersionState(details.wrapper));
    return wrapperVersion !== WrapperVersion.V1;
  });
});

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

export const ZONEFILE_TEMPLATE =
  '{$origin}\n{$ttl}\n{uri}\n{a}\n{aaaa}\n{cname}\n{mx}\n{srv}\n{txt}\n';

export const parsedUserZonefileState = atom<ZoneFile | null>(get => {
  const baseZonefile = get(userZonefileState[0]);
  if (typeof baseZonefile === 'string') {
    try {
      parseZoneFile(baseZonefile);
      return new ZoneFile(baseZonefile);
    } catch (error) {}
  }
  return get(defaultUserZonefileState);
});

export const defaultUserZonefileState = atom<ZoneFile | null>(get => {
  const userData = get(currentAccountAtom);
  const name = get(userNameState);
  if (typeof userData === 'undefined') return null;
  if (name === null) return null;
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
  const zonefileString = makeZoneFile({
    $origin: `${name}.`,
    $ttl: 3600,
    uri,
  });
  return new ZoneFile(zonefileString);
});

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
