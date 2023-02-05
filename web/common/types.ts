import type { FunctionReturnType } from '@clarigen/core';
import type { BnsxContracts } from '@bns-x/client';

export type RegistryContract = BnsxContracts['bnsxRegistry'];

export type NameProperties = NonNullable<
  FunctionReturnType<RegistryContract['functions']['getNameProperties']>
>;

export type Name = {
  name: string;
  namespace: string;
};

export type NameBuff = {
  name: Uint8Array;
  namespace: Uint8Array;
};

export type NameExt = Name & { combined: string };

export type WithCombined<T extends Name | NameBuff> = T extends NameBuff
  ? Omit<T, 'name' | 'namespace'> & Name & { combined: string }
  : T & { combined: string };
