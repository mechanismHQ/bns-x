import type { Jsonize, FunctionReturnType } from '@clarigen/core';
import { OkType, TypedAbiFunction, TypedAbiArg } from '@clarigen/core';
import type { contracts } from '@bns-x/core';

export type Registry = typeof contracts['bnsxRegistry']['functions'];
export type QueryHelper = typeof contracts['queryHelper']['functions'];

export type NameProperties = NonNullable<FunctionReturnType<Registry['getNameProperties']>>;

export type NamePropertiesJson = Jsonize<NameProperties>;

export type QueryHelperResponse = FunctionReturnType<QueryHelper['getNames']>;

export type QueryHelperLegacyName = Jsonize<NonNullable<QueryHelperResponse['legacy']>>;
export type QueryHelperName = Jsonize<QueryHelperResponse['names'][number]> & {
  legacy: Jsonize<NonNullable<QueryHelperResponse['names'][number]['legacy']>>;
};

export type NameBase = {
  name: string;
  namespace: string;
  id?: string | number;
};

export type NameBuff = {
  name: Uint8Array;
  namespace: Uint8Array;
  id?: string | number;
};

export type ExtraNameProps = {
  combined: string;
  decoded: string;
};

export type NameExtended = NameBase & ExtraNameProps;

export type WithCombined<T extends NameBase | NameBuff> = T extends NameBuff
  ? Omit<T, 'name' | 'namespace'> & NameBase & ExtraNameProps
  : T & ExtraNameProps;

export type LegacyJson = NonNullable<QueryHelperName['legacy']>;

export type LegacyDetails = Omit<LegacyJson, 'leaseStartedAt' | 'leaseEndingAt'> & {
  leaseStartedAt: number;
  leaseEndingAt: number | null;
};
