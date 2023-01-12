export type ClarityAbiTypeBuffer = { buffer: { length: number } };
export type ClarityAbiTypeStringAscii = { "string-ascii": { length: number } };
export type ClarityAbiTypeStringUtf8 = { "string-utf8": { length: number } };
export type ClarityAbiTypeResponse = {
  response: { ok: ClarityAbiType; error: ClarityAbiType };
};
export type ClarityAbiTypeOptional = { optional: ClarityAbiType };
export type ClarityAbiTypeTuple = {
  tuple: { name: string; type: ClarityAbiType }[];
};
export type ClarityAbiTypeList = {
  list: { type: ClarityAbiType; length: number };
};

export type ClarityAbiTypeUInt128 = "uint128";
export type ClarityAbiTypeInt128 = "int128";
export type ClarityAbiTypeBool = "bool";
export type ClarityAbiTypePrincipal = "principal";
export type ClarityAbiTypeTraitReference = "trait_reference";
export type ClarityAbiTypeNone = "none";

export type ClarityAbiTypePrimitive =
  | ClarityAbiTypeUInt128
  | ClarityAbiTypeInt128
  | ClarityAbiTypeBool
  | ClarityAbiTypePrincipal
  | ClarityAbiTypeTraitReference
  | ClarityAbiTypeNone;

export type ClarityAbiType =
  | ClarityAbiTypePrimitive
  | ClarityAbiTypeBuffer
  | ClarityAbiTypeResponse
  | ClarityAbiTypeOptional
  | ClarityAbiTypeTuple
  | ClarityAbiTypeList
  | ClarityAbiTypeStringAscii
  | ClarityAbiTypeStringUtf8
  | ClarityAbiTypeTraitReference;

export interface ClarityAbiArg {
  name: string;
  type: ClarityAbiType;
}

export interface ClarityAbiFunction {
  name: string;
  access: "private" | "public" | "read_only";
  args: ClarityAbiArg[];
  outputs: {
    type: ClarityAbiType;
  };
}

export type TypedAbiArg<T, N extends string> = { _t?: T; name: N };

export type TypedAbiFunction<
  T extends TypedAbiArg<unknown, string>[],
  R
> = ClarityAbiFunction & {
  _t?: T;
  _r?: R;
};

export interface ClarityAbiVariable {
  name: string;
  access: "variable" | "constant";
  type: ClarityAbiType;
}

export type TypedAbiVariable<T> = ClarityAbiVariable & {
  defaultValue: T;
};

export interface ClarityAbiMap {
  name: string;
  key: ClarityAbiType;
  value: ClarityAbiType;
}

export type TypedAbiMap<K, V> = ClarityAbiMap & {
  _k?: K;
  _v?: V;
};

export interface ClarityAbiTypeFungibleToken {
  name: string;
}

export interface ClarityAbiTypeNonFungibleToken {
  name: string;
  type: ClarityAbiType;
}

export interface ClarityAbi {
  functions: ClarityAbiFunction[];
  variables: ClarityAbiVariable[];
  maps: ClarityAbiMap[];
  fungible_tokens: ClarityAbiTypeFungibleToken[];
  non_fungible_tokens: ClarityAbiTypeNonFungibleToken[];
}

export type TypedAbi = Readonly<{
  functions: {
    [key: string]: TypedAbiFunction<TypedAbiArg<unknown, string>[], unknown>;
  };
  variables: {
    [key: string]: TypedAbiVariable<unknown>;
  };
  maps: {
    [key: string]: TypedAbiMap<unknown, unknown>;
  };
  constants: {
    [key: string]: unknown;
  };
  fungible_tokens: Readonly<ClarityAbiTypeFungibleToken[]>;
  non_fungible_tokens: Readonly<ClarityAbiTypeNonFungibleToken[]>;
  contractName: string;
  contractFile?: string;
}>;

export interface ResponseOk<T, E> {
  value: T;
  isOk: true;
  _e?: E;
}

export interface ResponseErr<T, E> {
  value: E;
  isOk: false;
  _o?: T;
}

export type Response<Ok, Err> = ResponseOk<Ok, Err> | ResponseErr<Ok, Err>;

export type OkType<R> = R extends ResponseOk<infer V, unknown> ? V : never;
export type ErrType<R> = R extends ResponseErr<unknown, infer V> ? V : never;

export const contracts = {
  bnsV1: {
    functions: {
      getExpAtIndex: {
        name: "get-exp-at-index",
        access: "private",
        args: [
          {
            name: "buckets",
            type: { list: { type: "uint128", length: 16 } },
          },
          { name: "index", type: "uint128" },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<
        [
          buckets: TypedAbiArg<number | bigint[], "buckets">,
          index: TypedAbiArg<number | bigint, "index">
        ],
        bigint
      >,
      isDigit: {
        name: "is-digit",
        access: "private",
        args: [{ name: "char", type: { buffer: { length: 1 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[char: TypedAbiArg<Uint8Array, "char">], boolean>,
      isLowercaseAlpha: {
        name: "is-lowercase-alpha",
        access: "private",
        args: [{ name: "char", type: { buffer: { length: 1 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[char: TypedAbiArg<Uint8Array, "char">], boolean>,
      isNamespaceAvailable: {
        name: "is-namespace-available",
        access: "private",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        boolean
      >,
      isNonalpha: {
        name: "is-nonalpha",
        access: "private",
        args: [{ name: "char", type: { buffer: { length: 1 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[char: TypedAbiArg<Uint8Array, "char">], boolean>,
      isSpecialChar: {
        name: "is-special-char",
        access: "private",
        args: [{ name: "char", type: { buffer: { length: 1 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[char: TypedAbiArg<Uint8Array, "char">], boolean>,
      isVowel: {
        name: "is-vowel",
        access: "private",
        args: [{ name: "char", type: { buffer: { length: 1 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[char: TypedAbiArg<Uint8Array, "char">], boolean>,
      max: {
        name: "max",
        access: "private",
        args: [
          { name: "a", type: "uint128" },
          {
            name: "b",
            type: "uint128",
          },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<
        [
          a: TypedAbiArg<number | bigint, "a">,
          b: TypedAbiArg<number | bigint, "b">
        ],
        bigint
      >,
      min: {
        name: "min",
        access: "private",
        args: [
          { name: "a", type: "uint128" },
          {
            name: "b",
            type: "uint128",
          },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<
        [
          a: TypedAbiArg<number | bigint, "a">,
          b: TypedAbiArg<number | bigint, "b">
        ],
        bigint
      >,
      mintOrTransferName: {
        name: "mint-or-transfer-name?",
        access: "private",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "beneficiary", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          beneficiary: TypedAbiArg<string, "beneficiary">
        ],
        Response<boolean, bigint>
      >,
      nameLeaseStartedAt: {
        name: "name-lease-started-at?",
        access: "private",
        args: [
          {
            name: "namespace-launched-at",
            type: { optional: "uint128" },
          },
          { name: "namespace-revealed-at", type: "uint128" },
          {
            name: "name-props",
            type: {
              tuple: [
                { name: "imported-at", type: { optional: "uint128" } },
                { name: "registered-at", type: { optional: "uint128" } },
                { name: "revoked-at", type: { optional: "uint128" } },
                {
                  name: "zonefile-hash",
                  type: { buffer: { length: 20 } },
                },
              ],
            },
          },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespaceLaunchedAt: TypedAbiArg<
            number | bigint | null,
            "namespaceLaunchedAt"
          >,
          namespaceRevealedAt: TypedAbiArg<
            number | bigint,
            "namespaceRevealedAt"
          >,
          nameProps: TypedAbiArg<
            {
              importedAt: number | bigint | null;
              registeredAt: number | bigint | null;
              revokedAt: number | bigint | null;
              zonefileHash: Uint8Array;
            },
            "nameProps"
          >
        ],
        Response<bigint, bigint>
      >,
      updateNameOwnership: {
        name: "update-name-ownership?",
        access: "private",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "from", type: "principal" },
          { name: "to", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          from: TypedAbiArg<string, "from">,
          to: TypedAbiArg<string, "to">
        ],
        Response<boolean, bigint>
      >,
      updateZonefileAndProps: {
        name: "update-zonefile-and-props",
        access: "private",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "registered-at", type: { optional: "uint128" } },
          { name: "imported-at", type: { optional: "uint128" } },
          { name: "revoked-at", type: { optional: "uint128" } },
          { name: "zonefile-hash", type: { buffer: { length: 20 } } },
          { name: "op", type: { "string-ascii": { length: 16 } } },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          registeredAt: TypedAbiArg<number | bigint | null, "registeredAt">,
          importedAt: TypedAbiArg<number | bigint | null, "importedAt">,
          revokedAt: TypedAbiArg<number | bigint | null, "revokedAt">,
          zonefileHash: TypedAbiArg<Uint8Array, "zonefileHash">,
          op: TypedAbiArg<string, "op">
        ],
        boolean
      >,
      nameImport: {
        name: "name-import",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "beneficiary", type: "principal" },
          { name: "zonefile-hash", type: { buffer: { length: 20 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          beneficiary: TypedAbiArg<string, "beneficiary">,
          zonefileHash: TypedAbiArg<Uint8Array, "zonefileHash">
        ],
        Response<boolean, bigint>
      >,
      namePreorder: {
        name: "name-preorder",
        access: "public",
        args: [
          {
            name: "hashed-salted-fqn",
            type: { buffer: { length: 20 } },
          },
          { name: "stx-to-burn", type: "uint128" },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          hashedSaltedFqn: TypedAbiArg<Uint8Array, "hashedSaltedFqn">,
          stxToBurn: TypedAbiArg<number | bigint, "stxToBurn">
        ],
        Response<bigint, bigint>
      >,
      nameRegister: {
        name: "name-register",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "salt", type: { buffer: { length: 20 } } },
          { name: "zonefile-hash", type: { buffer: { length: 20 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          salt: TypedAbiArg<Uint8Array, "salt">,
          zonefileHash: TypedAbiArg<Uint8Array, "zonefileHash">
        ],
        Response<boolean, bigint>
      >,
      nameRenewal: {
        name: "name-renewal",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "stx-to-burn", type: "uint128" },
          { name: "new-owner", type: { optional: "principal" } },
          {
            name: "zonefile-hash",
            type: { optional: { buffer: { length: 20 } } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          stxToBurn: TypedAbiArg<number | bigint, "stxToBurn">,
          newOwner: TypedAbiArg<string | null, "newOwner">,
          zonefileHash: TypedAbiArg<Uint8Array | null, "zonefileHash">
        ],
        Response<boolean, bigint>
      >,
      nameRevoke: {
        name: "name-revoke",
        access: "public",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<boolean, bigint>
      >,
      nameTransfer: {
        name: "name-transfer",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "new-owner", type: "principal" },
          {
            name: "zonefile-hash",
            type: { optional: { buffer: { length: 20 } } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          newOwner: TypedAbiArg<string, "newOwner">,
          zonefileHash: TypedAbiArg<Uint8Array | null, "zonefileHash">
        ],
        Response<boolean, bigint>
      >,
      nameUpdate: {
        name: "name-update",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "zonefile-hash", type: { buffer: { length: 20 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          zonefileHash: TypedAbiArg<Uint8Array, "zonefileHash">
        ],
        Response<boolean, bigint>
      >,
      namespacePreorder: {
        name: "namespace-preorder",
        access: "public",
        args: [
          {
            name: "hashed-salted-namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "stx-to-burn", type: "uint128" },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          hashedSaltedNamespace: TypedAbiArg<
            Uint8Array,
            "hashedSaltedNamespace"
          >,
          stxToBurn: TypedAbiArg<number | bigint, "stxToBurn">
        ],
        Response<bigint, bigint>
      >,
      namespaceReady: {
        name: "namespace-ready",
        access: "public",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, bigint>
      >,
      namespaceReveal: {
        name: "namespace-reveal",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "namespace-salt", type: { buffer: { length: 20 } } },
          { name: "p-func-base", type: "uint128" },
          { name: "p-func-coeff", type: "uint128" },
          { name: "p-func-b1", type: "uint128" },
          { name: "p-func-b2", type: "uint128" },
          { name: "p-func-b3", type: "uint128" },
          { name: "p-func-b4", type: "uint128" },
          { name: "p-func-b5", type: "uint128" },
          { name: "p-func-b6", type: "uint128" },
          { name: "p-func-b7", type: "uint128" },
          { name: "p-func-b8", type: "uint128" },
          { name: "p-func-b9", type: "uint128" },
          { name: "p-func-b10", type: "uint128" },
          { name: "p-func-b11", type: "uint128" },
          { name: "p-func-b12", type: "uint128" },
          { name: "p-func-b13", type: "uint128" },
          { name: "p-func-b14", type: "uint128" },
          { name: "p-func-b15", type: "uint128" },
          { name: "p-func-b16", type: "uint128" },
          { name: "p-func-non-alpha-discount", type: "uint128" },
          { name: "p-func-no-vowel-discount", type: "uint128" },
          { name: "lifetime", type: "uint128" },
          { name: "namespace-import", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          namespaceSalt: TypedAbiArg<Uint8Array, "namespaceSalt">,
          pFuncBase: TypedAbiArg<number | bigint, "pFuncBase">,
          pFuncCoeff: TypedAbiArg<number | bigint, "pFuncCoeff">,
          pFuncB1: TypedAbiArg<number | bigint, "pFuncB1">,
          pFuncB2: TypedAbiArg<number | bigint, "pFuncB2">,
          pFuncB3: TypedAbiArg<number | bigint, "pFuncB3">,
          pFuncB4: TypedAbiArg<number | bigint, "pFuncB4">,
          pFuncB5: TypedAbiArg<number | bigint, "pFuncB5">,
          pFuncB6: TypedAbiArg<number | bigint, "pFuncB6">,
          pFuncB7: TypedAbiArg<number | bigint, "pFuncB7">,
          pFuncB8: TypedAbiArg<number | bigint, "pFuncB8">,
          pFuncB9: TypedAbiArg<number | bigint, "pFuncB9">,
          pFuncB10: TypedAbiArg<number | bigint, "pFuncB10">,
          pFuncB11: TypedAbiArg<number | bigint, "pFuncB11">,
          pFuncB12: TypedAbiArg<number | bigint, "pFuncB12">,
          pFuncB13: TypedAbiArg<number | bigint, "pFuncB13">,
          pFuncB14: TypedAbiArg<number | bigint, "pFuncB14">,
          pFuncB15: TypedAbiArg<number | bigint, "pFuncB15">,
          pFuncB16: TypedAbiArg<number | bigint, "pFuncB16">,
          pFuncNonAlphaDiscount: TypedAbiArg<
            number | bigint,
            "pFuncNonAlphaDiscount"
          >,
          pFuncNoVowelDiscount: TypedAbiArg<
            number | bigint,
            "pFuncNoVowelDiscount"
          >,
          lifetime: TypedAbiArg<number | bigint, "lifetime">,
          namespaceImport: TypedAbiArg<string, "namespaceImport">
        ],
        Response<boolean, bigint>
      >,
      namespaceRevokeFunctionPriceEdition: {
        name: "namespace-revoke-function-price-edition",
        access: "public",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, bigint>
      >,
      namespaceUpdateFunctionPrice: {
        name: "namespace-update-function-price",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "p-func-base", type: "uint128" },
          { name: "p-func-coeff", type: "uint128" },
          { name: "p-func-b1", type: "uint128" },
          { name: "p-func-b2", type: "uint128" },
          { name: "p-func-b3", type: "uint128" },
          { name: "p-func-b4", type: "uint128" },
          { name: "p-func-b5", type: "uint128" },
          { name: "p-func-b6", type: "uint128" },
          { name: "p-func-b7", type: "uint128" },
          { name: "p-func-b8", type: "uint128" },
          { name: "p-func-b9", type: "uint128" },
          { name: "p-func-b10", type: "uint128" },
          { name: "p-func-b11", type: "uint128" },
          { name: "p-func-b12", type: "uint128" },
          { name: "p-func-b13", type: "uint128" },
          { name: "p-func-b14", type: "uint128" },
          { name: "p-func-b15", type: "uint128" },
          { name: "p-func-b16", type: "uint128" },
          { name: "p-func-non-alpha-discount", type: "uint128" },
          { name: "p-func-no-vowel-discount", type: "uint128" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          pFuncBase: TypedAbiArg<number | bigint, "pFuncBase">,
          pFuncCoeff: TypedAbiArg<number | bigint, "pFuncCoeff">,
          pFuncB1: TypedAbiArg<number | bigint, "pFuncB1">,
          pFuncB2: TypedAbiArg<number | bigint, "pFuncB2">,
          pFuncB3: TypedAbiArg<number | bigint, "pFuncB3">,
          pFuncB4: TypedAbiArg<number | bigint, "pFuncB4">,
          pFuncB5: TypedAbiArg<number | bigint, "pFuncB5">,
          pFuncB6: TypedAbiArg<number | bigint, "pFuncB6">,
          pFuncB7: TypedAbiArg<number | bigint, "pFuncB7">,
          pFuncB8: TypedAbiArg<number | bigint, "pFuncB8">,
          pFuncB9: TypedAbiArg<number | bigint, "pFuncB9">,
          pFuncB10: TypedAbiArg<number | bigint, "pFuncB10">,
          pFuncB11: TypedAbiArg<number | bigint, "pFuncB11">,
          pFuncB12: TypedAbiArg<number | bigint, "pFuncB12">,
          pFuncB13: TypedAbiArg<number | bigint, "pFuncB13">,
          pFuncB14: TypedAbiArg<number | bigint, "pFuncB14">,
          pFuncB15: TypedAbiArg<number | bigint, "pFuncB15">,
          pFuncB16: TypedAbiArg<number | bigint, "pFuncB16">,
          pFuncNonAlphaDiscount: TypedAbiArg<
            number | bigint,
            "pFuncNonAlphaDiscount"
          >,
          pFuncNoVowelDiscount: TypedAbiArg<
            number | bigint,
            "pFuncNoVowelDiscount"
          >
        ],
        Response<boolean, bigint>
      >,
      canNameBeRegistered: {
        name: "can-name-be-registered",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<boolean, bigint>
      >,
      canNamespaceBeRegistered: {
        name: "can-namespace-be-registered",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "none" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, null>
      >,
      canReceiveName: {
        name: "can-receive-name",
        access: "read_only",
        args: [{ name: "owner", type: "principal" }],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [owner: TypedAbiArg<string, "owner">],
        Response<boolean, bigint>
      >,
      checkNameOpsPreconditions: {
        name: "check-name-ops-preconditions",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "name-props",
                    type: {
                      tuple: [
                        {
                          name: "imported-at",
                          type: { optional: "uint128" },
                        },
                        {
                          name: "registered-at",
                          type: { optional: "uint128" },
                        },
                        {
                          name: "revoked-at",
                          type: { optional: "uint128" },
                        },
                        {
                          name: "zonefile-hash",
                          type: { buffer: { length: 20 } },
                        },
                      ],
                    },
                  },
                  {
                    name: "namespace-props",
                    type: {
                      tuple: [
                        { name: "can-update-price-function", type: "bool" },
                        {
                          name: "launched-at",
                          type: { optional: "uint128" },
                        },
                        { name: "lifetime", type: "uint128" },
                        { name: "namespace-import", type: "principal" },
                        {
                          name: "price-function",
                          type: {
                            tuple: [
                              { name: "base", type: "uint128" },
                              {
                                name: "buckets",
                                type: {
                                  list: { type: "uint128", length: 16 },
                                },
                              },
                              { name: "coeff", type: "uint128" },
                              { name: "no-vowel-discount", type: "uint128" },
                              { name: "nonalpha-discount", type: "uint128" },
                            ],
                          },
                        },
                        { name: "revealed-at", type: "uint128" },
                      ],
                    },
                  },
                  { name: "owner", type: "principal" },
                ],
              },
              error: "int128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<
          {
            nameProps: {
              importedAt: bigint | null;
              registeredAt: bigint | null;
              revokedAt: bigint | null;
              zonefileHash: Uint8Array;
            };
            namespaceProps: {
              canUpdatePriceFunction: boolean;
              launchedAt: bigint | null;
              lifetime: bigint;
              namespaceImport: string;
              priceFunction: {
                base: bigint;
                buckets: bigint[];
                coeff: bigint;
                noVowelDiscount: bigint;
                nonalphaDiscount: bigint;
              };
              revealedAt: bigint;
            };
            owner: string;
          },
          bigint
        >
      >,
      computeNamePrice: {
        name: "compute-name-price",
        access: "read_only",
        args: [
          { name: "name", type: { buffer: { length: 48 } } },
          {
            name: "price-function",
            type: {
              tuple: [
                { name: "base", type: "uint128" },
                {
                  name: "buckets",
                  type: { list: { type: "uint128", length: 16 } },
                },
                { name: "coeff", type: "uint128" },
                { name: "no-vowel-discount", type: "uint128" },
                { name: "nonalpha-discount", type: "uint128" },
              ],
            },
          },
        ],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<Uint8Array, "name">,
          priceFunction: TypedAbiArg<
            {
              base: number | bigint;
              buckets: number | bigint[];
              coeff: number | bigint;
              noVowelDiscount: number | bigint;
              nonalphaDiscount: number | bigint;
            },
            "priceFunction"
          >
        ],
        bigint
      >,
      getNamePrice: {
        name: "get-name-price",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<bigint, bigint>
      >,
      getNamespacePrice: {
        name: "get-namespace-price",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "int128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<bigint, bigint>
      >,
      getNamespaceProperties: {
        name: "get-namespace-properties",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                  {
                    name: "properties",
                    type: {
                      tuple: [
                        { name: "can-update-price-function", type: "bool" },
                        {
                          name: "launched-at",
                          type: { optional: "uint128" },
                        },
                        { name: "lifetime", type: "uint128" },
                        { name: "namespace-import", type: "principal" },
                        {
                          name: "price-function",
                          type: {
                            tuple: [
                              { name: "base", type: "uint128" },
                              {
                                name: "buckets",
                                type: {
                                  list: { type: "uint128", length: 16 },
                                },
                              },
                              { name: "coeff", type: "uint128" },
                              { name: "no-vowel-discount", type: "uint128" },
                              { name: "nonalpha-discount", type: "uint128" },
                            ],
                          },
                        },
                        { name: "revealed-at", type: "uint128" },
                      ],
                    },
                  },
                ],
              },
              error: "int128",
            },
          },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<
          {
            namespace: Uint8Array;
            properties: {
              canUpdatePriceFunction: boolean;
              launchedAt: bigint | null;
              lifetime: bigint;
              namespaceImport: string;
              priceFunction: {
                base: bigint;
                buckets: bigint[];
                coeff: bigint;
                noVowelDiscount: bigint;
                nonalphaDiscount: bigint;
              };
              revealedAt: bigint;
            };
          },
          bigint
        >
      >,
      hasInvalidChars: {
        name: "has-invalid-chars",
        access: "read_only",
        args: [{ name: "name", type: { buffer: { length: 48 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[name: TypedAbiArg<Uint8Array, "name">], boolean>,
      hasNonalphaChars: {
        name: "has-nonalpha-chars",
        access: "read_only",
        args: [{ name: "name", type: { buffer: { length: 48 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[name: TypedAbiArg<Uint8Array, "name">], boolean>,
      hasVowelsChars: {
        name: "has-vowels-chars",
        access: "read_only",
        args: [{ name: "name", type: { buffer: { length: 48 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[name: TypedAbiArg<Uint8Array, "name">], boolean>,
      isCharValid: {
        name: "is-char-valid",
        access: "read_only",
        args: [{ name: "char", type: { buffer: { length: 1 } } }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[char: TypedAbiArg<Uint8Array, "char">], boolean>,
      isNameInGracePeriod: {
        name: "is-name-in-grace-period",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<boolean, bigint>
      >,
      isNameLeaseExpired: {
        name: "is-name-lease-expired",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<boolean, bigint>
      >,
      nameResolve: {
        name: "name-resolve",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "name", type: { buffer: { length: 48 } } },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "lease-ending-at",
                    type: { optional: "uint128" },
                  },
                  { name: "lease-started-at", type: "uint128" },
                  { name: "owner", type: "principal" },
                  {
                    name: "zonefile-hash",
                    type: { buffer: { length: 20 } },
                  },
                ],
              },
              error: "int128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">
        ],
        Response<
          {
            leaseEndingAt: bigint | null;
            leaseStartedAt: bigint;
            owner: string;
            zonefileHash: Uint8Array;
          },
          bigint
        >
      >,
      resolvePrincipal: {
        name: "resolve-principal",
        access: "read_only",
        args: [{ name: "owner", type: "principal" }],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "name",
                    type: { buffer: { length: 48 } },
                  },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                ],
              },
              error: {
                tuple: [
                  { name: "code", type: "int128" },
                  {
                    name: "name",
                    type: {
                      optional: {
                        tuple: [
                          {
                            name: "name",
                            type: { buffer: { length: 48 } },
                          },
                          {
                            name: "namespace",
                            type: { buffer: { length: 20 } },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      } as TypedAbiFunction<
        [owner: TypedAbiArg<string, "owner">],
        Response<
          {
            name: Uint8Array;
            namespace: Uint8Array;
          },
          {
            code: bigint;
            name: {
              name: Uint8Array;
              namespace: Uint8Array;
            } | null;
          }
        >
      >,
    },
    maps: {
      namePreorders: {
        name: "name-preorders",
        key: {
          tuple: [
            { name: "buyer", type: "principal" },
            {
              name: "hashed-salted-fqn",
              type: { buffer: { length: 20 } },
            },
          ],
        },
        value: {
          tuple: [
            { name: "claimed", type: "bool" },
            {
              name: "created-at",
              type: "uint128",
            },
            { name: "stx-burned", type: "uint128" },
          ],
        },
      } as TypedAbiMap<
        {
          buyer: string;
          hashedSaltedFqn: Uint8Array;
        },
        {
          claimed: boolean;
          createdAt: bigint;
          stxBurned: bigint;
        }
      >,
      nameProperties: {
        name: "name-properties",
        key: {
          tuple: [
            { name: "name", type: { buffer: { length: 48 } } },
            { name: "namespace", type: { buffer: { length: 20 } } },
          ],
        },
        value: {
          tuple: [
            { name: "imported-at", type: { optional: "uint128" } },
            { name: "registered-at", type: { optional: "uint128" } },
            { name: "revoked-at", type: { optional: "uint128" } },
            { name: "zonefile-hash", type: { buffer: { length: 20 } } },
          ],
        },
      } as TypedAbiMap<
        {
          name: Uint8Array;
          namespace: Uint8Array;
        },
        {
          importedAt: bigint | null;
          registeredAt: bigint | null;
          revokedAt: bigint | null;
          zonefileHash: Uint8Array;
        }
      >,
      namespacePreorders: {
        name: "namespace-preorders",
        key: {
          tuple: [
            { name: "buyer", type: "principal" },
            {
              name: "hashed-salted-namespace",
              type: { buffer: { length: 20 } },
            },
          ],
        },
        value: {
          tuple: [
            { name: "claimed", type: "bool" },
            {
              name: "created-at",
              type: "uint128",
            },
            { name: "stx-burned", type: "uint128" },
          ],
        },
      } as TypedAbiMap<
        {
          buyer: string;
          hashedSaltedNamespace: Uint8Array;
        },
        {
          claimed: boolean;
          createdAt: bigint;
          stxBurned: bigint;
        }
      >,
      namespaces: {
        name: "namespaces",
        key: { buffer: { length: 20 } },
        value: {
          tuple: [
            { name: "can-update-price-function", type: "bool" },
            { name: "launched-at", type: { optional: "uint128" } },
            { name: "lifetime", type: "uint128" },
            { name: "namespace-import", type: "principal" },
            {
              name: "price-function",
              type: {
                tuple: [
                  { name: "base", type: "uint128" },
                  {
                    name: "buckets",
                    type: { list: { type: "uint128", length: 16 } },
                  },
                  { name: "coeff", type: "uint128" },
                  { name: "no-vowel-discount", type: "uint128" },
                  { name: "nonalpha-discount", type: "uint128" },
                ],
              },
            },
            { name: "revealed-at", type: "uint128" },
          ],
        },
      } as TypedAbiMap<
        Uint8Array,
        {
          canUpdatePriceFunction: boolean;
          launchedAt: bigint | null;
          lifetime: bigint;
          namespaceImport: string;
          priceFunction: {
            base: bigint;
            buckets: bigint[];
            coeff: bigint;
            noVowelDiscount: bigint;
            nonalphaDiscount: bigint;
          };
          revealedAt: bigint;
        }
      >,
      ownerName: {
        name: "owner-name",
        key: "principal",
        value: {
          tuple: [
            { name: "name", type: { buffer: { length: 48 } } },
            { name: "namespace", type: { buffer: { length: 20 } } },
          ],
        },
      } as TypedAbiMap<
        string,
        {
          name: Uint8Array;
          namespace: Uint8Array;
        }
      >,
    },
    variables: {
      ERR_INSUFFICIENT_FUNDS: {
        name: "ERR_INSUFFICIENT_FUNDS",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_ALREADY_EXISTS: {
        name: "ERR_NAMESPACE_ALREADY_EXISTS",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_ALREADY_LAUNCHED: {
        name: "ERR_NAMESPACE_ALREADY_LAUNCHED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_BLANK: {
        name: "ERR_NAMESPACE_BLANK",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_CHARSET_INVALID: {
        name: "ERR_NAMESPACE_CHARSET_INVALID",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_HASH_MALFORMED: {
        name: "ERR_NAMESPACE_HASH_MALFORMED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_NOT_FOUND: {
        name: "ERR_NAMESPACE_NOT_FOUND",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_NOT_LAUNCHED: {
        name: "ERR_NAMESPACE_NOT_LAUNCHED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_OPERATION_UNAUTHORIZED: {
        name: "ERR_NAMESPACE_OPERATION_UNAUTHORIZED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_PREORDER_ALREADY_EXISTS: {
        name: "ERR_NAMESPACE_PREORDER_ALREADY_EXISTS",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_PREORDER_CLAIMABILITY_EXPIRED: {
        name: "ERR_NAMESPACE_PREORDER_CLAIMABILITY_EXPIRED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_PREORDER_EXPIRED: {
        name: "ERR_NAMESPACE_PREORDER_EXPIRED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_PREORDER_LAUNCHABILITY_EXPIRED: {
        name: "ERR_NAMESPACE_PREORDER_LAUNCHABILITY_EXPIRED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_PREORDER_NOT_FOUND: {
        name: "ERR_NAMESPACE_PREORDER_NOT_FOUND",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_PRICE_FUNCTION_INVALID: {
        name: "ERR_NAMESPACE_PRICE_FUNCTION_INVALID",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_STX_BURNT_INSUFFICIENT: {
        name: "ERR_NAMESPACE_STX_BURNT_INSUFFICIENT",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAMESPACE_UNAVAILABLE: {
        name: "ERR_NAMESPACE_UNAVAILABLE",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_ALREADY_CLAIMED: {
        name: "ERR_NAME_ALREADY_CLAIMED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_BLANK: {
        name: "ERR_NAME_BLANK",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_CHARSET_INVALID: {
        name: "ERR_NAME_CHARSET_INVALID",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_CLAIMABILITY_EXPIRED: {
        name: "ERR_NAME_CLAIMABILITY_EXPIRED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_COULD_NOT_BE_MINTED: {
        name: "ERR_NAME_COULD_NOT_BE_MINTED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_COULD_NOT_BE_TRANSFERED: {
        name: "ERR_NAME_COULD_NOT_BE_TRANSFERED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_EXPIRED: {
        name: "ERR_NAME_EXPIRED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_GRACE_PERIOD: {
        name: "ERR_NAME_GRACE_PERIOD",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_HASH_MALFORMED: {
        name: "ERR_NAME_HASH_MALFORMED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_NOT_FOUND: {
        name: "ERR_NAME_NOT_FOUND",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_NOT_RESOLVABLE: {
        name: "ERR_NAME_NOT_RESOLVABLE",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_OPERATION_UNAUTHORIZED: {
        name: "ERR_NAME_OPERATION_UNAUTHORIZED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_PREORDERED_BEFORE_NAMESPACE_LAUNCH: {
        name: "ERR_NAME_PREORDERED_BEFORE_NAMESPACE_LAUNCH",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_PREORDER_ALREADY_EXISTS: {
        name: "ERR_NAME_PREORDER_ALREADY_EXISTS",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_PREORDER_EXPIRED: {
        name: "ERR_NAME_PREORDER_EXPIRED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_PREORDER_FUNDS_INSUFFICIENT: {
        name: "ERR_NAME_PREORDER_FUNDS_INSUFFICIENT",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_PREORDER_NOT_FOUND: {
        name: "ERR_NAME_PREORDER_NOT_FOUND",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_REVOKED: {
        name: "ERR_NAME_REVOKED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_STX_BURNT_INSUFFICIENT: {
        name: "ERR_NAME_STX_BURNT_INSUFFICIENT",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_TRANSFER_FAILED: {
        name: "ERR_NAME_TRANSFER_FAILED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_NAME_UNAVAILABLE: {
        name: "ERR_NAME_UNAVAILABLE",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_PANIC: {
        name: "ERR_PANIC",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_PRINCIPAL_ALREADY_ASSOCIATED: {
        name: "ERR_PRINCIPAL_ALREADY_ASSOCIATED",
        type: "int128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      NAMESPACE_LAUNCHABILITY_TTL: {
        name: "NAMESPACE_LAUNCHABILITY_TTL",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      NAMESPACE_PREORDER_CLAIMABILITY_TTL: {
        name: "NAMESPACE_PREORDER_CLAIMABILITY_TTL",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      NAMESPACE_PRICE_TIERS: {
        name: "NAMESPACE_PRICE_TIERS",
        type: {
          list: {
            type: "uint128",
            length: 20,
          },
        },
        access: "constant",
      } as TypedAbiVariable<bigint[]>,
      NAME_GRACE_PERIOD_DURATION: {
        name: "NAME_GRACE_PERIOD_DURATION",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      NAME_PREORDER_CLAIMABILITY_TTL: {
        name: "NAME_PREORDER_CLAIMABILITY_TTL",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      attachmentIndex: {
        name: "attachment-index",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
    },
    constants: {
      ERR_INSUFFICIENT_FUNDS: 4001n,
      ERR_NAMESPACE_ALREADY_EXISTS: 1006n,
      ERR_NAMESPACE_ALREADY_LAUNCHED: 1014n,
      ERR_NAMESPACE_BLANK: 1013n,
      ERR_NAMESPACE_CHARSET_INVALID: 1016n,
      ERR_NAMESPACE_HASH_MALFORMED: 1015n,
      ERR_NAMESPACE_NOT_FOUND: 1005n,
      ERR_NAMESPACE_NOT_LAUNCHED: 1007n,
      ERR_NAMESPACE_OPERATION_UNAUTHORIZED: 1011n,
      ERR_NAMESPACE_PREORDER_ALREADY_EXISTS: 1003n,
      ERR_NAMESPACE_PREORDER_CLAIMABILITY_EXPIRED: 1009n,
      ERR_NAMESPACE_PREORDER_EXPIRED: 1002n,
      ERR_NAMESPACE_PREORDER_LAUNCHABILITY_EXPIRED: 1010n,
      ERR_NAMESPACE_PREORDER_NOT_FOUND: 1001n,
      ERR_NAMESPACE_PRICE_FUNCTION_INVALID: 1008n,
      ERR_NAMESPACE_STX_BURNT_INSUFFICIENT: 1012n,
      ERR_NAMESPACE_UNAVAILABLE: 1004n,
      ERR_NAME_ALREADY_CLAIMED: 2011n,
      ERR_NAME_BLANK: 2010n,
      ERR_NAME_CHARSET_INVALID: 2022n,
      ERR_NAME_CLAIMABILITY_EXPIRED: 2012n,
      ERR_NAME_COULD_NOT_BE_MINTED: 2020n,
      ERR_NAME_COULD_NOT_BE_TRANSFERED: 2021n,
      ERR_NAME_EXPIRED: 2008n,
      ERR_NAME_GRACE_PERIOD: 2009n,
      ERR_NAME_HASH_MALFORMED: 2017n,
      ERR_NAME_NOT_FOUND: 2013n,
      ERR_NAME_NOT_RESOLVABLE: 2019n,
      ERR_NAME_OPERATION_UNAUTHORIZED: 2006n,
      ERR_NAME_PREORDERED_BEFORE_NAMESPACE_LAUNCH: 2018n,
      ERR_NAME_PREORDER_ALREADY_EXISTS: 2016n,
      ERR_NAME_PREORDER_EXPIRED: 2002n,
      ERR_NAME_PREORDER_FUNDS_INSUFFICIENT: 2003n,
      ERR_NAME_PREORDER_NOT_FOUND: 2001n,
      ERR_NAME_REVOKED: 2014n,
      ERR_NAME_STX_BURNT_INSUFFICIENT: 2007n,
      ERR_NAME_TRANSFER_FAILED: 2015n,
      ERR_NAME_UNAVAILABLE: 2004n,
      ERR_PANIC: 0n,
      ERR_PRINCIPAL_ALREADY_ASSOCIATED: 3001n,
      NAMESPACE_LAUNCHABILITY_TTL: 52595n,
      NAMESPACE_PREORDER_CLAIMABILITY_TTL: 144n,
      NAMESPACE_PRICE_TIERS: [
        640000000000n,
        64000000000n,
        64000000000n,
        6400000000n,
        6400000000n,
        6400000000n,
        6400000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
        640000000n,
      ],
      NAME_GRACE_PERIOD_DURATION: 5000n,
      NAME_PREORDER_CLAIMABILITY_TTL: 144n,
      attachmentIndex: 0n,
    },
    non_fungible_tokens: [
      {
        name: "names",
        type: {
          tuple: [
            { name: "name", type: { buffer: { length: 48 } } },
            { name: "namespace", type: { buffer: { length: 20 } } },
          ],
        },
      } as ClarityAbiTypeNonFungibleToken,
    ],
    fungible_tokens: [],
    clarity_version: "Clarity1",
    contractName: "bns-v1",
  },
  executorDao: {
    functions: {
      isSelfOrExtension: {
        name: "is-self-or-extension",
        access: "private",
        args: [],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      setExtensionsIter: {
        name: "set-extensions-iter",
        access: "private",
        args: [
          {
            name: "item",
            type: {
              tuple: [
                { name: "enabled", type: "bool" },
                {
                  name: "extension",
                  type: "principal",
                },
              ],
            },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          item: TypedAbiArg<
            {
              enabled: boolean;
              extension: string;
            },
            "item"
          >
        ],
        boolean
      >,
      setRolesIter: {
        name: "set-roles-iter",
        access: "private",
        args: [
          {
            name: "item",
            type: {
              tuple: [
                { name: "enabled", type: "bool" },
                {
                  name: "extension",
                  type: "principal",
                },
                {
                  name: "role",
                  type: { "string-ascii": { length: 10 } },
                },
              ],
            },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          item: TypedAbiArg<
            {
              enabled: boolean;
              extension: string;
              role: string;
            },
            "item"
          >
        ],
        boolean
      >,
      construct: {
        name: "construct",
        access: "public",
        args: [{ name: "proposal", type: "trait_reference" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [proposal: TypedAbiArg<string, "proposal">],
        Response<boolean, bigint>
      >,
      execute: {
        name: "execute",
        access: "public",
        args: [
          { name: "proposal", type: "trait_reference" },
          {
            name: "sender",
            type: "principal",
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          proposal: TypedAbiArg<string, "proposal">,
          sender: TypedAbiArg<string, "sender">
        ],
        Response<boolean, bigint>
      >,
      requestExtensionCallback: {
        name: "request-extension-callback",
        access: "public",
        args: [
          { name: "extension", type: "trait_reference" },
          {
            name: "memo",
            type: { buffer: { length: 34 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          extension: TypedAbiArg<string, "extension">,
          memo: TypedAbiArg<Uint8Array, "memo">
        ],
        Response<boolean, bigint>
      >,
      setExtension: {
        name: "set-extension",
        access: "public",
        args: [
          { name: "extension", type: "principal" },
          {
            name: "enabled",
            type: "bool",
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          extension: TypedAbiArg<string, "extension">,
          enabled: TypedAbiArg<boolean, "enabled">
        ],
        Response<boolean, bigint>
      >,
      setExtensionRoles: {
        name: "set-extension-roles",
        access: "public",
        args: [
          {
            name: "extension-list",
            type: {
              list: {
                type: {
                  tuple: [
                    { name: "enabled", type: "bool" },
                    {
                      name: "extension",
                      type: "principal",
                    },
                    {
                      name: "role",
                      type: { "string-ascii": { length: 10 } },
                    },
                  ],
                },
                length: 200,
              },
            },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: { list: { type: "bool", length: 200 } },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          extensionList: TypedAbiArg<
            {
              enabled: boolean;
              extension: string;
              role: string;
            }[],
            "extensionList"
          >
        ],
        Response<boolean[], bigint>
      >,
      setExtensions: {
        name: "set-extensions",
        access: "public",
        args: [
          {
            name: "extension-list",
            type: {
              list: {
                type: {
                  tuple: [
                    { name: "enabled", type: "bool" },
                    {
                      name: "extension",
                      type: "principal",
                    },
                  ],
                },
                length: 200,
              },
            },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: { list: { type: "bool", length: 200 } },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          extensionList: TypedAbiArg<
            {
              enabled: boolean;
              extension: string;
            }[],
            "extensionList"
          >
        ],
        Response<boolean[], bigint>
      >,
      executedAt: {
        name: "executed-at",
        access: "read_only",
        args: [{ name: "proposal", type: "trait_reference" }],
        outputs: { type: { optional: "uint128" } },
      } as TypedAbiFunction<
        [proposal: TypedAbiArg<string, "proposal">],
        bigint | null
      >,
      hasRole: {
        name: "has-role",
        access: "read_only",
        args: [
          { name: "extension", type: "principal" },
          {
            name: "role",
            type: { "string-ascii": { length: 10 } },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          extension: TypedAbiArg<string, "extension">,
          role: TypedAbiArg<string, "role">
        ],
        boolean
      >,
      hasRoleOrExtension: {
        name: "has-role-or-extension",
        access: "read_only",
        args: [
          { name: "extension", type: "principal" },
          {
            name: "role",
            type: { "string-ascii": { length: 10 } },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          extension: TypedAbiArg<string, "extension">,
          role: TypedAbiArg<string, "role">
        ],
        boolean
      >,
      isExtension: {
        name: "is-extension",
        access: "read_only",
        args: [{ name: "extension", type: "principal" }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [extension: TypedAbiArg<string, "extension">],
        boolean
      >,
    },
    maps: {
      executedProposals: {
        name: "executed-proposals",
        key: "principal",
        value: "uint128",
      } as TypedAbiMap<string, bigint>,
      extensionRoles: {
        name: "extension-roles",
        key: {
          tuple: [
            { name: "extension", type: "principal" },
            {
              name: "role",
              type: { "string-ascii": { length: 10 } },
            },
          ],
        },
        value: "bool",
      } as TypedAbiMap<
        {
          extension: string;
          role: string;
        },
        boolean
      >,
      extensions: {
        name: "extensions",
        key: "principal",
        value: "bool",
      } as TypedAbiMap<string, boolean>,
    },
    variables: {
      errAlreadyExecuted: {
        name: "err-already-executed",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errInvalidExtension: {
        name: "err-invalid-extension",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      errUnauthorised: {
        name: "err-unauthorised",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      executive: {
        name: "executive",
        type: "principal",
        access: "variable",
      } as TypedAbiVariable<string>,
    },
    constants: {
      errAlreadyExecuted: {
        isOk: false,
        value: 1001n,
      },
      errInvalidExtension: {
        isOk: false,
        value: 1002n,
      },
      errUnauthorised: {
        isOk: false,
        value: 1000n,
      },
      executive: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity1",
    contractName: "executor-dao",
  },
  extensionTrait: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity1",
    contractName: "extension-trait",
  },
  managedNamespaces: {
    functions: {
      isDaoOrController: {
        name: "is-dao-or-controller",
        access: "private",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, bigint>
      >,
      setControllersIter: {
        name: "set-controllers-iter",
        access: "private",
        args: [
          {
            name: "item",
            type: {
              tuple: [
                { name: "controller", type: "principal" },
                {
                  name: "enabled",
                  type: "bool",
                },
                { name: "namespace", type: { buffer: { length: 20 } } },
              ],
            },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          item: TypedAbiArg<
            {
              controller: string;
              enabled: boolean;
              namespace: Uint8Array;
            },
            "item"
          >
        ],
        Response<boolean, bigint>
      >,
      validateNamespaceUpdate: {
        name: "validate-namespace-update",
        access: "private",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, bigint>
      >,
      setNamespaceControllers: {
        name: "set-namespace-controllers",
        access: "public",
        args: [
          {
            name: "extension-list",
            type: {
              list: {
                type: {
                  tuple: [
                    { name: "controller", type: "principal" },
                    {
                      name: "enabled",
                      type: "bool",
                    },
                    {
                      name: "namespace",
                      type: { buffer: { length: 20 } },
                    },
                  ],
                },
                length: 200,
              },
            },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                list: {
                  type: { response: { ok: "bool", error: "uint128" } },
                  length: 200,
                },
              },
              error: "none",
            },
          },
        },
      } as TypedAbiFunction<
        [
          extensionList: TypedAbiArg<
            {
              controller: string;
              enabled: boolean;
              namespace: Uint8Array;
            }[],
            "extensionList"
          >
        ],
        Response<Response<boolean, bigint>[], null>
      >,
      setNamespaceOwner: {
        name: "set-namespace-owner",
        access: "public",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "owner", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          owner: TypedAbiArg<string, "owner">
        ],
        Response<boolean, bigint>
      >,
      getNamespaceOwner: {
        name: "get-namespace-owner",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: { type: { optional: "principal" } },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        string | null
      >,
      isController: {
        name: "is-controller",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "controller", type: "principal" },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          controller: TypedAbiArg<string, "controller">
        ],
        boolean
      >,
      isNamespaceController: {
        name: "is-namespace-controller",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "controller", type: "principal" },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          controller: TypedAbiArg<string, "controller">
        ],
        boolean
      >,
    },
    maps: {
      namespaceControllersMap: {
        name: "namespace-controllers-map",
        key: {
          tuple: [
            { name: "controller", type: "principal" },
            {
              name: "namespace",
              type: { buffer: { length: 20 } },
            },
          ],
        },
        value: "bool",
      } as TypedAbiMap<
        {
          controller: string;
          namespace: Uint8Array;
        },
        boolean
      >,
      namespaceOwnersMap: {
        name: "namespace-owners-map",
        key: { buffer: { length: 20 } },
        value: "principal",
      } as TypedAbiMap<Uint8Array, string>,
    },
    variables: {
      ERR_NAMESPACE_OWNER_EXISTS: {
        name: "ERR_NAMESPACE_OWNER_EXISTS",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_NAMESPACE_UPDATE_UNAUTHORIZED: {
        name: "ERR_NAMESPACE_UPDATE_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_UNAUTHORIZED: {
        name: "ERR_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      NAMESPACE_MANAGER_ROLE: {
        name: "NAMESPACE_MANAGER_ROLE",
        type: {
          "string-ascii": {
            length: 10,
          },
        },
        access: "constant",
      } as TypedAbiVariable<string>,
    },
    constants: {
      ERR_NAMESPACE_OWNER_EXISTS: {
        isOk: false,
        value: 7005n,
      },
      ERR_NAMESPACE_UPDATE_UNAUTHORIZED: {
        isOk: false,
        value: 7006n,
      },
      ERR_UNAUTHORIZED: {
        isOk: false,
        value: 7000n,
      },
      NAMESPACE_MANAGER_ROLE: "namespaces",
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "managed-namespaces",
  },
  nameRegistry: {
    functions: {
      addNode: {
        name: "add-node",
        access: "private",
        args: [
          { name: "account", type: "principal" },
          {
            name: "id",
            type: "uint128",
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          account: TypedAbiArg<string, "account">,
          id: TypedAbiArg<number | bigint, "id">
        ],
        boolean
      >,
      burnName: {
        name: "burn-name",
        access: "private",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
      incrementId: {
        name: "increment-id",
        access: "private",
        args: [],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[], bigint>,
      mergeNameProps: {
        name: "merge-name-props",
        access: "private",
        args: [
          {
            name: "name",
            type: {
              tuple: [
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                { name: "namespace", type: { buffer: { length: 20 } } },
              ],
            },
          },
          { name: "id", type: "uint128" },
        ],
        outputs: {
          type: {
            optional: {
              tuple: [
                { name: "id", type: "uint128" },
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                {
                  name: "namespace",
                  type: { buffer: { length: 20 } },
                },
                { name: "owner", type: "principal" },
              ],
            },
          },
        },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<
            {
              name: Uint8Array;
              namespace: Uint8Array;
            },
            "name"
          >,
          id: TypedAbiArg<number | bigint, "id">
        ],
        {
          id: bigint;
          name: Uint8Array;
          namespace: Uint8Array;
          owner: string;
        } | null
      >,
      printPrimaryUpdate: {
        name: "print-primary-update",
        access: "private",
        args: [
          { name: "account", type: "principal" },
          {
            name: "id",
            type: { optional: "uint128" },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          account: TypedAbiArg<string, "account">,
          id: TypedAbiArg<number | bigint | null, "id">
        ],
        boolean
      >,
      removeNode: {
        name: "remove-node",
        access: "private",
        args: [
          { name: "account", type: "principal" },
          {
            name: "id",
            type: "uint128",
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          account: TypedAbiArg<string, "account">,
          id: TypedAbiArg<number | bigint, "id">
        ],
        boolean
      >,
      setFirst: {
        name: "set-first",
        access: "private",
        args: [
          { name: "account", type: "principal" },
          {
            name: "node",
            type: "uint128",
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          account: TypedAbiArg<string, "account">,
          node: TypedAbiArg<number | bigint, "node">
        ],
        Response<boolean, bigint>
      >,
      transferOwnership: {
        name: "transfer-ownership",
        access: "private",
        args: [
          { name: "id", type: "uint128" },
          {
            name: "sender",
            type: "principal",
          },
          { name: "recipient", type: "principal" },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          id: TypedAbiArg<number | bigint, "id">,
          sender: TypedAbiArg<string, "sender">,
          recipient: TypedAbiArg<string, "recipient">
        ],
        boolean
      >,
      burn: {
        name: "burn",
        access: "public",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
      daoSetTokenUri: {
        name: "dao-set-token-uri",
        access: "public",
        args: [
          {
            name: "uri",
            type: { "string-ascii": { length: 256 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [uri: TypedAbiArg<string, "uri">],
        Response<boolean, bigint>
      >,
      mngBurn: {
        name: "mng-burn",
        access: "public",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
      mngTransfer: {
        name: "mng-transfer",
        access: "public",
        args: [
          { name: "id", type: "uint128" },
          {
            name: "recipient",
            type: "principal",
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          id: TypedAbiArg<number | bigint, "id">,
          recipient: TypedAbiArg<string, "recipient">
        ],
        Response<boolean, bigint>
      >,
      register: {
        name: "register",
        access: "public",
        args: [
          {
            name: "name",
            type: {
              tuple: [
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                { name: "namespace", type: { buffer: { length: 20 } } },
              ],
            },
          },
          { name: "owner", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<
            {
              name: Uint8Array;
              namespace: Uint8Array;
            },
            "name"
          >,
          owner: TypedAbiArg<string, "owner">
        ],
        Response<bigint, bigint>
      >,
      removeDaoNamespaceManager: {
        name: "remove-dao-namespace-manager",
        access: "public",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, bigint>
      >,
      setNamespaceManager: {
        name: "set-namespace-manager",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "manager", type: "principal" },
          { name: "enabled", type: "bool" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          manager: TypedAbiArg<string, "manager">,
          enabled: TypedAbiArg<boolean, "enabled">
        ],
        Response<boolean, bigint>
      >,
      setNamespaceTransfersAllowed: {
        name: "set-namespace-transfers-allowed",
        access: "public",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "enabled", type: "bool" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          enabled: TypedAbiArg<boolean, "enabled">
        ],
        Response<boolean, bigint>
      >,
      setPrimaryName: {
        name: "set-primary-name",
        access: "public",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
      transfer: {
        name: "transfer",
        access: "public",
        args: [
          { name: "id", type: "uint128" },
          {
            name: "sender",
            type: "principal",
          },
          { name: "recipient", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          id: TypedAbiArg<number | bigint, "id">,
          sender: TypedAbiArg<string, "sender">,
          recipient: TypedAbiArg<string, "recipient">
        ],
        Response<boolean, bigint>
      >,
      areTransfersAllowed: {
        name: "are-transfers-allowed",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        boolean
      >,
      canDaoManageNs: {
        name: "can-dao-manage-ns",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        boolean
      >,
      getBalance: {
        name: "get-balance",
        access: "read_only",
        args: [{ name: "account", type: "principal" }],
        outputs: { type: "uint128" },
      } as TypedAbiFunction<[account: TypedAbiArg<string, "account">], bigint>,
      getBalanceOf: {
        name: "get-balance-of",
        access: "read_only",
        args: [{ name: "account", type: "principal" }],
        outputs: {
          type: { response: { ok: "uint128", error: "none" } },
        },
      } as TypedAbiFunction<
        [account: TypedAbiArg<string, "account">],
        Response<bigint, null>
      >,
      getIdForName: {
        name: "get-id-for-name",
        access: "read_only",
        args: [
          {
            name: "name",
            type: {
              tuple: [
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                { name: "namespace", type: { buffer: { length: 20 } } },
              ],
            },
          },
        ],
        outputs: { type: { optional: "uint128" } },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<
            {
              name: Uint8Array;
              namespace: Uint8Array;
            },
            "name"
          >
        ],
        bigint | null
      >,
      getLastTokenId: {
        name: "get-last-token-id",
        access: "read_only",
        args: [],
        outputs: {
          type: { response: { ok: "uint128", error: "none" } },
        },
      } as TypedAbiFunction<[], Response<bigint, null>>,
      getNameOwner: {
        name: "get-name-owner",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: { type: { optional: "principal" } },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        string | null
      >,
      getNameProperties: {
        name: "get-name-properties",
        access: "read_only",
        args: [
          {
            name: "name",
            type: {
              tuple: [
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                { name: "namespace", type: { buffer: { length: 20 } } },
              ],
            },
          },
        ],
        outputs: {
          type: {
            optional: {
              tuple: [
                { name: "id", type: "uint128" },
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                {
                  name: "namespace",
                  type: { buffer: { length: 20 } },
                },
                { name: "owner", type: "principal" },
              ],
            },
          },
        },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<
            {
              name: Uint8Array;
              namespace: Uint8Array;
            },
            "name"
          >
        ],
        {
          id: bigint;
          name: Uint8Array;
          namespace: Uint8Array;
          owner: string;
        } | null
      >,
      getNamePropertiesById: {
        name: "get-name-properties-by-id",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: {
            optional: {
              tuple: [
                { name: "id", type: "uint128" },
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                {
                  name: "namespace",
                  type: { buffer: { length: 20 } },
                },
                { name: "owner", type: "principal" },
              ],
            },
          },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        {
          id: bigint;
          name: Uint8Array;
          namespace: Uint8Array;
          owner: string;
        } | null
      >,
      getNamespaceForId: {
        name: "get-namespace-for-id",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: {
            response: {
              ok: { buffer: { length: 20 } },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<Uint8Array, bigint>
      >,
      getNextNodeId: {
        name: "get-next-node-id",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: { type: { optional: "uint128" } },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        bigint | null
      >,
      getOwner: {
        name: "get-owner",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: {
            response: { ok: { optional: "principal" }, error: "none" },
          },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<string | null, null>
      >,
      getPrimaryName: {
        name: "get-primary-name",
        access: "read_only",
        args: [{ name: "account", type: "principal" }],
        outputs: {
          type: {
            optional: {
              tuple: [
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                {
                  name: "namespace",
                  type: { buffer: { length: 20 } },
                },
              ],
            },
          },
        },
      } as TypedAbiFunction<
        [account: TypedAbiArg<string, "account">],
        {
          name: Uint8Array;
          namespace: Uint8Array;
        } | null
      >,
      getPrimaryNameProperties: {
        name: "get-primary-name-properties",
        access: "read_only",
        args: [{ name: "account", type: "principal" }],
        outputs: {
          type: {
            optional: {
              tuple: [
                { name: "id", type: "uint128" },
                {
                  name: "name",
                  type: { buffer: { length: 48 } },
                },
                {
                  name: "namespace",
                  type: { buffer: { length: 20 } },
                },
                { name: "owner", type: "principal" },
              ],
            },
          },
        },
      } as TypedAbiFunction<
        [account: TypedAbiArg<string, "account">],
        {
          id: bigint;
          name: Uint8Array;
          namespace: Uint8Array;
          owner: string;
        } | null
      >,
      getTokenUri: {
        name: "get-token-uri",
        access: "read_only",
        args: [],
        outputs: {
          type: {
            response: {
              ok: { "string-ascii": { length: 256 } },
              error: "none",
            },
          },
        },
      } as TypedAbiFunction<[], Response<string, null>>,
      isDaoOrExtension: {
        name: "is-dao-or-extension",
        access: "read_only",
        args: [],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      isNamespaceManager: {
        name: "is-namespace-manager",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "manager", type: "principal" },
        ],
        outputs: { type: "bool" },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          manager: TypedAbiArg<string, "manager">
        ],
        boolean
      >,
      validateNamespaceAction: {
        name: "validate-namespace-action",
        access: "read_only",
        args: [
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [namespace: TypedAbiArg<Uint8Array, "namespace">],
        Response<boolean, bigint>
      >,
      validateNamespaceActionById: {
        name: "validate-namespace-action-by-id",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
    },
    maps: {
      daoNamespaceManagerMap: {
        name: "dao-namespace-manager-map",
        key: { buffer: { length: 20 } },
        value: "bool",
      } as TypedAbiMap<Uint8Array, boolean>,
      idNameMap: {
        name: "id-name-map",
        key: "uint128",
        value: {
          tuple: [
            { name: "name", type: { buffer: { length: 48 } } },
            { name: "namespace", type: { buffer: { length: 20 } } },
          ],
        },
      } as TypedAbiMap<
        number | bigint,
        {
          name: Uint8Array;
          namespace: Uint8Array;
        }
      >,
      nameEncodingMap: {
        name: "name-encoding-map",
        key: "uint128",
        value: { buffer: { length: 1 } },
      } as TypedAbiMap<number | bigint, Uint8Array>,
      nameIdMap: {
        name: "name-id-map",
        key: {
          tuple: [
            { name: "name", type: { buffer: { length: 48 } } },
            { name: "namespace", type: { buffer: { length: 20 } } },
          ],
        },
        value: "uint128",
      } as TypedAbiMap<
        {
          name: Uint8Array;
          namespace: Uint8Array;
        },
        bigint
      >,
      nameOwnerMap: {
        name: "name-owner-map",
        key: "uint128",
        value: "principal",
      } as TypedAbiMap<number | bigint, string>,
      namespaceManagersMap: {
        name: "namespace-managers-map",
        key: {
          tuple: [
            { name: "manager", type: "principal" },
            {
              name: "namespace",
              type: { buffer: { length: 20 } },
            },
          ],
        },
        value: "bool",
      } as TypedAbiMap<
        {
          manager: string;
          namespace: Uint8Array;
        },
        boolean
      >,
      namespaceTransfersAllowed: {
        name: "namespace-transfers-allowed",
        key: { buffer: { length: 20 } },
        value: "bool",
      } as TypedAbiMap<Uint8Array, boolean>,
      ownerBalanceMap: {
        name: "owner-balance-map",
        key: "principal",
        value: "uint128",
      } as TypedAbiMap<string, bigint>,
      ownerLastNameMap: {
        name: "owner-last-name-map",
        key: "principal",
        value: "uint128",
      } as TypedAbiMap<string, bigint>,
      ownerNameNextMap: {
        name: "owner-name-next-map",
        key: "uint128",
        value: "uint128",
      } as TypedAbiMap<number | bigint, bigint>,
      ownerNamePrevMap: {
        name: "owner-name-prev-map",
        key: "uint128",
        value: "uint128",
      } as TypedAbiMap<number | bigint, bigint>,
      ownerPrimaryNameMap: {
        name: "owner-primary-name-map",
        key: "principal",
        value: "uint128",
      } as TypedAbiMap<string, bigint>,
    },
    variables: {
      ERR_ALREADY_REGISTERED: {
        name: "ERR_ALREADY_REGISTERED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_CANNOT_SET_PRIMARY: {
        name: "ERR_CANNOT_SET_PRIMARY",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_EXPIRED: {
        name: "ERR_EXPIRED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_INVALID_ID: {
        name: "ERR_INVALID_ID",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_NOT_OWNER: {
        name: "ERR_NOT_OWNER",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_TRANSFER_BLOCKED: {
        name: "ERR_TRANSFER_BLOCKED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_UNAUTHORIZED: {
        name: "ERR_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ROLE: {
        name: "ROLE",
        type: {
          "string-ascii": {
            length: 8,
          },
        },
        access: "constant",
      } as TypedAbiVariable<string>,
      lastIdVar: {
        name: "last-id-var",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      tokenUriVar: {
        name: "token-uri-var",
        type: {
          "string-ascii": {
            length: 256,
          },
        },
        access: "variable",
      } as TypedAbiVariable<string>,
    },
    constants: {
      ERR_ALREADY_REGISTERED: {
        isOk: false,
        value: 4001n,
      },
      ERR_CANNOT_SET_PRIMARY: {
        isOk: false,
        value: 4002n,
      },
      ERR_EXPIRED: {
        isOk: false,
        value: 4004n,
      },
      ERR_INVALID_ID: {
        isOk: false,
        value: 4003n,
      },
      ERR_NOT_OWNER: {
        isOk: false,
        value: 4n,
      },
      ERR_TRANSFER_BLOCKED: {
        isOk: false,
        value: 4005n,
      },
      ERR_UNAUTHORIZED: {
        isOk: false,
        value: 4000n,
      },
      ROLE: "registry",
      lastIdVar: 0n,
      tokenUriVar: "",
    },
    non_fungible_tokens: [
      { name: "names", type: "uint128" } as ClarityAbiTypeNonFungibleToken,
    ],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "name-registry",
  },
  nameWrapper: {
    functions: {
      nameUpdate: {
        name: "name-update",
        access: "public",
        args: [
          { name: "namespace", type: { buffer: { length: 20 } } },
          { name: "name", type: { buffer: { length: 48 } } },
          { name: "zonefile-hash", type: { buffer: { length: 20 } } },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          name: TypedAbiArg<Uint8Array, "name">,
          zonefileHash: TypedAbiArg<Uint8Array, "zonefileHash">
        ],
        Response<boolean, bigint>
      >,
      unwrap: {
        name: "unwrap",
        access: "public",
        args: [{ name: "recipient", type: { optional: "principal" } }],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  { name: "id", type: "uint128" },
                  {
                    name: "name",
                    type: { buffer: { length: 48 } },
                  },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                  { name: "owner", type: "principal" },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [recipient: TypedAbiArg<string | null, "recipient">],
        Response<
          {
            id: bigint;
            name: Uint8Array;
            namespace: Uint8Array;
            owner: string;
          },
          bigint
        >
      >,
      getNameInfo: {
        name: "get-name-info",
        access: "read_only",
        args: [],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  { name: "id", type: "uint128" },
                  {
                    name: "name",
                    type: { buffer: { length: 48 } },
                  },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                  { name: "owner", type: "principal" },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [],
        Response<
          {
            id: bigint;
            name: Uint8Array;
            namespace: Uint8Array;
            owner: string;
          },
          bigint
        >
      >,
      getOwnName: {
        name: "get-own-name",
        access: "read_only",
        args: [],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "name",
                    type: { buffer: { length: 48 } },
                  },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [],
        Response<
          {
            name: Uint8Array;
            namespace: Uint8Array;
          },
          bigint
        >
      >,
      getOwner: {
        name: "get-owner",
        access: "read_only",
        args: [],
        outputs: {
          type: { response: { ok: "principal", error: "uint128" } },
        },
      } as TypedAbiFunction<[], Response<string, bigint>>,
    },
    maps: {},
    variables: {
      ERR_NAME_TRANSFER: {
        name: "ERR_NAME_TRANSFER",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_NOT_WRAPPED: {
        name: "ERR_NOT_WRAPPED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_NO_NAME: {
        name: "ERR_NO_NAME",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_UNAUTHORIZED: {
        name: "ERR_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
    },
    constants: {
      ERR_NAME_TRANSFER: {
        isOk: false,
        value: 10001n,
      },
      ERR_NOT_WRAPPED: {
        isOk: false,
        value: 10003n,
      },
      ERR_NO_NAME: {
        isOk: false,
        value: 10000n,
      },
      ERR_UNAUTHORIZED: {
        isOk: false,
        value: 10002n,
      },
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "name-wrapper",
  },
  nftTrait: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity1",
    contractName: "nft-trait",
  },
  onchainResolver: {
    functions: {
      emitZonefile: {
        name: "emit-zonefile",
        access: "public",
        args: [
          {
            name: "zonefile",
            type: { buffer: { length: 102400 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "none" } },
        },
      } as TypedAbiFunction<
        [zonefile: TypedAbiArg<Uint8Array, "zonefile">],
        Response<boolean, null>
      >,
      setZonefile: {
        name: "set-zonefile",
        access: "public",
        args: [
          { name: "id", type: "uint128" },
          {
            name: "zonefile",
            type: { buffer: { length: 2048 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          id: TypedAbiArg<number | bigint, "id">,
          zonefile: TypedAbiArg<Uint8Array, "zonefile">
        ],
        Response<boolean, bigint>
      >,
      resolveZonefile: {
        name: "resolve-zonefile",
        access: "read_only",
        args: [{ name: "id", type: "uint128" }],
        outputs: { type: { optional: { buffer: { length: 2048 } } } },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Uint8Array | null
      >,
      resolveZonefileForName: {
        name: "resolve-zonefile-for-name",
        access: "read_only",
        args: [
          { name: "name", type: { buffer: { length: 48 } } },
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: { type: { optional: { buffer: { length: 2048 } } } },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<Uint8Array, "name">,
          namespace: TypedAbiArg<Uint8Array, "namespace">
        ],
        Uint8Array | null
      >,
    },
    maps: {
      zonefilesMap: {
        name: "zonefiles-map",
        key: "uint128",
        value: { buffer: { length: 2048 } },
      } as TypedAbiMap<number | bigint, Uint8Array>,
    },
    variables: {
      ERR_UNAUTHORIZED: {
        name: "ERR_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
    },
    constants: {
      ERR_UNAUTHORIZED: {
        isOk: false,
        value: 8000n,
      },
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "onchain-resolver",
  },
  proposalBootstrap: {
    functions: {
      addTestUtils: {
        name: "add-test-utils",
        access: "private",
        args: [],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      execute: {
        name: "execute",
        access: "public",
        args: [{ name: "sender", type: "principal" }],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [sender: TypedAbiArg<string, "sender">],
        Response<boolean, bigint>
      >,
    },
    maps: {},
    variables: {
      DEPLOYER: {
        name: "DEPLOYER",
        type: "principal",
        access: "constant",
      } as TypedAbiVariable<string>,
    },
    constants: {
      DEPLOYER: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "proposal-bootstrap",
  },
  proposalTrait: {
    functions: {},
    maps: {},
    variables: {},
    constants: {},
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity1",
    contractName: "proposal-trait",
  },
  testUtils: {
    functions: {
      isDeployer: {
        name: "is-deployer",
        access: "private",
        args: [],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      nameRegister: {
        name: "name-register",
        access: "public",
        args: [
          { name: "name", type: { buffer: { length: 48 } } },
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "owner", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "uint128", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<Uint8Array, "name">,
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          owner: TypedAbiArg<string, "owner">
        ],
        Response<bigint, bigint>
      >,
      v1Register: {
        name: "v1-register",
        access: "public",
        args: [
          { name: "name", type: { buffer: { length: 48 } } },
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<Uint8Array, "name">,
          namespace: TypedAbiArg<Uint8Array, "namespace">
        ],
        Response<boolean, bigint>
      >,
      v1RegisterTransfer: {
        name: "v1-register-transfer",
        access: "public",
        args: [
          { name: "name", type: { buffer: { length: 48 } } },
          {
            name: "namespace",
            type: { buffer: { length: 20 } },
          },
          { name: "recipient", type: "principal" },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "int128" } },
        },
      } as TypedAbiFunction<
        [
          name: TypedAbiArg<Uint8Array, "name">,
          namespace: TypedAbiArg<Uint8Array, "namespace">,
          recipient: TypedAbiArg<string, "recipient">
        ],
        Response<boolean, bigint>
      >,
    },
    maps: {},
    variables: {
      ERR_UNAUTHORIZED: {
        name: "ERR_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      deployer: {
        name: "deployer",
        type: "principal",
        access: "constant",
      } as TypedAbiVariable<string>,
    },
    constants: {
      ERR_UNAUTHORIZED: {
        isOk: false,
        value: 12000n,
      },
      deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "test-utils",
  },
  wrapperMigrator: {
    functions: {
      resolveAndTransfer: {
        name: "resolve-and-transfer",
        access: "private",
        args: [{ name: "wrapper", type: "principal" }],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "lease-ending-at",
                    type: { optional: "uint128" },
                  },
                  { name: "lease-started-at", type: "uint128" },
                  { name: "name", type: { buffer: { length: 48 } } },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                  { name: "owner", type: "principal" },
                  {
                    name: "zonefile-hash",
                    type: { buffer: { length: 20 } },
                  },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [wrapper: TypedAbiArg<string, "wrapper">],
        Response<
          {
            leaseEndingAt: bigint | null;
            leaseStartedAt: bigint;
            name: Uint8Array;
            namespace: Uint8Array;
            owner: string;
            zonefileHash: Uint8Array;
          },
          bigint
        >
      >,
      setSignersIter: {
        name: "set-signers-iter",
        access: "private",
        args: [
          {
            name: "item",
            type: {
              tuple: [
                { name: "enabled", type: "bool" },
                {
                  name: "signer",
                  type: "principal",
                },
              ],
            },
          },
        ],
        outputs: { type: { buffer: { length: 20 } } },
      } as TypedAbiFunction<
        [
          item: TypedAbiArg<
            {
              enabled: boolean;
              signer: string;
            },
            "item"
          >
        ],
        Uint8Array
      >,
      isDaoOrExtension: {
        name: "is-dao-or-extension",
        access: "public",
        args: [],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<[], Response<boolean, bigint>>,
      migrate: {
        name: "migrate",
        access: "public",
        args: [
          { name: "wrapper", type: "principal" },
          {
            name: "signature",
            type: { buffer: { length: 65 } },
          },
          { name: "recipient", type: "principal" },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  { name: "id", type: "uint128" },
                  {
                    name: "lease-ending-at",
                    type: { optional: "uint128" },
                  },
                  { name: "lease-started-at", type: "uint128" },
                  { name: "name", type: { buffer: { length: 48 } } },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                  { name: "owner", type: "principal" },
                  {
                    name: "zonefile-hash",
                    type: { buffer: { length: 20 } },
                  },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          wrapper: TypedAbiArg<string, "wrapper">,
          signature: TypedAbiArg<Uint8Array, "signature">,
          recipient: TypedAbiArg<string, "recipient">
        ],
        Response<
          {
            id: bigint;
            leaseEndingAt: bigint | null;
            leaseStartedAt: bigint;
            name: Uint8Array;
            namespace: Uint8Array;
            owner: string;
            zonefileHash: Uint8Array;
          },
          bigint
        >
      >,
      setSigners: {
        name: "set-signers",
        access: "public",
        args: [
          {
            name: "signers",
            type: {
              list: {
                type: {
                  tuple: [
                    { name: "enabled", type: "bool" },
                    {
                      name: "signer",
                      type: "principal",
                    },
                  ],
                },
                length: 50,
              },
            },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                list: {
                  type: { buffer: { length: 20 } },
                  length: 50,
                },
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          signers: TypedAbiArg<
            {
              enabled: boolean;
              signer: string;
            }[],
            "signers"
          >
        ],
        Response<Uint8Array[], bigint>
      >,
      construct: {
        name: "construct",
        access: "read_only",
        args: [
          {
            name: "hash-bytes",
            type: { buffer: { length: 20 } },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: "principal",
              error: {
                tuple: [
                  { name: "error_code", type: "uint128" },
                  {
                    name: "value",
                    type: { optional: "principal" },
                  },
                ],
              },
            },
          },
        },
      } as TypedAbiFunction<
        [hashBytes: TypedAbiArg<Uint8Array, "hashBytes">],
        Response<
          string,
          {
            error_code: bigint;
            value: string | null;
          }
        >
      >,
      debugSignature: {
        name: "debug-signature",
        access: "read_only",
        args: [
          { name: "wrapper", type: "principal" },
          {
            name: "signature",
            type: { buffer: { length: 65 } },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "pubkey-hash",
                    type: { buffer: { length: 20 } },
                  },
                  { name: "signer", type: "principal" },
                  { name: "valid-signer", type: "bool" },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          wrapper: TypedAbiArg<string, "wrapper">,
          signature: TypedAbiArg<Uint8Array, "signature">
        ],
        Response<
          {
            pubkeyHash: Uint8Array;
            signer: string;
            validSigner: boolean;
          },
          bigint
        >
      >,
      getLegacyName: {
        name: "get-legacy-name",
        access: "read_only",
        args: [{ name: "account", type: "principal" }],
        outputs: {
          type: {
            response: {
              ok: {
                tuple: [
                  {
                    name: "lease-ending-at",
                    type: { optional: "uint128" },
                  },
                  { name: "lease-started-at", type: "uint128" },
                  { name: "name", type: { buffer: { length: 48 } } },
                  {
                    name: "namespace",
                    type: { buffer: { length: 20 } },
                  },
                  { name: "owner", type: "principal" },
                  {
                    name: "zonefile-hash",
                    type: { buffer: { length: 20 } },
                  },
                ],
              },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [account: TypedAbiArg<string, "account">],
        Response<
          {
            leaseEndingAt: bigint | null;
            leaseStartedAt: bigint;
            name: Uint8Array;
            namespace: Uint8Array;
            owner: string;
            zonefileHash: Uint8Array;
          },
          bigint
        >
      >,
      getNameWrapper: {
        name: "get-name-wrapper",
        access: "read_only",
        args: [{ name: "name", type: "uint128" }],
        outputs: { type: { optional: "principal" } },
      } as TypedAbiFunction<
        [name: TypedAbiArg<number | bigint, "name">],
        string | null
      >,
      getWrapperName: {
        name: "get-wrapper-name",
        access: "read_only",
        args: [{ name: "wrapper", type: "principal" }],
        outputs: { type: { optional: "uint128" } },
      } as TypedAbiFunction<
        [wrapper: TypedAbiArg<string, "wrapper">],
        bigint | null
      >,
      hashPrincipal: {
        name: "hash-principal",
        access: "read_only",
        args: [{ name: "wrapper", type: "principal" }],
        outputs: { type: { buffer: { length: 32 } } },
      } as TypedAbiFunction<
        [wrapper: TypedAbiArg<string, "wrapper">],
        Uint8Array
      >,
      isValidSigner: {
        name: "is-valid-signer",
        access: "read_only",
        args: [{ name: "signer", type: "principal" }],
        outputs: { type: "bool" },
      } as TypedAbiFunction<[signer: TypedAbiArg<string, "signer">], boolean>,
      recoverPubkeyHash: {
        name: "recover-pubkey-hash",
        access: "read_only",
        args: [
          { name: "wrapper", type: "principal" },
          {
            name: "signature",
            type: { buffer: { length: 65 } },
          },
        ],
        outputs: {
          type: {
            response: {
              ok: { buffer: { length: 20 } },
              error: "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          wrapper: TypedAbiArg<string, "wrapper">,
          signature: TypedAbiArg<Uint8Array, "signature">
        ],
        Response<Uint8Array, bigint>
      >,
      verifyWrapper: {
        name: "verify-wrapper",
        access: "read_only",
        args: [
          { name: "wrapper", type: "principal" },
          {
            name: "signature",
            type: { buffer: { length: 65 } },
          },
        ],
        outputs: {
          type: { response: { ok: "bool", error: "uint128" } },
        },
      } as TypedAbiFunction<
        [
          wrapper: TypedAbiArg<string, "wrapper">,
          signature: TypedAbiArg<Uint8Array, "signature">
        ],
        Response<boolean, bigint>
      >,
    },
    maps: {
      migratorSignersMap: {
        name: "migrator-signers-map",
        key: { buffer: { length: 20 } },
        value: "bool",
      } as TypedAbiMap<Uint8Array, boolean>,
      nameWrapperMap: {
        name: "name-wrapper-map",
        key: "uint128",
        value: "principal",
      } as TypedAbiMap<number | bigint, string>,
      wrapperNameMap: {
        name: "wrapper-name-map",
        key: "principal",
        value: "uint128",
      } as TypedAbiMap<string, bigint>,
    },
    variables: {
      ERR_INVALID_CONTRACT_NAME: {
        name: "ERR_INVALID_CONTRACT_NAME",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_NAME_TRANSFER: {
        name: "ERR_NAME_TRANSFER",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_NO_NAME: {
        name: "ERR_NO_NAME",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_RECOVER: {
        name: "ERR_RECOVER",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_UNAUTHORIZED: {
        name: "ERR_UNAUTHORIZED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_WRAPPER_USED: {
        name: "ERR_WRAPPER_USED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ROLE: {
        name: "ROLE",
        type: {
          "string-ascii": {
            length: 10,
          },
        },
        access: "constant",
      } as TypedAbiVariable<string>,
      networkAddrVersion: {
        name: "network-addr-version",
        type: {
          buffer: {
            length: 1,
          },
        },
        access: "constant",
      } as TypedAbiVariable<Uint8Array>,
      wrappedIdVar: {
        name: "wrapped-id-var",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
      wrapperDeployer: {
        name: "wrapper-deployer",
        type: {
          buffer: {
            length: 20,
          },
        },
        access: "variable",
      } as TypedAbiVariable<Uint8Array>,
    },
    constants: {
      ERR_INVALID_CONTRACT_NAME: {
        isOk: false,
        value: 6003n,
      },
      ERR_NAME_TRANSFER: {
        isOk: false,
        value: 6004n,
      },
      ERR_NO_NAME: {
        isOk: false,
        value: 6000n,
      },
      ERR_RECOVER: {
        isOk: false,
        value: 6002n,
      },
      ERR_UNAUTHORIZED: {
        isOk: false,
        value: 6001n,
      },
      ERR_WRAPPER_USED: {
        isOk: false,
        value: 6005n,
      },
      ROLE: "mig-signer",
      networkAddrVersion: Uint8Array.from([26]),
      wrappedIdVar: 0n,
      wrapperDeployer: Uint8Array.from([
        109, 120, 222, 123, 6, 37, 223, 191, 193, 108, 58, 138, 87, 53, 246,
        220, 61, 195, 242, 206,
      ]),
    },
    non_fungible_tokens: [],
    fungible_tokens: [],
    clarity_version: "Clarity2",
    contractName: "wrapper-migrator",
  },
} as const;

export const accounts = {
  deployer: {
    address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    balance: 100000000000000,
  },
  faucet: {
    address: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
    balance: 100000000000000,
  },
  wallet_1: {
    address: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
    balance: 100000000000000,
  },
  wallet_2: {
    address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    balance: 100000000000000,
  },
  wallet_3: {
    address: "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC",
    balance: 100000000000000,
  },
  wallet_4: {
    address: "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND",
    balance: 100000000000000,
  },
  wallet_5: {
    address: "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB",
    balance: 100000000000000,
  },
  wallet_6: {
    address: "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0",
    balance: 100000000000000,
  },
  wallet_7: {
    address: "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ",
    balance: 100000000000000,
  },
  wallet_8: {
    address: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
    balance: 100000000000000,
  },
} as const;

export const simnet = {
  accounts,
  contracts,
} as const;
