import {
  assert,
  assertExists,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import {
  ContractCallTyped,
  hexToBytes,
} from "../../../clarigen/deno-clarigen/mod.ts";
import { registerNameV1 } from "./bns-helpers.ts";
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
  deploy,
} from "./helpers.ts";
import { btcBytes } from "./mocks.ts";

describe("linked list", () => {
  const { chain, contracts } = deploy();
  const list = contracts.linkedList;

  function getFirst() {
    return chain.rov(list.getFirst(alice));
  }
  function getLast() {
    return chain.rov(list.getLast(alice));
  }
  function getPrev(id: bigint) {
    return chain.rov(list.getPrev(id));
  }
  function getNext(id: bigint) {
    return chain.rov(list.getNext(id));
  }

  function getList() {
    const first = getFirst();
    if (first === null) return [];
    const last = getLast()!;
    return traverse([first], last);
  }

  function traverse(nodes: bigint[], last: bigint): bigint[] {
    const node = nodes[nodes.length - 1];
    if (node === last) return nodes;
    const next = getNext(node)!;
    return traverse([...nodes, next], last);
  }

  it("first insertion", () => {
    const { value: id } = chain.txOk(list.addNode(alice), alice);
    assertEquals(id, 0n);
    assertEquals(getFirst(), 0n);
    assertEquals(getLast(), 0n);
    assertEquals(getPrev(id), null);
    assertEquals(getNext(id), null);
  });

  it("second insertion", () => {
    chain.txOk(list.addNode(alice), alice);
    assertEquals(getFirst(), 0n);
    assertEquals(getLast(), 1n);

    assertEquals(getPrev(0n), null);
    assertEquals(getNext(1n), null);

    assertEquals(getNext(0n), 1n);
    assertEquals(getPrev(1n), 0n);

    assertEquals(getList(), [0n, 1n]);
  });

  it("remove first", () => {
    chain.txOk(list.removeNode(alice, 0n), alice);

    assertEquals(getList(), [1n]);
    assertEquals(getFirst(), 1n);
    assertEquals(getLast(), 1n);
    assertEquals(getPrev(1n), null);
  });

  it("add two more", () => {
    chain.txOk(list.addNode(alice), alice);
    chain.txOk(list.addNode(alice), alice);
    assertEquals(getList(), [1n, 2n, 3n]);
  });

  it("remove middle element", () => {
    chain.txOk(list.removeNode(alice, 2n), alice);
    assertEquals(getList(), [1n, 3n]);
  });

  it("remove last", () => {
    chain.txOk(list.removeNode(alice, 3n), alice);
    assertEquals(getList(), [1n]);
    assertEquals(getNext(1n), null);
    assertEquals(getLast(), 1n);
    assertEquals(getFirst(), 1n);
  });

  it("set new head from middle", () => {
    chain.txOk(list.addNode(alice), alice);
    chain.txOk(list.addNode(alice), alice);
    assertEquals(getList(), [1n, 4n, 5n]);

    chain.txOk(list.setFirst(alice, 4n), alice);

    assertEquals(getList(), [4n, 1n, 5n]);
  });

  it("set new head from last", () => {
    chain.txOk(list.setFirst(alice, 5n), alice);
    assertEquals(getList(), [5n, 4n, 1n]);
  });

  it("cant set existing first as first", () => {
    chain.txErr(list.setFirst(alice, 5n), alice);
  });

  it("remove all", () => {
    getList().forEach((n) => chain.txOk(list.removeNode(alice, n), alice));

    assertEquals(getList(), []);
    assertEquals(getFirst(), null);
    assertEquals(getLast(), null);
  });

  it("add from empty after removing", () => {
    chain.txOk(list.addNode(alice), alice);
    assertEquals(getList(), [6n]);
  });
});
