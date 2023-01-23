import {
  beforeAll,
  deployWithNamespace,
  describe,
  it,
  assertEquals,
  asciiToBytes,
  alice,
  utilsRegisterBtc,
  deployer,
  bytesToAscii,
  bob,
  bns,
  registry,
} from "./helpers.ts";
import { btcBytes } from "./mocks.ts";
import { contracts, testUtils } from "./clarigen.ts";
import { txOk } from "../deps.ts";
import { allNamespacesRaw, registerNameV1 } from "./bns-helpers.ts";

const query = contracts.queryHelper;

const MAX_QUERY = Number(query.constants.MAX_NAMES_QUERY);

describe("query helper", () => {
  const { chain } = deployWithNamespace();

  function getNames(account: string) {
    return chain.rov(query.getNames(account));
  }

  const v1Name = {
    namespace: btcBytes,
    name: asciiToBytes("alice"),
  };

  it("returns empty with no names", () => {
    const { names } = chain.rov(query.crawlNames(alice));
    assertEquals(names.length, 0);
  });

  it("with alice having one name", () => {
    utilsRegisterBtc({
      chain,
      owner: alice,
      name: `name-0`,
    });
    const { names } = chain.rov(query.crawlNames(alice));
    assertEquals(names.length, 1);
    assertEquals(names[0].name, asciiToBytes("name-0"));
  });

  describe("querying legacy names", () => {
    it("returns none if no v1 name", () => {
      const name = chain.rov(query.getLegacyName(alice));
      assertEquals(name, null);
    });

    it("returns name if present", () => {
      registerNameV1({
        name: "alice",
        namespace: "btc",
        owner: alice,
        chain,
      });

      const name = chain.rov(query.getLegacyName(alice))!;
      assertEquals(name.name, v1Name.name);
      assertEquals(name.namespace, v1Name.namespace);
      assertEquals(name.owner, alice);
    });
  });

  it("can return both combined", () => {
    const all = chain.rov(query.getNames(alice));
    assertEquals(all.legacy?.name, v1Name.name);
    assertEquals(all.legacy?.namespace, v1Name.namespace);
    assertEquals(all.names.length, 1);
    assertEquals(all.names[0].name, asciiToBytes("name-0"));
  });

  describe("with many names", () => {
    const newNames = MAX_QUERY + 5;
    beforeAll(() => {
      const names: string[] = [];
      for (let i = 0; i < newNames; i++) {
        const name = `name-${i + 1}`;
        names.push(name);
      }

      chain.mineBlock(
        ...names.map((n) => {
          return txOk(
            testUtils.nameRegister({
              name: asciiToBytes(n),
              namespace: btcBytes,
              owner: alice,
            }),
            deployer
          );
        })
      );
    });

    it("returns full list of names", () => {
      const { names } = chain.rov(query.crawlNames(alice));
      assertEquals(names.length, MAX_QUERY);
      assertEquals(names, chain.rov(query.getNames(alice)).names);
    });

    it("names are in correct order", () => {
      const { names } = chain.rov(query.getNames(alice));
      names.forEach((n, i) => {
        const name = bytesToAscii(n.name);
        assertEquals(name, `name-${i}`);
      });
    });
  });

  describe("with wrapped names", () => {
    const namesToRegister = MAX_QUERY + 5;

    // register on v1, transfer to a fake "wrapper",
    // and register the same on bnsx
    beforeAll(() => {
      for (let i = 0; i < namesToRegister; i++) {
        // register on v1
        registerNameV1({
          name: `bob-${i}`,
          owner: bob,
          chain,
        });
        // transfer
        chain.mineBlock(
          txOk(
            bns.nameTransfer({
              name: asciiToBytes(`bob-${i}`),
              namespace: btcBytes,
              newOwner: `${deployer}.wrapper-${i}`,
              zonefileHash: null,
            }),
            bob
          ),
          txOk(
            testUtils.nameRegister({
              name: asciiToBytes(`bob-${i}`),
              namespace: btcBytes,
              owner: bob,
            }),
            deployer
          )
        );
      }
    });

    // to make sure test setup correctly
    it("bob doesnt own any legacy", () => {
      assertEquals(chain.rov(query.getLegacyName(bob)), null);
    });

    it("crawling names returns legacy info", () => {
      const { names } = chain.rov(query.crawlNames(bob));
      assertEquals(names.length, MAX_QUERY);

      names.forEach((name, i) => {
        const legacy = name.legacy;
        if (legacy === null) {
          throw new Error("Invalid state - expected legacy");
        }
        assertEquals(legacy.owner, `${deployer}.wrapper-${i}`);
        const v1Info = chain.rovOk(bns.nameResolve(name.namespace, name.name));
        assertEquals(v1Info, legacy);
      });
    });

    it("can crawl forward from a name", () => {
      const page = chain.rov(query.crawlNames(bob));
      const lastName = page.names[page.names.length - 1];
      const lastId = page.nextId;
      assertEquals(lastId, chain.rov(registry.getNextNodeId(lastName.id)));
      if (lastId === null) {
        throw new Error("Invalid state - expected more names");
      }
      const { names } = chain.rov(query.crawlFromId(lastId));
      assertEquals(names.length, 5);
    });
  });
});
