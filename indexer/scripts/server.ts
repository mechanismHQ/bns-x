import { app } from "../src/app";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
app.listen(
  {
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
