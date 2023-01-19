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

export const alicePubkeyHash = new Uint8Array([
  115, 33, 183, 78, 43, 106, 126, 148, 158, 108, 74, 211, 19, 3, 91, 22, 101, 9,
  80, 23,
]);

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

export const signedWrapperIds = [
  {
    hash: "374708fff7719dd5979ec875d56cd2286f6d3cf7ec317a3b25632aab28ec37bb",
    id: 0,
    signature:
      "0133697b2b8374e495b91ce760c9bb97846c0f29427b2cfaaebb6bf285ee2babbc013b1fe57b040f60cc7969ee4a6570ec505edbb90c3ab9aa2a6ec8ca4854a459",
  },
  {
    hash: "4cbbd8ca5215b8d161aec181a74b694f4e24b001d5b081dc0030ed797a8973e0",
    id: 1,
    signature:
      "00e36ae42c26962dd695e35e921b300944cbd3309cc49b70a238c5a79ad81c4d0a36278e96f6cfb091819b65b67efa8e205084441d00c341e3b53ef1dac7ae3b2d",
  },
  {
    hash: "b1535c7783ea8829b6b0cf67704539798b4d16c39bf0bfe09494c5d9f12eee30",
    id: 2,
    signature:
      "00093937898985ccdbaca8fbfef04123451ded8a00a8cb6650ca0af7128526b9396947097dc79232c835989ab430b38f9dbc33b4aebdec3b60d71a6a9b547018d3",
  },
  {
    hash: "59d5966c96af7ecad5c9d2918d6582d102b2c67f6b765ea28ac24371ab4f93be",
    id: 3,
    signature:
      "01eb72be5a9a6e16007a3cb97a11d1edf338253b1970a5005a424977c04eeda0090338943b6e83b421108538e52b116c15c93b0e40de3971eac50e38787242b940",
  },
  {
    hash: "6b6f14e6af2627186bf8a55e474dcf6ef3f6ce81af560da871ec51eb670171a9",
    id: 4,
    signature:
      "008c8585410f4ac3ca9272b935de5ad293aa17068e70816578463fe6fc7ede03fd263124ed4c1250268b9a1faf6a6489bced6b92a1a2277882492d3d4923ce1906",
  },
  {
    hash: "966a28d35016032ee27b1860df4a9b16b6c007da76b2e4f94e7526e31c48959b",
    id: 5,
    signature:
      "00eaf464a1da95b5fa6a5bd6a582a68f30d08ca5f8d875e49c9c7cad7e31f12ef30d893fca830e72beac041e540289d292cdf347081bbabf545536d83e2eaa545f",
  },
  {
    hash: "5e9a5de4a59a7c3c9ba8846060ba77ab402e3088658aa705e1a64e796f6cd5cf",
    id: 6,
    signature:
      "000f098f058179387706f777cd6d363ef01ef2989ff0989c4f50a4bb53eb9539d34394f751778cd2a145d2bc1e0878f95e8a7fa30da43827a91c2c58a155d14a04",
  },
  {
    hash: "76108f84396dc2d72ce275fdb0e0ef37b229b2898bf5a31d576fea11a766a42b",
    id: 7,
    signature:
      "01cd1260612cfe322cb5993505f0cf55e9294dbb33984418b0995e580669dbd3a528f444f23329a69f17a31ab827f4a25b4e15f7aadb3732b46ee9faf02429245d",
  },
  {
    hash: "85b724e3f6e2dd2648a696595eb637b234dcecc5cb770a5afbf0926341ebdfb4",
    id: 8,
    signature:
      "01c9559d81c81b833379d84117d0734ce36878f5f7c990616dc2031e028fc8a3e13756d82e9cbae533ffa0c7ea407b89676da66a43b012c785ac71f12fc54396ed",
  },
  {
    hash: "d6370cab1c1a5afabb4e1b3d6e68a55fc8a8b6150d719d3f1e66c3fb4676c56c",
    id: 9,
    signature:
      "016766c034624f4f873ea81056dccb0a029a694db686fabe342dda78407c04f0ca7c74b9dd6233341b221667692ffb4b6828b2e70a97eb44e1d33726a382fdf87f",
  },
];
