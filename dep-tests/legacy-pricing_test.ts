import {
  randomName,
  allNamespacesRaw,
  randomNamespace,
} from "./bns-helpers.ts";
import {
  asciiToBytes,
  assertEquals,
  bytesToAscii,
  deployWithNamespace,
  describe,
  it,
} from "./helpers.ts";

describe("price functions", () => {
  const { accounts, chain, contracts } = deployWithNamespace();
  const bns = contracts.bnsV1;
  const legacy = contracts.legacyNamespace;

  describe("getting metadata for a name", () => {
    function testNameVsV1(nameStr: string) {
      const name = asciiToBytes(nameStr);
      const nameInfo = chain.rov(legacy.getNamePriceMeta(name));
      assertEquals(
        chain.rov(bns.hasNonalphaChars(name)),
        nameInfo.hasNonalpha,
        `Expected hasAlpha match for ${nameStr}`
      );
      assertEquals(
        chain.rov(bns.hasVowelsChars(name)),
        nameInfo.hasVowels,
        `Expected hasAlpha match for ${nameStr}`
      );
      assertEquals(
        chain.rov(bns.hasInvalidChars(name)),
        nameInfo.invalid,
        `Expected invalid match for ${nameStr}`
      );
    }

    it("testing name validation vs v1 with random names", () => {
      const tests = 10;
      for (let i = 0; i < tests; i++) {
        const name = randomName();
        testNameVsV1(name);
      }
    });

    it("testing invalid names vs v1 with random names", () => {
      const tests = 10;
      for (let i = 0; i < tests; i++) {
        const name = randomName({ allowInvalid: true });
        testNameVsV1(name);
      }
    });

    it("can get name info correctly", () => {
      const name = asciiToBytes("flckr");
      const nameInfo = chain.rov(legacy.getNamePriceMeta(name));
      assertEquals(chain.rov(bns.hasNonalphaChars(name)), nameInfo.hasNonalpha);
      assertEquals(chain.rov(bns.hasVowelsChars(name)), nameInfo.hasVowels);
      assertEquals(chain.rov(bns.hasInvalidChars(name)), nameInfo.invalid);
    });
  });

  describe("getting name prices for random names vs v1", () => {
    it("has all namespaces on v1", () => {
      allNamespacesRaw.forEach((ns) => {
        const res = chain.rov(bns.getNamespaceProperties(ns.namespace));
        if (!res.isOk) {
          throw new Error(`No NS for ${bytesToAscii(ns.namespace)}`);
        }
      });
    });
    function testRandomNamePrice() {
      const ns = randomNamespace();
      const pf = ns.properties.priceFunction;
      const priceFunction = {
        buckets: [...pf.buckets],
        coeff: pf.coeff,
        base: pf.base,
        nonalphaDiscount: pf.nonalphaDiscount,
        noVowelDiscount: pf.noVowelDiscount,
      };

      const name = randomName();
      const nameBytes = asciiToBytes(name);
      const v1Price = chain.rov(
        bns.computeNamePrice({
          name: nameBytes,
          priceFunction,
        })
      );
      const v2Price = chain.rov(
        legacy.computeNamePrice({
          name: nameBytes,
          priceFn: priceFunction,
        })
      );
      assertEquals(v2Price, v1Price);

      assertEquals(
        chain.rov(legacy.getNamePrice(nameBytes, ns.namespace)),
        chain.rov(bns.getNamePrice(ns.namespace, nameBytes))
      );
    }
    it("has the same price", () => {
      const tests = 10;
      for (let i = 0; i < tests; i++) {
        testRandomNamePrice();
      }
    });
  });
});
