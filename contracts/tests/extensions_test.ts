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
import { assert, txOk } from "../deps.ts";
import { allNamespacesRaw, registerNameV1 } from "./bns-helpers.ts";

const extensions = contracts.bnsxExtensions;
const bootstrap = contracts.proposalBootstrap;

describe("bnsx-extensions", () => {
  const { chain } = deployWithNamespace();

  it("proposal-bootstrap is executed", () => {
    const executedAt = chain.rov(extensions.executedAt(bootstrap.identifier));
    assert(executedAt !== null);
  });

  it("deployer can set extension manually", () => {
    const fakePrincipal = `${deployer}.fake`;
    const receipt = chain.txOk(
      extensions.setExtensions([{ extension: fakePrincipal, enabled: true }]),
      deployer
    );

    assertEquals(chain.rov(extensions.isExtension(fakePrincipal)), true);
  });

  it("can execute additional proposal", () => {
    const proposal = contracts.proposal2.identifier;

    chain.txOk(extensions.execute(proposal, deployer), deployer);

    assertEquals(chain.rov(extensions.isExtension(deployer)), false);
  });
});
