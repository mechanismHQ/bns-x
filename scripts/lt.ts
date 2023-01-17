import localtunnel from "localtunnel";
import { networkInterfaces } from "os";

interface TunnelReq {
  method: string;
  path: string;
}

function getIp() {
  const nets = networkInterfaces();
  return nets["en0"]?.[1].address;
}

async function tunnel(port: number, name: string) {
  const tunnel = await localtunnel({ port, subdomain: name });

  tunnel.on("request", (req: TunnelReq) => {
    console.log(`${req.method} ${tunnel.url}/${req.path}`);
  });

  tunnel.on("close", () => {
    console.log(`Tunnel ${tunnel.url} to port ${port} closed.`);
  });

  console.log(`Tunnel ${tunnel.url} to port ${port} opened.`);
}

async function run() {
  await tunnel(3000, "swapy");
  await tunnel(3999, "swapynode");
  // await tunnel(51002, 'swapybtc');
  const ip = getIp();
  if (ip) console.log(`Connect to electrum at ${ip}:51002`);
}

run()
  .catch(console.error)
  .finally(() => {
    // process.exit();
  });
