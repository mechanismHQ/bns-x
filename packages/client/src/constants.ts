export const DEFAULT_API_URL = 'https://api.bns.xyz';

export function getBnsDeployer(mainnet = true) {
  if (mainnet) {
    return 'SP000000000000000000002Q6VF78';
  }
  return 'ST000000000000000000002AMW42H';
}
