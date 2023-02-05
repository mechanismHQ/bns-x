import type { DeploymentNetwork, ProjectFactory } from '@clarigen/core';
import { contractFactory } from '@clarigen/core';
import { projectFactory } from '@clarigen/core';
import { getContractParts } from '../utils';
import { project, contracts } from './clarigen';
export { project } from './clarigen';
import { getBnsDeployer } from './constants';
import { nameWrapperCode } from './wrapper-code';

export type BnsxContracts = ProjectFactory<typeof project, DeploymentNetwork>;

export class BnsxContractsClient {
  readonly contracts: BnsxContracts;
  readonly networkKey: DeploymentNetwork;

  constructor(network: DeploymentNetwork = 'mainnet') {
    this.networkKey = network;
    this.contracts = projectFactory(project, network);
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
}
