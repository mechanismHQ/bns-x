/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as btc from '@scure/btc-signer';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hex } from '@scure/base';
import http from 'http';

export const BtcMainnet = {
  bech32: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

export type BtcNetwork = typeof BtcMainnet;

export const BtcTestnet: BtcNetwork = {
  bech32: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

export type BTCNetwork = BtcNetwork;

const BtcRegtest = {
  ...BtcTestnet,
  bech32: 'bcrt',
};

export const BitcoinNetwork = {
  Mainnet: BtcMainnet,
  Testnet: BtcTestnet,
  Regtest: BtcRegtest,
} as const;

async function broadcastTx(hex: string) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '1.0',
      id: 'curltest',
      method: 'sendrawtransaction',
      params: [hex],
    });

    const options = {
      hostname: '127.0.0.1',
      port: 18443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      auth: 'devnet:devnet',
    };

    const req = http.request(options, res => {
      res.setEncoding('utf8');
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        const parsedData = JSON.parse(data) as { error: any; result: any };
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (parsedData.error) {
          reject(
            new Error(
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `Error code: ${parsedData.error.code}, Error message: ${parsedData.error.message}`
            )
          );
        } else {
          resolve(parsedData.result);
        }
      });
    });

    req.on('error', e => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

const faucetPkHex = 'de433bdfa14ec43aa1098d5be594c8ffb20a31485ff9de2923b2689471c401b8';
const faucetPk = hex.decode(faucetPkHex);
const faucetPub = secp256k1.getPublicKey(faucetPk, true);

const faucetPayment = btc.p2pkh(faucetPub, btc.TEST_NETWORK);

const inputTxid = '94d6b57f493575b8758554cc28d9978f9f442e38b99d59956332916d38474f86';

const tx = new btc.Transaction();

const inputTx =
  '020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff025500ffffffff0200f2052a010000001976a9142b19bade75a48768a5ffc142a86490303a95f41388ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000';

const inputAmount = btc.Decimal.decode('50');
const fee = 10000n;

tx.addInput({
  txid: inputTxid,
  nonWitnessUtxo: inputTx,
  index: 0,
});

tx.addOutputAddress(
  'bcrt1pl6jy639htve06pk0d538vzejxxdc2j7dwuyvc2zp3mlsfajudmrq2wpxn2',
  inputAmount - fee,
  BtcRegtest
);

tx.sign(faucetPk);

tx.finalize();

const txHex = tx.hex;

async function run() {
  const result = await broadcastTx(txHex);
  console.log(result);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
