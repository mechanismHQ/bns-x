const needsConverted = ["wrapper-migrator.clar", "name-wrapper.clar"];

await Promise.all(
  needsConverted.map(async (file) => {
    const code = await Deno.readTextFile(`./contracts/${file}`);
    const testnet = code.replaceAll(
      "SP000000000000000000002Q6VF78",
      "ST000000000000000000002AMW42H"
    );

    await Deno.writeTextFile(`./contracts/testnet/${file}`, testnet);
  })
);
