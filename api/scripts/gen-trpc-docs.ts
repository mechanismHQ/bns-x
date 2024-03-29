/* eslint-disable @typescript-eslint/ban-types */
import type { AppRouter } from '~/routes/trpc';
import { appRouter } from '~/routes/trpc';
import type { AnyRouter } from '@trpc/server';
import type * as TrpcServer from '@trpc/server';
import type { AnyProcedure } from '@trpc/server';
import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import type { AnyZodObject, ZodAny } from 'zod';
import { z } from 'zod';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import set from 'lodash-es/set';
import setWith from 'lodash-es/setWith';
import type { Node, TypeElement, TypeNode } from 'typescript';
import { factory, SyntaxKind } from 'typescript';

export type Procedures = Record<
  string,
  Omit<AnyProcedure, '_def'> & {
    _def: {
      query: boolean;
      mutation: boolean;
      inputs?: ZodAny[];
      output?: ZodAny;
    };
  }
>;

type ProcedureTypes = Record<'queries' | 'mutations', Record<string, string>>;

interface ProcedureDef {
  _isProcedure: true;
  // type: 'procedure';
  type: 'query' | 'mutation';
  input: string;
  inputNode?: TypeNode;
  output: string;
  outputNode?: TypeNode;
}

interface ProcedureRouter {
  [key: string]: ProcedureDef;
}

interface ProcedureDefs {
  type: 'router';
  [name: string]: ProcedureDef | ProcedureDefs | string;
}

// type ProcedureDefs = Record<

// type ProcedureDefs = Record<string, ProcedureDef | ProcedureDefs>;

function getProcedures(router: AnyRouter) {
  const procedures = router._def.procedures as Procedures;
  const procedureTypes: ProcedureTypes = { queries: {}, mutations: {} };

  const defs: ProcedureDefs = {
    type: 'router',
  };

  // console.log(Object.keys(procedures));

  Object.entries(procedures)
    .filter(([, { _def }]) => _def.query || _def.mutation)
    .forEach(([procedureName, procedure]) => {
      // console.log(procedureName);
      // console.log(procedure);
      const def: ProcedureDef = {
        _isProcedure: true,
        type: procedure._def.query ? 'query' : 'mutation',
        input: 'unknown',
        output: 'unknown',
      };

      if (procedure._def.inputs) {
        const inputParser = getInputFromInputParsers(procedure._def.inputs);
        if (inputParser) {
          const { node } = zodToTs(inputParser);
          // procedureType = `input: ${printNode(node)}`;
          def.input = printNode(node);
          def.inputNode = node;
          // def.input = printNode(createTypeAlias(node, 'input', inputParser.description));
          // docsType = printNode(createTypeAlias(node, 'input', inputParser.description));
        }
      }

      if (procedure._def.output) {
        const { node } = zodToTs(procedure._def.output);
        const outputType = printNode(node);
        // const outputType = printNode(
        //   createTypeAlias(node, 'output', procedure._def.output.description)
        // );
        def.output = outputType;
        def.outputNode = node;
      }
      setWith(defs, procedureName.split('.'), def, (val, path, obj) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          ...val,
          type: 'router',
        };
      });
      // set(defs, procedureName, def);

      // console.log(procedureName, def);
    });

  // console.log(defs);
  return defs;
}

function makeTypes(defs: ProcedureDefs) {
  const properties = Object.entries(defs);
  const members: TypeElement[] = [];

  properties.forEach(([key, value]) => {
    if (typeof value === 'string') return;
    if (value.type === 'router') {
      const subRouter = makeTypes(value);
      const propertySignature = factory.createPropertySignature(
        undefined,
        key,
        undefined,
        subRouter
      );
      members.push(propertySignature);
      return;
    }

    // const type = factory.createStringLiteral(value.type);
    const type = factory.createTypeReferenceNode(`"${value.type}"`);
    // factory.createTypeLiteralNode([factory.createStringLiteral(value.type)]);
    const procRef = factory.createTypeReferenceNode('AnyProc', [
      type,
      value.inputNode ?? factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
      value.outputNode ?? factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword),
    ]);

    const propertySignature = factory.createPropertySignature(undefined, key, undefined, procRef);
    members.push(propertySignature);

    // console.log(printNode(procRef));
  });

  const literal = factory.createTypeLiteralNode(members);
  return literal;
  // const obj = printNode(literal);
  // console.log('obj', obj);

  // const typeNode = factory.createExpressionWithTypeArguments;
}

const defs = getProcedures(appRouter);
// console.log(defs.inscriptions);
// console.log(defs);
const type = makeTypes(defs);

const procTypeString = printNode(type);

const routerTypeString = `
export type AppRouter = TrpcServer.Router<{
  _config: TrpcServer.AnyRootConfig;
  router: true;
  queries: {};
  mutations: {};
  subscriptions: {};
  procedures: ${procTypeString};
  record: ${procTypeString};
}>;
`;

console.log(`export type AppProcedures = ${procTypeString};`);

type AnyProc<Type extends 'query' | 'mutation', Input, Output> = TrpcServer.BuildProcedure<
  Type,
  {
    _config: TrpcServer.AnyRootConfig;
    _meta: {};
    _ctx_out: {};
    _input_in: Input;
    _input_out: Input;
    _output_in: Output;
    _output_out: Output;
  },
  unknown
>;

type Procs = {
  fake1: AnyProc<'query', { q: string }, { o: number }>;
};

type FakeRouter = TrpcServer.Router<{
  _config: TrpcServer.AnyRootConfig;
  router: true;
  queries: {};
  mutations: {};
  subscriptions: {};
  // procedures: {};
  procedures: {
    fake1: AnyProc<'query', { q: string }, { o: number }>;
  };
  record: {
    fake1: AnyProc<'query', { q: string }, { o: number }>;
  };
}>;

export function getInputFromInputParsers(inputs: ZodAny[]) {
  if (inputs.length === 0) return null;
  if (inputs.length === 1) return inputs[0];

  const mergedObj = inputs.reduce((mergedObj, inputParser) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mergedObj.merge(inputParser as unknown as AnyZodObject);
  }, z.object({}));

  return mergedObj;
}

async function runTypes() {
  const trpc = createTRPCProxyClient<FakeRouter>({
    links: [
      httpBatchLink({
        url: `http://localhost:3000/trpc`,
      }),
    ],
  });

  const a = await trpc.fake1.query({ q: 'hello' });
  a;

  const trpc2 = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `http://localhost:3000/trpc`,
      }),
    ],
  });

  const names = await trpc2.getAddressNames.query({ address: '' });
}
