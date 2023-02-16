import type { DeploymentNetwork, ProjectFactory } from '@clarigen/core';
import { contractFactory, projectFactory, ClarigenClient } from '@clarigen/core';
import { asciiToBytes } from 'micro-stacks/common';
import { convertNameBuff } from '~/contracts/utils';
import { getContractParts } from '../utils';
import { project, contracts } from './clarigen';
export { project } from './clarigen';
import { getBnsDeployer } from './constants';
import { nameWrapperCode } from './wrapper-code';

export type BnsxContracts = ProjectFactory<typeof project, DeploymentNetwork>;

export class BnsxContractsClient {
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
    const registryId = this.registry.identifier;
    const [addr] = getContractParts(registryId);
    const devnetDeployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

    // TODO: fix bns for mainnet
    const code = nameWrapperCode
      .replaceAll(devnetDeployer, addr)
      .replaceAll('ST000000000000000000002AMW42H', getBnsDeployer(this.isMainnet));
    return code;
  }

  get legacyBns() {
    const bns = contracts.bnsV1;
    return contractFactory(bns, `${getBnsDeployer(this.isMainnet)}.bns`);
  }

  get upgrader() {
    return this.contracts.wrapperMigrator;
  }

  /**
   * @param contractId The full contract identifier (ie SP..123.name-wrapper-10)
   *
   * @returns a type-safe interface to the name wrapper contract
   */
  nameWrapper(contractId: string) {
    const wrapper = contracts.nameWrapper;
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
}
