export const btcBytes = new Uint8Array([98, 116, 99]);
export const btcNamespace = {
  namespace: "btc",
  namespaceBytes: btcBytes,
  properties: {
    canUpdatePriceFunction: true,
    launchedAt: 0n,
    lifetime: 262800n,
    namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
    priceFunction: {
      base: 1000n,
      buckets: [1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n],
      coeff: 200n,
      noVowelDiscount: 1n,
      nonalphaDiscount: 1n,
    },
    revealedAt: 0n,
  },
} as const;

export const contractPrincipalHashes = {
  wrapper0: "43dcb7e1f044c1c8d418b53e1c8225b78f84b34c0598c022fa18f966cd757fd9",
  wrapper1: "be6985623d0759051c9c0f99c489a2e9634e22de0f1066d3d6447c757940529b",
  wrapper2: "7e9c761cae04ae1182e6b909cf0be120b6eb4cf4fb2248484b428d986e636296",
  wrapper3: "ec15748408b872b912f90db5df9c08536e05b6b379e97c32bc9bfa9949f0cb57",
  wrapper4: "6fc09f393d5a73375586e912ead37dcd342ea36c0879f87b35e41205c3cfb65c",
  wrapper5: "17f647b596bae800df0189dea23c4d70acb1f11ced6a87e16547995b1e2554ba",
  wrapper6: "0543e976da816c1264aa07913d633cf41a06217f81808136a09249c70089143b",
  wrapper7: "60ded211ad2fdf721b853a8df21ff6ba243082140a27d27f109d8414ee727ebd",
  wrapper8: "412e2752e73519b46977c87eac99bdbb63abda98ebba0bc7f1ec3b5ccdf766fb",
  wrapper9: "e1433b5265ec0ba40f5ffd5db3ce56f0d49e360f8175c7fbd70812bec630d5e7",
} as const;

export const signedContracts = [
  {
    hash: "43dcb7e1f044c1c8d418b53e1c8225b78f84b34c0598c022fa18f966cd757fd9",
    signature:
      "0145bbc80bd40e61d9b3999c5ac40b29913a01c740564cd92f8583d6fdbb400ced5f415ada2fb4d557183ea923a28e4f675fc90038b4e3ce1686a995336dab2323",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-0",
  },
  {
    hash: "be6985623d0759051c9c0f99c489a2e9634e22de0f1066d3d6447c757940529b",
    signature:
      "0041295f569a571db1df8013ebf2db1ca5044b5d0ddc2e631e37314f476bddb0424d6d68a34dc139f650ac75b9104e80527912ed5bd7120fb3e9d4879ee4d13c2f",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-1",
  },
  {
    hash: "7e9c761cae04ae1182e6b909cf0be120b6eb4cf4fb2248484b428d986e636296",
    signature:
      "00f5abfc9e1dc2f722d2247cc6255105e844813c492f27ada58a2e23ce12798b5960c70f0ac469841f315bea8ca025afb2ece9b37e6600c7ca2d14377f16ce7dc4",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-2",
  },
  {
    hash: "ec15748408b872b912f90db5df9c08536e05b6b379e97c32bc9bfa9949f0cb57",
    signature:
      "00a6d7533bf24f7c27d39c90b504b5661679e2fa448ee2e49fedac7faf00f46a457750505a88bad1801c588fbf0f5b028cee66f8ad90bbb64990dcaa3263c2000f",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-3",
  },
  {
    hash: "6fc09f393d5a73375586e912ead37dcd342ea36c0879f87b35e41205c3cfb65c",
    signature:
      "018605ea5a0bd682bf1590b92d3b95fa3664b8269351f8a2cb59a1a23b0d4d3b5f2a86ebe1a927997f13fbc9c7a26927456101516bbdc7f1c528691f3e2bb2924f",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-4",
  },
  {
    hash: "17f647b596bae800df0189dea23c4d70acb1f11ced6a87e16547995b1e2554ba",
    signature:
      "018ff71c790711d8f4eda919d54c471a6d83d5ddbbf26ae27b83fad09fe04229213d99373ec344e19820474887ee6509642bd3d1782e83cad7cc60dd855904aa67",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-5",
  },
  {
    hash: "0543e976da816c1264aa07913d633cf41a06217f81808136a09249c70089143b",
    signature:
      "00924a445622bf3dde8ade3f503b964389c5b2d78ebf02d77983e7d342273145c42d8a3185f216a35f40e917afa2983d83e761588e10ca575ecfcf3effae19281b",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-6",
  },
  {
    hash: "60ded211ad2fdf721b853a8df21ff6ba243082140a27d27f109d8414ee727ebd",
    signature:
      "0166687d1e064deb49444a245e5bf057343860cb03670b04fd06b633dc20a9abc66b4b30a4c3ca81f812d513705cf4145f89560b9f44c3b0ab13dcaa0e4ae3820b",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-7",
  },
  {
    hash: "412e2752e73519b46977c87eac99bdbb63abda98ebba0bc7f1ec3b5ccdf766fb",
    signature:
      "01d7635b22eb2d4b517e28ab76fe9c2cb4cbad53afb74b186218ea88e31d736b48772cb23b097f22b4cb3f86068a072d0692ab615d88495543d1cb03104f3392ba",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-8",
  },
  {
    hash: "e1433b5265ec0ba40f5ffd5db3ce56f0d49e360f8175c7fbd70812bec630d5e7",
    signature:
      "00e20d181c89be0046e91c792565fe1880c1fba65e30537f556233d04d0f075a912c686eb43c937b5b3f4962257b9998d35820e348211a1ddb65be8ac6fed5a863",
    id: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-9",
  },
];
