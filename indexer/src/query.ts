import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const names = await prisma.name.findMany();
  console.log(names);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
