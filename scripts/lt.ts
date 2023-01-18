import "cross-fetch/polyfill";
import localtunnel, { Tunnel } from "localtunnel";
import { networkInterfaces } from "os";

interface TunnelReq {
  method: string;
  path: string;
}

let webT: Tunnel;
let nodeT: Tunnel;

async function tunnel(port: number, name: string) {
  const tunnel = await localtunnel({ port, subdomain: name });

  tunnel.on("request", (req: TunnelReq) => {
    const now = new Date();
    const d = `${now.getHours()}:${now.getMinutes()}`;
    console.log(`${d} ${req.method} ${tunnel.url}${req.path}`);
  });

  tunnel.on("close", () => {
    console.log(`Tunnel ${tunnel.url} to port ${port} closed.`);
    // exit("Tunnel crashed");
  });

  console.log(`Tunnel ${tunnel.url} to port ${port} opened.`);
  return tunnel;
}

async function exit(reason: string) {
  console.error(`Exiting: ${reason}`);
  try {
    webT.close();
  } catch (error) {}
  try {
    nodeT.close();
  } catch (error) {}
  process.exit(1);
}

async function monitor() {
  try {
    const res = await fetch("http://localhost:3999/v2/info");
    if (res.ok === false) {
      return exit("Node crashed");
    }
    setTimeout(monitor, 10000);
  } catch (error) {
    console.error(error);
    return exit("Node crashed");
  }
}

async function run() {
  webT = await tunnel(3000, "dots");
  nodeT = await tunnel(3999, "dotsnode");
  await monitor();
}

run()
  .catch(console.error)
  .finally(() => {
    // process.exit();
  });
