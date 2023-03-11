import type { Atom, Getter, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import { hashAtom } from './migration';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';
import { parsedUserZonefileState } from '@store/names';
import { nameDetailsAtom } from '@store/names';
import { coreNodeInfoAtom } from '@store/api';
import type { ZoneFile, ZoneFileObject } from '@bns-x/client';
import { doesNamespaceExpire, parseFqn, ZonefileTxtKeys, ZonefileUriKeys } from '@bns-x/client';
import { Address as BtcAddress } from 'micro-btc-signer';
import { nip19 } from 'nostr-tools';
import type { TXTType, URIType } from '@fungible-systems/zone-file/dist/zoneFile';

export const unwrapTxidAtom = hashAtom('unwrapTxid');

export const isEditingProfileAtom = atom(false);

export const nameExpirationAtom = atomFamily((name?: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['name-expiration', name],
    queryFn() {
      if (typeof name === 'undefined') {
        return null;
      }
      const details = get(nameDetailsAtom(name));
      if (details === null) return null;
      const { namespace } = parseFqn(name);
      if (!doesNamespaceExpire(namespace)) return null;
      if (namespace === 'testable') return null; // testnet faucet namespace
      if (typeof details.expire_block === 'undefined') return null;
      const nodeInfo = get(coreNodeInfoAtom);
      if (typeof nodeInfo.burn_block_height !== 'number') return null;
      const blockDiff = details.expire_block - nodeInfo.burn_block_height;
      const timeDiff = blockDiff * 10 * 60 * 1000;
      const expireDate = new Date(new Date().getTime() + timeDiff);
      return [expireDate.getFullYear(), expireDate.getMonth(), expireDate.getDate()].join('-');
    },
  }))[0];
}, Object.is);

type ZfGetter = (zf: ZoneFile | null) => string | null;

type ZfValidator = (value: string) => boolean;

export type ZonefileFieldAtom = {
  value: WritableAtom<string, string>;
  valid: Atom<boolean>;
  dirty: WritableAtom<boolean, boolean>;
  name: string;
};

function zonefileFormAtoms(
  name: string,
  getter: ZfGetter,
  validator: ZfValidator
): ZonefileFieldAtom {
  const editedAtom = atom('');
  const defaultAtom = atom(get => {
    const zf = get(parsedUserZonefileState);
    return getter(zf);
  });
  const isDirtyAtom = atom(false);
  const comboAtom = atom(
    get => {
      const dirty = get(isDirtyAtom);
      const edited = get(editedAtom);
      const defaultVal = get(defaultAtom);
      if (dirty) return edited;
      return edited || defaultVal || '';
    },
    (get, set, newValue: string) => {
      set(isDirtyAtom, true);
      set(editedAtom, newValue);
    }
  );

  const validAtom = atom(get => {
    const value = get(comboAtom);
    const isDirty = get(isDirtyAtom);
    if (!value) return true;
    if (!isDirty) return true;
    return validator(value);
  });
  return {
    name,
    value: comboAtom,
    valid: validAtom,
    dirty: isDirtyAtom,
  };
}

export const zonefileBtcAtom = zonefileFormAtoms(
  'BTC address',
  zf => {
    return zf?.getTxtRecord(ZonefileTxtKeys.BTC_ADDR) ?? null;
  },
  btcAddr => {
    try {
      const decoded = BtcAddress().decode(btcAddr);
      if (decoded.type === 'unknown') return false;
      return true;
    } catch (error) {
      return false;
    }
  }
);

export const zonefileNostrAtom = zonefileFormAtoms(
  'Nostr npub',
  zf => {
    return zf?.getTxtRecord(ZonefileTxtKeys.NOSTR) ?? null;
  },
  npub => {
    try {
      nip19.decode(npub);
      return true;
    } catch (error) {
      return false;
    }
  }
);

export const zonefileRedirectAtom = zonefileFormAtoms(
  'Redirect URL',
  zf => {
    return zf?.getUriRecord(ZonefileUriKeys.REDIRECT) ?? null;
  },
  url => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
);

function getFormFieldState(get: Getter, atom: ZonefileFieldAtom) {
  const valid = get(atom.valid);
  const value = get(atom.value);
  const dirty = get(atom.dirty);

  return {
    valid,
    value,
    dirty,
  };
}

type FieldState = ReturnType<typeof getFormFieldState>;

export const profileFormValidAtom = atom(get => {
  const atoms = ([zonefileBtcAtom, zonefileNostrAtom, zonefileRedirectAtom] as const).map(a =>
    getFormFieldState(get, a)
  ) as unknown as [FieldState, FieldState, FieldState];
  let allValid = true;
  let anyDirty = false;
  const [btc, nostr, redirect] = atoms;
  atoms.forEach(a => {
    if (a.valid !== true) {
      allValid = false;
    }
    if (a.dirty) anyDirty = true;
  });
  return {
    valid: allValid,
    dirty: anyDirty,
    canSubmit: allValid && anyDirty,
    btc,
    nostr,
    redirect,
  };
});

function setTxtKey(txt: TXTType[], key: string, value: string) {
  const recordIndex = txt.findIndex(record => {
    return record.name === key;
  });
  if (recordIndex === -1) {
    txt.push({
      name: key,
      txt: value,
    });
  } else {
    txt[recordIndex]!.txt = value;
  }
}

export const editedZonefileState = atom(get => {
  const formState = get(profileFormValidAtom);
  const { btc, nostr, redirect } = formState;
  const currentZonefile = get(parsedUserZonefileState);
  if (currentZonefile === null)
    throw new Error('Invalid state while getting edited zonefile: not logged in');
  const zonefile = { ...currentZonefile.zoneFile } as ZoneFileObject;
  const txt: TXTType[] = zonefile.txt ?? [];
  if (nostr.dirty) {
    setTxtKey(txt, ZonefileTxtKeys.NOSTR, nostr.value);
  }
  if (btc.dirty) {
    setTxtKey(txt, ZonefileTxtKeys.BTC_ADDR, nostr.value);
  }
  const uri: URIType[] = zonefile.uri ?? [];
  if (redirect.dirty) {
    const index = uri.findIndex(record => record.name === ZonefileUriKeys.REDIRECT);
    if (index === -1) {
      uri.push({
        priority: 10,
        weight: 1,
        name: ZonefileUriKeys.REDIRECT,
        target: redirect.value,
      });
    }
  }
  zonefile.txt = txt;
  zonefile.uri = uri;

  return zonefile;
});
