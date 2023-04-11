import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import type { AnyRouter } from '@trpc/server';
import type * as TrpcServer from '@trpc/server';
import type { AnyProcedure } from '@trpc/server';
import type { Node, TypeElement, TypeNode } from 'typescript';
import { factory, SyntaxKind } from 'typescript';
import type { ZodAny, AnyZodObject } from 'zod';
import { z } from 'zod';
import setWith from 'lodash-es/setWith';
import { appRouter } from '@routes/trpc';

interface ProcedureDefs {
  type: 'router';
  [name: string]: ProcedureDef | ProcedureDefs | string;
}

interface ProcedureDef {
  _isProcedure: true;
  // type: 'procedure';
  type: 'query' | 'mutation';
  input: string;
  inputNode?: TypeNode;
  output: string;
  outputNode?: TypeNode;
}

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

export function buildTypeNode(router: AnyRouter) {
  const procedures = getProcedures(router);
  const typeNode = makeTypes(procedures);
  return typeNode;
}

function getProcedures(router: AnyRouter) {
  const procedures = router._def.procedures as Procedures;
  // const procedureTypes: ProcedureTypes = { queries: {}, mutations: {} };

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
          def.input = printNode(node);
          def.inputNode = node;
        }
      }

      if (procedure._def.output) {
        const { node } = zodToTs(procedure._def.output);
        const outputType = printNode(node);
        def.output = outputType;
        def.outputNode = node;
      }
      setWith(defs, procedureName.split('.'), def, val => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          ...val,
          type: 'router',
        };
      });
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
      const routerRef = factory.createTypeReferenceNode('TrpcServer.CreateRouterInner', [
        factory.createTypeReferenceNode('TrpcServer.AnyRootConfig'),
        subRouter,
      ]);
      const propertySignature = factory.createPropertySignature(
        undefined,
        key,
        undefined,
        routerRef
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

function getInputFromInputParsers(inputs: ZodAny[]) {
  if (inputs.length === 0) return null;
  if (inputs.length === 1) return inputs[0];

  const mergedObj = inputs.reduce((mergedObj, inputParser) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return mergedObj.merge(inputParser as unknown as AnyZodObject);
  }, z.object({}));

  return mergedObj;
}
