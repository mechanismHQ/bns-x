import {
  describe,
  it,
  registry,
  alice,
  charlie,
  deployer,
  deployWithNamespace,
  asciiToBytes,
  assertEquals,
  bob,
  beforeAll,
  nftAsset,
  types,
} from "./helpers.ts";
import { ContractCallTyped, UnknownArgs, Response, Chain } from "../deps.ts";
import { testUtils } from "./clarigen.ts";
import { btcBytes } from "./mocks.ts";

const demoNs = asciiToBytes("demo");
const namespace = demoNs;
const manager = charlie;

describe("managed namespaces", () => {
  const { chain } = deployWithNamespace();

  function expectTxErr(
    tx: ContractCallTyped<UnknownArgs, Response<any, bigint>>,
    sender: string = manager
  ) {
    const receipt = chain.txErr(tx, sender);
    assertEquals(receipt.value, registry.constants.ERR_UNAUTHORIZED.value);
  }

  let aliceId: bigint;

  beforeAll(() => {
    const receipt = chain.txOk(
      testUtils.nameRegister({
        name: asciiToBytes("alice"),
        namespace,
        owner: alice,
      }),
      deployer
    );
    aliceId = receipt.value;
  });

  describe("no manager set", () => {
    it("manager is not set", () => {
      const isManager = chain.rov(registry.isNamespaceManager(demoNs, manager));
      assertEquals(isManager, false);
    });

    it("blocks namespace actions by manager", () => {
      expectTxErr(
        registry.register({
          name: {
            name: asciiToBytes("asdf"),
            namespace,
          },
          owner: bob,
        })
      );

      expectTxErr(registry.mngBurn(aliceId));

      expectTxErr(
        registry.mngTransfer({
          id: aliceId,
          recipient: charlie,
        })
      );

      expectTxErr(
        registry.setNamespaceManager({
          namespace,
          manager: alice,
          enabled: true,
        })
      );

      expectTxErr(
        registry.setNamespaceTransfersAllowed({
          namespace,
          enabled: false,
        })
      );
    });
  });

  it("only dao can set manager first", () => {
    chain.txOk(
      registry.setNamespaceManager({
        namespace,
        manager,
        enabled: true,
      }),
      deployer
    );

    assertEquals(
      chain.rov(
        registry.isNamespaceManager({
          namespace,
          manager,
        })
      ),
      true
    );
  });

  it("manager cannot remove dao permission", () => {
    expectTxErr(registry.removeDaoNamespaceManager(namespace));
  });

  it("only dao can set token-uri", () => {
    const uri = "https://example.com";
    expectTxErr(registry.daoSetTokenUri(uri));

    chain.txOk(registry.daoSetTokenUri(uri), deployer);

    assertEquals(chain.rovOk(registry.getTokenUri()), uri);
  });

  describe("with manager set", () => {
    it("cant access other namespaces", () => {
      expectTxErr(
        registry.register({
          name: {
            name: asciiToBytes("asdf3"),
            namespace: btcBytes,
          },
          owner: alice,
        })
      );

      assertEquals(
        chain.rov(registry.isNamespaceManager(btcBytes, manager)),
        false
      );
    });

    let managerNameId: bigint;

    it("can register names", () => {
      const { value } = chain.txOk(
        registry.register({
          name: {
            name: asciiToBytes("manager"),
            namespace,
          },
          owner: alice,
        }),
        manager
      );
      managerNameId = value;
    });

    it("can transfer names", () => {
      chain.txOk(registry.mngTransfer(aliceId, bob), manager);
    });

    it("can burn names", () => {
      const receipt = chain.txOk(registry.mngBurn(managerNameId), manager);

      receipt.events.expectNonFungibleTokenBurnEvent(
        `u${managerNameId}`,
        alice,
        registry.identifier,
        nftAsset
      );
      receipt.events.expectPrintEvent(
        registry.identifier,
        `{id: u${managerNameId}, topic: "burn"}`
      );
    });

    it("can set new managers", () => {
      chain.txOk(
        registry.setNamespaceManager({
          namespace,
          manager: alice,
          enabled: true,
        }),
        manager
      );
    });

    it("can update transfers allowed", () => {
      chain.txOk(
        registry.setNamespaceTransfersAllowed({
          namespace,
          enabled: true,
        }),
        manager
      );
    });
  });

  describe("after revoking dao permissions", () => {
    it("dao is marked as removed", () => {
      chain.txOk(registry.removeDaoNamespaceManager(namespace), deployer);

      assertEquals(chain.rov(registry.canDaoManageNs(namespace)), false);
    });

    it("dao cannot make namespace actions", () => {
      expectTxErr(
        registry.register({
          name: {
            name: asciiToBytes("blah2"),
            namespace,
          },
          owner: alice,
        }),
        deployer
      );

      expectTxErr(registry.mngTransfer(aliceId, deployer), deployer);

      expectTxErr(registry.mngBurn(aliceId), deployer);

      expectTxErr(
        registry.setNamespaceManager({
          namespace,
          enabled: false,
          manager,
        }),
        deployer
      );

      expectTxErr(
        registry.setNamespaceTransfersAllowed(namespace, true),
        deployer
      );
    });
  });
});
