import type { DeploymentNetwork, ProjectFactory } from '@clarigen/core';
import { contractFactory, projectFactory, ClarigenClient } from '@clarigen/core';
import { asciiToBytes } from 'micro-stacks/common';
import { convertNameBuff, getContractParts, project, contracts } from '@bns-x/core';
import { getBnsDeployer } from './constants';
import { nameWrapperCode, nameWrappers } from './wrapper-code';

export type BnsxContracts = ProjectFactory<typeof project, DeploymentNetwork>;

export class BnsContractsClient {
  readonly contracts: BnsxContracts;
  readonly networkKey: DeploymentNetwork;
  readonly client: ClarigenClient;

  constructor(
    network: DeploymentNetwork = 'mainnet',
    coreApiUrl = 'https://stacks-node-api.mainnet.stacks.co'
  ) {
    this.networkKey = network;
    this.contracts = projectFactory(project, network);
    this.client = new ClarigenClient(coreApiUrl);
  }

  get isMainnet() {
    return this.networkKey === 'mainnet';
  }

  get registry() {
    this.contracts.bnsxRegistry;
    return this.contracts.bnsxRegistry;
  }

  get nameNftAsset() {
    const contract = this.registry;
    const nft = contract.non_fungible_tokens[0].name;
    return `${contract.identifier}::${nft}`;
  }

  get queryHelper() {
    return this.contracts.queryHelper;
  }

  get nameWrapperCode() {
    return this.convertNameWrapperCode(nameWrapperCode);
  }

  get validNameWrappers(): typeof nameWrappers {
    return nameWrappers.map(c => this.convertNameWrapperCode(c)) as unknown as typeof nameWrappers;
  }

  isValidNameWrapper(code: string) {
    const found = this.validNameWrappers.find(c => c === code);
    return typeof found !== 'undefined';
  }

  private convertNameWrapperCode(code: string) {
    const registryId = this.registry.identifier;
    const [addr] = getContractParts(registryId);
    const devnetDeployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    const converted = code
      .replaceAll(devnetDeployer, addr)
      .replaceAll('ST000000000000000000002AMW42H', getBnsDeployer(this.isMainnet));
    return converted;
  }

  /**
   * @deprecated
   */
  get legacyBns() {
    return this.bnsCore;
  }

  get bnsCore() {
    const bns = contracts.bnsV1;
    return contractFactory(bns, `${getBnsDeployer(this.isMainnet)}.bns`);
  }

  get migrator() {
    return this.contracts.wrapperMigrator;
  }

  /**
   * @deprecated
   */
  get upgrader() {
    return this.migrator;
  }

  /**
   * @param contractId The full contract identifier (ie SP..123.name-wrapper-10)
   *
   * @returns a type-safe interface to the name wrapper contract
   */
  nameWrapper(contractId: string) {
    const wrapper = contracts.nameWrapperV2;
    return contractFactory(wrapper, contractId);
  }

  /**
   * resolve the owner of an address for a given name
   */
  async resolveName(fqn: string) {
    const [name, namespace] = getContractParts(fqn).map(asciiToBytes) as [Uint8Array, Uint8Array];
    const tx = this.registry.getNameProperties({
      name: name,
      namespace: namespace,
    });
    const properties = await this.client.ro(tx, {
      tip: 'latest',
      json: true,
    });
    if (!properties) return null;
    const { id, owner, ..._rest } = properties;
    return {
      id: Number(id),
      owner,
    };
  }

  /**
   * Fetch the name properties of the primary name for a given address
   */
  async reverseResolve(address: string) {
    const primary = await this.client.ro(this.registry.getPrimaryName(address), {
      latest: true,
    });
    if (primary === null) return null;
    return convertNameBuff(primary);
  }

  /**
   * Compute the price for a name on BNS Core.
   *
   * If the name is invalid, or the namespace doesn't exist, returns an error.
   *
   * @param name
   * @param namespace
   * @returns Price of name in uSTX
   */
  async computeNamePrice(name: string, namespace: string) {
    const result = await this.client.ro(
      this.bnsCore.getNamePrice({
        name: asciiToBytes(name),
        namespace: asciiToBytes(namespace),
      })
    );

    if (!result.isOk) {
      throw new Error(`Unable to get name price: received error ${result.value}`);
    }

    return result.value;
  }

  /**
   * Fetch namespace properties for a specific namespace.
   */
  async fetchNamespaceProperties(namespace: string) {
    const nsBytes = asciiToBytes(namespace);
    const propsResponse = await this.client.ro(this.bnsCore.getNamespaceProperties(nsBytes));
    if (propsResponse.isOk) {
      return propsResponse.value.properties;
    }
    throw new Error(
      `\`fetchNamespaceProperties\`: ${namespace} does not exist, returned error ${propsResponse.value}`
    );
  }

  async fetchNamespaceExpiration(namespace: string) {
    const props = await this.fetchNamespaceProperties(namespace);
    return props.lifetime;
  }
}
