import type { Atom, Getter, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import { hashAtom, makeBnsRecipientState, txidQueryAtom } from './migration';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { parsedUserZonefileState, userNameState, userZonefileState } from '@store/names';
import { nameDetailsAtom } from '@store/names';
import { coreNodeInfoAtom, namesForAddressState } from '@store/api';
import type { ZoneFileObject } from '@bns-x/client';
import { ZoneFile } from '@bns-x/client';
import { doesNamespaceExpire, parseFqn, ZonefileTxtKeys, ZonefileUriKeys } from '@bns-x/client';
import { Address as BtcAddress } from 'micro-btc-signer';
import { nip19 } from 'nostr-tools';
import type { TXTType, URIType } from '@fungible-systems/zone-file/dist/zoneFile';
import { getTestnetNamespace } from '@common/constants';

export const unwrapTxidAtom = hashAtom('unwrapTxid');
export const unwrapTxAtom = txidQueryAtom(unwrapTxidAtom)[0];

export const isEditingProfileAtom = atom(false);

export const nameUpdateTxidAtom = atom(get => {
  const pending = get(pendingZonefileState);
  if (typeof pending === 'undefined') return undefined;
  return pending.txid;
});

export const nameUpdateTxAtom = atom(get => {
  const pending = get(pendingZonefileState);
  if (typeof pending === 'undefined') return null;
  return get(txidQueryAtom(nameUpdateTxidAtom)[0]);
});

export const nameUpdateTxidConfirmedAtom = hashAtom('finishedTx');

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
      if (namespace === getTestnetNamespace()) return null; // testnet faucet namespace
      if (typeof details.expire_block === 'undefined') return null;
      const nodeInfo = get(coreNodeInfoAtom);
      if (typeof nodeInfo.stacks_tip_height !== 'number') return null;
      const blockDiff = details.expire_block - nodeInfo.stacks_tip_height;
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
    const pendingZf = get(pendingZonefileState);
    const zonefile = pendingZf ? new ZoneFile(pendingZf.zonefile) : get(parsedUserZonefileState);
    // const zf = get(parsedUserZonefileState);
    return getter(zonefile);
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
      // example: bc1qglasydepy4ywn5g6ahy8ylp9mg74pn0hekj6e3
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
      // example: npub132w0sg64x08h2klxvytsamgcu63qqmk8d2yv8ltay8nvzwahk6wsyg2j8n
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
    if (!value) return;
    txt.push({
      name: key,
      txt: value,
    });
  } else {
    if (value) {
      txt[recordIndex]!.txt = value;
    } else {
      txt.splice(recordIndex, 1);
    }
  }
}

export type PendingZonefileInfo = {
  txid: string;
  zonefile: string;
};

export const pendingZonefileState = atomWithStorage<PendingZonefileInfo | undefined>(
  'pending-zonefile',
  undefined
);

export const editedZonefileState = atom(get => {
  const formState = get(profileFormValidAtom);
  const { btc, nostr, redirect } = formState;
  const currentZonefile = get(parsedUserZonefileState);
  const name = get(userNameState);
  if (name === null) {
    throw new Error('Invalid state: no name');
  }
  if (currentZonefile === null)
    throw new Error('Invalid state while getting edited zonefile: not logged in');
  const zonefile = { ...currentZonefile.zoneFile } as ZoneFileObject;
  const txt: TXTType[] = zonefile.txt ?? [];
  zonefile.$origin ??= `${name}.`;
  zonefile.$ttl ??= 3600;
  if (nostr.dirty) {
    setTxtKey(txt, ZonefileTxtKeys.NOSTR, nostr.value);
  }
  if (btc.dirty) {
    setTxtKey(txt, ZonefileTxtKeys.BTC_ADDR, btc.value);
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
    } else {
      if (redirect.value) {
        uri[index]!.target = redirect.value;
      } else {
        uri.splice(index, 1);
      }
    }
  }
  zonefile.txt = txt;
  zonefile.uri = uri;

  return zonefile;
});

export const zonefileUpdateConfirmedState = atom<boolean | null>(get => {
  const pendingZonefile = get(pendingZonefileState);
  if (typeof pendingZonefile === 'undefined') return null;

  const realZonefile = get(userZonefileState[0]);
  return realZonefile === pendingZonefile.zonefile;
});

// UNWRAPPING

export const unwrapRecipientState = makeBnsRecipientState();

export const unwrapRecipientHasBnsState = atom(get => {
  const recipient = get(unwrapRecipientState.validRecipientState);

  if (recipient === null) return false;

  const names = get(namesForAddressState(recipient));

  return names.coreName !== null;
});
