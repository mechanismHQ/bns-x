// import { types } from "https://deno.land/x/clarinet@v1.0.3/index.ts";
// import { allNamespacesRaw } from "./bns-helpers.ts";
// import { valueToCV } from "./helpers.ts";
// import { ClarityAbiTypeList, contracts } from "../artifacts/clarigen.ts";
// import { cvToValue } from "../../../clarigen/deno-clarigen/mod.ts";

// type NamespaceProps = typeof allNamespacesRaw[number];

// const setNamespaceFn = contracts.legacyNamespace.functions.setNamespaces;
// const setNamespaceListArg = setNamespaceFn.args[0].type as ClarityAbiTypeList;
// console.log(setNamespaceListArg);
// const namespaceArg = setNamespaceListArg.list.type;

// function nsToSetterObj(nsProps: NamespaceProps) {
//   const nsObj = {
//     namespace: nsProps.namespace,
//     props: {
//       priceFunction: nsProps.properties.priceFunction,
//       lifetime: nsProps.properties.lifetime,
//       enabled: true,
//     },
//   };
//   return nsObj;
// }

// function makeNsList() {
//   const list = allNamespacesRaw.map(nsToSetterObj);
//   return valueToCV(list, setNamespaceListArg);
// }

// console.log(makeNsList());
// // console.log(nsToCV(allNamespacesRaw[0]));
