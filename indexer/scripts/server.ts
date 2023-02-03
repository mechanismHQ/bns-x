import { config } from "dotenv";
import { makeApp } from "../src/app";

async function run() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
  const app = await makeApp();
  const address = await app.listen({
    host: "0.0.0.0",
    port,
  });
  console.log(`Listening at ${address}`);
}

run()
  .catch((e) => {
    console.error("Error starting server");
    console.error(e);
    process.exit(1);
  })
  .finally(() => {});
