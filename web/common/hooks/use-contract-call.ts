import type { ContractCallFunction, TypedAbiArg } from '@clarigen/core';
import {
  AllContracts,
  DeploymentNetwork,
  DeploymentsForContracts,
  Project,
  ProjectFactory,
} from '@clarigen/core';
import { useOpenContractCall } from '@micro-stacks/react';
// import { ContractCall } from 'micro-stacks/transactions';
import type { ContractCallParams } from '@micro-stacks/client';

type UnknownArg = TypedAbiArg<unknown, string>;
type UnknownArgs = UnknownArg[];

type ArgsTuple<T extends UnknownArgs> = {
  [K in keyof T]: T[K] extends TypedAbiArg<infer A, string> ? A : never;
};

type ArgsRecordUnion<T extends TypedAbiArg<unknown, string>> = T extends TypedAbiArg<
  infer A,
  infer N
>
  ? {
      [K in T as N]: A;
    }
  : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
export type Compact<T> = { [K in keyof T]: T[K] };

type ArgsRecord<T extends UnknownArgs> = Compact<UnionToIntersection<ArgsRecordUnion<T[number]>>>;

type ArgsType<T extends UnknownArgs> = ArgsRecord<T>;

type SubmitParams<A> = Omit<
  ContractCallParams,
  'contractAddress' | 'contractName' | 'functionName' | 'functionArgs'
> & {
  functionArgs: A;
};

interface ContractCallReturn<A> {
  openContractCall: (opts: SubmitParams<A>) => Promise<void>;
  isRequestPending: boolean;
}

export function useContractCall<Args extends UnknownArgs, R>(
  func: ContractCallFunction<Args, R>
): ContractCallReturn<ArgsType<Args>> {
  const { isRequestPending, openContractCall } = useOpenContractCall();

  async function submit(opts: SubmitParams<ArgsType<Args>>) {
    const { functionArgs, ...rest } = opts;
    const contractCall = func(functionArgs);

    await openContractCall({
      functionArgs: contractCall.functionArgs,
      contractAddress: contractCall.contractAddress,
      contractName: contractCall.contractName,
      functionName: contractCall.function.name,
      ...rest,
    });
  }

  return {
    openContractCall: submit,
    isRequestPending,
  };
}

// export type HookFactory<P extends Project<any, any>, N extends DeploymentNetwork> = {
//   [ContractName in keyof P['contracts']]: P['deployments'][ContractName][N] extends string
//     ? FullContractWithIdentifier<P['contracts'][ContractName], P['deployments'][ContractName][N]>
//     : undefined;
// };
// export type HookFactory<F extends ProjectFactory<any, any>> = {
//   [ContractName in keyof F]:
// }

// export function projectFactory<
//   F extends ProjectFactory<P, N>,
//   P extends Project<C, D>,
//   N extends DeploymentNetwork,
//   C extends AllContracts,
//   D extends DeploymentsForContracts<C>
// >(factory: F) {
//   Object.entries(factory).for
// }
