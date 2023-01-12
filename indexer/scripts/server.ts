import { config } from "dotenv";
import { app } from "../src/app";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
app.listen(
  {
    host: "0.0.0.0",
    port,
  },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Listening at ${address}`);
  }
);
