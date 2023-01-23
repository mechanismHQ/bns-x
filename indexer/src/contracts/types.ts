import { OkType, TypedAbiFunction, Jsonize, TypedAbiArg } from "@clarigen/core";
import { contracts } from "./clarigen";

// Helper type for inferring the return type of a function. Like `ReturnType`,
// but for Clarigen types
export type FunctionReturnType<T> = T extends TypedAbiFunction<
  TypedAbiArg<unknown, string>[],
  infer R
>
  ? R
  : never;

export type Registry = typeof contracts["nameRegistry"]["functions"];
export type QueryHelper = typeof contracts["queryHelper"]["functions"];

export type NameProperties = NonNullable<
  FunctionReturnType<Registry["getNameProperties"]>
>;

export type QueryHelperResponse = FunctionReturnType<QueryHelper["getNames"]>;

export type QueryHelperLegacyName = Jsonize<
  NonNullable<QueryHelperResponse["legacy"]>
>;
export type QueryHelperName = Jsonize<QueryHelperResponse["names"][number]> & {
  legacy: Jsonize<NonNullable<QueryHelperResponse["names"][number]["legacy"]>>;
};
