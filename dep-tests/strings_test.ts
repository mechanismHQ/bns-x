import { deploy, describe, it, txOk, factory, simnet } from "./helpers.ts";

interface Name {
  name: Uint8Array;
  namespace: Uint8Array;
  encoding: Uint8Array;
}

function makeName(name: string): Name {
  const [n, ns] = name.split(".");
  return {
    name: new TextEncoder().encode(n),
    namespace: new TextEncoder().encode(ns),
    encoding: new Uint8Array([0]),
  };
}

const names = [
  makeName("example.btc"),
  makeName("🟢🟢🟢.asdfasdfdsa"),
  makeName("🟢🟢🟢.btc"),
  makeName("🟢.btc"),
  makeName("thisverylongnameisverylong.verylongnamespaceyes"),
];

const serialized = names.map((n) => {
  const separator = new Uint8Array([0]);
  return new Uint8Array([
    ...n.name,
    ...separator,
    ...n.namespace,
    ...separator,
    ...n.encoding,
  ]);
});

const {
  contracts: { strings: contract },
  test,
} = factory(simnet);

// test({
//   name: "names with tuple",
//   fn(chain, accounts) {
//     const deployer = accounts.addr("deployer");
//     const writes = names.map((n) => {
//       return txOk(
//         contract.addName({
//           name: n,
//           owner: deployer,
//         }),
//         deployer
//       );
//     });
//     chain.mineBlock(...writes);

//     names.map((n) => {
//       chain.rov(contract.getOwner(n));
//     });
//   },
// });

// test({
//   name: "names serialized",
//   fn(chain, accounts) {
//     const deployer = accounts.addr("deployer");
//     const writes = serialized.map((n) => {
//       return txOk(
//         contract.addSerialized({
//           name: n,
//           owner: deployer,
//         }),
//         deployer
//       );
//     });
//     chain.mineBlock(...writes);
//     // console.log(chain.blockHeight);

//     serialized.map((n) => {
//       chain.rov(contract.getSerialized(n));
//       // console.log(new TextDecoder().decode(n));
//     });
//   },
// });

test({
  name: "serializing names",
  fn(chain) {
    names.forEach((name) => {
      const serialized = chain.rov(contract.encodeName(name));
      console.log(serialized);
      console.log(name.namespace.length);
      // console.log(new TextDecoder().decode(serialized.slice(0, 8)));
      const decoded = chain.rovOk(contract.decodeName(serialized));
      console.log(decoded);
      console.log("---");
      console.log(new TextDecoder().decode(decoded.name));
      console.log(new TextDecoder().decode(decoded.namespace));
    });
  },
});

describe("costs associated with name storage", () => {
  const { chain, contracts, accounts } = deploy();
  const contract = contracts.strings;
  const deployer = accounts.addr("deployer");

  it("names with tuple", () => {
    const writes = names.map((n) => {
      return txOk(
        contract.addName({
          name: n,
          owner: deployer,
        }),
        deployer
      );
    });
    const fulls = names.map((n) => {
      return txOk(
        contract.plainFull({
          name: n,
          owner: deployer,
        }),
        deployer
      );
    });
    chain.mineBlock(...[...writes, ...fulls]);

    chain.mineBlock(
      ...names.map((n) => {
        return txOk(
          contract.encodedFull({
            ...n,
            owner: deployer,
          }),
          deployer
        );
      })
    );

    chain.mineBlock(
      ...names.map((n) => {
        return txOk(
          contract.consensusFull({
            ...n,
            owner: deployer,
          }),
          deployer
        );
      })
    );

    names.map((n) => {
      chain.rov(contract.getOwner(n));
    });
  });

  it("names serialized", () => {
    const writes = serialized.map((n) => {
      return txOk(
        contract.addSerialized({
          name: n,
          owner: deployer,
        }),
        deployer
      );
    });
    chain.mineBlock(...writes);
    console.log(chain.blockHeight);

    serialized.map((n) => {
      console.log(chain.rov(contract.getSerialized(n)));
    });
  });

  it("consensus encoding", () => {
    const encoded = names.map((n) => {
      return chain.rov(contract.consensusEncode(n));
    });
    encoded.forEach((e) => {
      chain.rov(contract.consensusDecode(e));
    });
  });
});
