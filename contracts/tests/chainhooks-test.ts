import { assertArrayIncludes } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { registerNameV1 } from './bns-helpers.ts';
import {
  deployWithNamespace,
  describe,
  it,
  contracts,
  accounts,
  testUtils,
  alice,
  utilsRegisterBtc,
  assertEquals,
  deployer,
  signatureVrsToRsv,
  registry,
  bob,
} from './helpers.ts';
import { alicePubkeyHash, btcBytes, signedContracts } from './mocks.ts';
import { Account, Name, Wrapper } from './prisma-types.ts';

const server = 'http://localhost:3003';
async function apiFetch(path: string) {
  const res = await fetch(`${server}${path}`);
  return res.json();
}

async function fetchAll() {
  const data = await apiFetch(`/all`);
  console.log(data);
  return data as {
    users: (Account & {
      names: Name[];
      primaryName: Name;
    })[];
  };
}

async function fetchName(name: string, namespace: string) {
  const data = await apiFetch(`/names/${name}/${namespace}`);
  return data as {
    name: Name & {
      owner: Account;
      primaryOwner?: Account;
      wrapper: Wrapper;
    };
  };
}

async function fetchAccount(account: string) {
  const data = await apiFetch(`/accounts/${account}`);
  return data as {
    account: Account & {
      names: Name[];
      primaryName: Name;
    };
  };
}

function sleep(secs: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, secs * 1000);
  });
}

describe('chainhook tests', () => {
  const { chain } = deployWithNamespace();
  const migrator = contracts.wrapperMigrator;

  it('registers a name', () => {
    utilsRegisterBtc({
      name: 'alice',
      owner: alice,
      chain,
    });
  });

  it('is saved in db', async () => {
    const { users } = await fetchAll();
    const [user] = users;
    assertEquals(user.principal, alice);
    assertEquals(user.names[0].nftId, 0);

    console.log(users);
  });

  it('works with wrapper migrations', async () => {
    chain.txOk(
      migrator.setSigners([
        {
          signer: alicePubkeyHash,
          enabled: true,
        },
      ]),
      deployer
    );

    const wrapper = signedContracts[0];

    registerNameV1({
      chain,
      owner: alice,
      name: 'alice2',
    });

    chain.txOk(
      migrator.migrate({
        recipient: alice,
        wrapper: wrapper.id,
        signature: signatureVrsToRsv(wrapper.signature),
      }),
      alice
    );

    const { account } = await fetchAccount(alice);
    assertEquals(account.names.length, 2);
    const ids = account.names.map(n => n.nftId);
    assertArrayIncludes(ids, [1, 0]);
    assertEquals(account.primaryNameId, 0);
    await sleep(5);

    const { name } = await fetchName('alice2', 'btc');
    console.log('name', name);
    assertEquals(name.nftId, 1);
    assertEquals(name.primaryOwner, null);
    assertEquals(name.wrapper.principal, wrapper.id);
  });

  it('works with transfers', async () => {
    chain.txOk(
      registry.transfer({
        sender: alice,
        recipient: bob,
        id: 1n,
      }),
      alice
    );

    await sleep(3);

    const { account } = await fetchAccount(bob);
    assertEquals(account.names, [1]);
  });
});
