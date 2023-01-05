import {
  deployWithNamespace,
  describe,
  it,
  assertEquals,
  asciiToBytes,
  hashSalt,
  ASCII_ENCODING,
  nftAsset,
  alice,
  bob,
  charlie,
  utilsRegisterBtc,
  deployer,
  utils,
  btcBytes,
} from "./helpers.ts";

describe("name registry", () => {
  const { chain, contracts, accounts } = deployWithNamespace();
  const contract = contracts.nameRegistry;

  function registerName(name: string, owner: string) {
    const exp = chain.blockHeight + 1000;
    const receipt = utilsRegisterBtc({ name, owner, expiresAt: exp, chain });
    return receipt.value;
  }

  function getNames(account: string) {
    const first = chain.rov(contract.getPrimaryNameProperties(account));
    if (first === null) return [];
    return traverse([first.id]);
  }

  function traverse(nodes: bigint[]): bigint[] {
    const node = nodes[nodes.length - 1];
    const next = chain.rov(contract.getNextNodeId(node));
    if (next === null) return nodes;
    // const next = getNext(node)!;
    return traverse([...nodes, next]);
  }

  describe("transfers", () => {
    let aliceId: bigint;
    const aliceName = {
      name: asciiToBytes("alice"),
      namespace: btcBytes,
      // encoding: ASCII_ENCODING,
    };
    it("alice transfers to bob", () => {
      const id = registerName("alice", alice);
      aliceId = id;

      assertEquals(chain.rov(contract.getBalance(alice)), 1n);
      assertEquals(chain.rov(contract.getBalance(bob)), 0n);
      chain.txOk(
        contract.transfer({
          id,
          sender: alice,
          recipient: bob,
        }),
        alice
      );
      assertEquals(chain.rov(contract.getBalance(alice)), 0n);
      assertEquals(chain.rov(contract.getBalance(bob)), 1n);
    });

    it("alice doesnt have a primary name anymore", () => {
      assertEquals(chain.rov(contract.getPrimaryName(alice)), null);
    });

    it("name is registered to bob now", () => {
      assertEquals(chain.rovOk(contract.getOwner(aliceId)), bob);

      const props = chain.rov(contract.getNameProperties(aliceName));
      assertEquals(props?.owner, bob);
      assertEquals(props?.id, aliceId);
    });

    it("set as bobs primary name", () => {
      assertEquals(chain.rov(contract.getPrimaryName(bob)), aliceName);

      const props = chain.rov(contract.getNamePropertiesById(aliceId));
      assertEquals(chain.rov(contract.getPrimaryNameProperties(bob)), props);
    });
  });

  it("bob adds second name", () => {
    const id = registerName("bob", bob);
    assertEquals(id, 1n);
  });

  it("bob transfers primary name", () => {
    chain.txOk(
      contract.transfer({
        id: 0n,
        sender: bob,
        recipient: charlie,
      }),
      bob
    );
  });

  it("bobs primary name is set to his second name", () => {
    const primary = chain.rov(contract.getPrimaryName(bob));
    assertEquals(primary?.name, asciiToBytes("bob"));
  });

  describe("updating primary name", () => {
    it("charlie registers a second name", () => {
      assertEquals(registerName("charlie", charlie), 2n);
    });

    it("cannot set primary if you dont own it", () => {
      const receipt = chain.txErr(contract.setPrimaryName(0n), bob);
      assertEquals(receipt.value, 4000n);
      assertEquals(
        chain.txErr(contract.setPrimaryName(0n), alice).value,
        4000n
      );
    });

    it("cannot set primary to the same as current primary", () => {
      const receipt = chain.txErr(contract.setPrimaryName(0n), charlie);
      assertEquals(receipt.value, 4002n);
    });

    it("charlie updates primary name", () => {
      const receipt = chain.txOk(contract.setPrimaryName(2n), charlie);

      const primary = chain.rov(contract.getPrimaryName(charlie));
      assertEquals(primary?.name, asciiToBytes("charlie"));
    });

    it('works if you update a "middle" fallback', () => {
      const { value: newId } = utilsRegisterBtc({
        name: "fallback2",
        owner: charlie,
        expiresAt: null,
        chain,
      });

      chain.txOk(contract.setPrimaryName(0n), charlie);

      assertEquals(
        chain.rov(contract.getPrimaryNameProperties(charlie))?.id,
        0n
      );

      assertEquals(getNames(charlie), [0n, 2n, newId]);
    });
  });

  describe("expirations", () => {
    const name = "abc";
    let id: bigint;
    let start: number;
    const lifetime = 3;

    it("abc.btc expires soon", () => {
      start = chain.blockHeight;
      const receipt = utilsRegisterBtc({
        name,
        owner: alice,
        expiresAt: start + lifetime,
        chain,
      });
      id = receipt.value;

      const expiry = chain.rov(contract.getNamePropertiesById(id))!.expiresAt;
      assertEquals(expiry, BigInt(start + lifetime));
    });

    it("doesn't return expired yet", () => {
      const info = chain.rov(contract.getNamePropertiesById(id));
      assertEquals(info?.isExpired, false);

      const expired = chain.rovOk(contract.isExpired(id));
      assertEquals(expired, false);
    });

    it("cant be registered before expired", () => {
      const receipt = chain.txErr(
        utils.nameRegister({
          name: asciiToBytes(name),
          namespace: btcBytes,
          owner: charlie,
          expiresAt: null,
        }),
        deployer
      );

      assertEquals(receipt.value, 4001n);
    });

    it("after expiration, returns expired", () => {
      chain.mineEmptyBlock(lifetime);
      assertEquals(chain.rovOk(contract.isExpired(id)), true);
      const info = chain.rov(contract.getNamePropertiesById(id))!;
      assertEquals(
        chain.rov(contract.isExpiredFromExpiry(info.expiresAt)),
        true
      );
      assertEquals(
        chain.rov(contract.getNamePropertiesById(id))!.isExpired,
        true
      );
    });

    it("after expiration, prevents transfer", () => {
      const receipt = chain.txErr(
        contract.transfer({
          sender: alice,
          recipient: charlie,
          id,
        }),
        alice
      );
      assertEquals(receipt.value, 4004n);
    });

    it("after expiration, cannot set as primary", () => {
      const receipt = chain.txErr(contract.setPrimaryName(id), alice);
      assertEquals(receipt.value, 4004n);
    });

    it("after expiration, anyone can register it", () => {
      const receipt = utilsRegisterBtc({
        name,
        owner: charlie,
        chain,
        expiresAt: null,
      });

      assertEquals(receipt.value, id);
      const props = chain.rov(contract.getNamePropertiesById(id))!;
      assertEquals(props.owner, charlie);
      assertEquals(props.expiresAt, null);
      assertEquals(props.registeredAt, BigInt(chain.blockHeight - 1));
      const nameProps = chain.rov(
        contract.getNameProperties({
          name: asciiToBytes(name),
          namespace: btcBytes,
        })
      )!;
      assertEquals(nameProps, props);
      assertEquals(nameProps.encoding, ASCII_ENCODING);

      assertEquals(chain.rov(contract.getPrimaryName(alice)), null);
    });

    it("is never expired if expires-at is none", () => {
      const receipt = utilsRegisterBtc({
        name: "dolphino",
        owner: charlie,
        expiresAt: null,
        chain,
      });
      const id = receipt.value;

      const { expiresAt } = chain.rov(contract.getNamePropertiesById(id))!;
      assertEquals(expiresAt, null);

      assertEquals(chain.rov(contract.isExpiredFromExpiry(null)), false);
    });
  });

  describe("helpers", () => {
    it("errors when id not found", () => {
      const fakeId = 1234567n;
      const invalidIdErr = 4003n;

      function assertError(value: bigint) {
        assertEquals(value, invalidIdErr);
      }
      assertError(chain.rovErr(contract.isExpired(fakeId)));

      assertEquals(
        chain.txErr(contract.setPrimaryName(fakeId), alice).value,
        invalidIdErr
      );

      assertEquals(chain.rov(contract.getNamePropertiesById(fakeId)), null);
    });

    it("none returned for invalid name", () => {
      assertEquals(
        chain.rov(
          contract.getNameProperties({
            name: asciiToBytes("asdfsdf"),
            namespace: btcBytes,
          })
        ),
        null
      );
    });

    it("none for primary name when account has none", () => {
      const primary = chain.rov(contract.getPrimaryNameProperties(deployer));
      assertEquals(primary, null);
      assertEquals(chain.rov(contract.getPrimaryName(deployer)), null);
    });
  });
});

describe("namespace owners", () => {
  const { chain, contracts, accounts } = deployWithNamespace();
  const contract = contracts.nameRegistry;
  const namespaceManagerRole = contract.constants.NAMESPACE_MANAGER_ROLE;

  it("defaults to no owner", () => {
    const owner = chain.rov(contract.getNamespaceOwner(btcBytes));
    assertEquals(owner, null);
  });

  it("cannot update owner without role", () => {
    const receipt = chain.txErr(
      contract.setNamespaceOwner({
        owner: alice,
        namespace: btcBytes,
      }),
      alice
    );
    assertEquals(receipt.value, 4000n);
  });

  it('extension with "namespaces" role can ', () => {
    chain.txOk(
      contracts.executorDao.setExtensionRoles([
        {
          extension: alice,
          role: namespaceManagerRole,
          enabled: true,
        },
      ]),
      deployer
    );
  });
});
