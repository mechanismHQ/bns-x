import { FunctionReturnType } from '@clarigen/core';
import { contracts } from '@common/clarigen';

export type RegistryContract = typeof contracts.bnsxRegistry;

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
