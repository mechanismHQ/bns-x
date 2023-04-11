import type { TypeLiteralNode } from 'typescript';
import { printNode } from 'zod-to-ts';

export function makeProcedureType(node: TypeLiteralNode) {
  const type = printNode(node);
  return `export type AppProcedures = ${type};`;
}

export function buildFile(node: TypeLiteralNode) {
  const procedureType = makeProcedureType(node);

  return `// This file is auto-generated. Do not change.
import type * as TrpcServer from '@trpc/server';

${procedureType}

type AnyProc<Type extends 'query' | 'mutation', Input, Output> = TrpcServer.BuildProcedure<
  Type,
  {
    _config: TrpcServer.AnyRootConfig;
    _meta: Record<string, any>;
    _ctx_out: Record<string, any>;
    _input_in: Input;
    _input_out: Input;
    _output_in: Output;
    _output_out: Output;
  },
  unknown
>;

export type AppRouter = TrpcServer.Router<{
  _config: TrpcServer.AnyRootConfig;
  router: true;
  queries: Record<string, any>;
  mutations: Record<string, any>;
  subscriptions: Record<string, any>;
  // procedures: Record<string, any>;
  procedures: AppProcedures;
  record: AppProcedures;
}>;
`;
}
