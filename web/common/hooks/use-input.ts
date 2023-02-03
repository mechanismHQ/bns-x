import type { SyncState } from 'jotai-form/dist/src/atomWithValidate';
import React from 'react';

type FormAtom<T> = (SyncState<T> & { value: T }) | T;
type Input<T = string> = [FormAtom<T>, (input: T) => void];

export function useInput<T>(input: Input<T>) {
  const [value, setter] = input;
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.currentTarget.value as unknown as T);
    },
    [setter]
  );
  const set = React.useCallback(
    (val: T) => {
      setter(val);
    },
    [setter]
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const v = (Boolean((value as any).value) ? (value as any).value : value) as T;
  // const v = 'value' in value ? (value as any).value : value;
  return {
    // value,
    value: v,
    onChange,
    atom: value,
    setter: set,
    props: {
      value: v,
      onChange,
    },
  };
}
