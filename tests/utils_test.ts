import {
  describe,
  testUtils,
  it,
  deployWithNamespace,
  deployer,
  deploy,
  asciiToBytes,
} from "./helpers.ts";

describe("test utils", () => {
  const { chain } = deployWithNamespace();

  it("can register and transfer", () => {
    // chain.txOk(testUtils.v1RegisterTransfer({
    //   name: asciiToBytes('asdf'),
    //   namespace:
    // }))
  });
});
