import {
  asciiToBytes,
  deployWithNamespace,
  describe,
  it,
  btcNamespace,
  btcBytes,
} from "./helpers.ts";

describe("pricing names", () => {
  const { bns, chain } = deployWithNamespace();
  it("matching JS price fn to clarity", () => {
    const ns = chain.rovOk(bns.getNamespaceProperties(btcBytes));
    const {
      properties: { priceFunction },
    } = ns;
    console.log(priceFunction);
    const name = "s";
    const clarityPrice = chain.rovOk(
      bns.getNamePrice({
        name: asciiToBytes(name),
        namespace: btcBytes,
      })
    );
    console.log("clarityPrice", clarityPrice);
  });
});
