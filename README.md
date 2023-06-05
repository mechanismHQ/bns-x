# BNS X

BNS X is a protocol for extending and improving the Bitcoin Naming System (BNS).

At the time of writing, all aspects of the BNS X protocol are in development and unreleased.

This project is a monorepo, which includes a few packages:

- Clarity contracts and tests
  - Clarity contracts for the protocol are under [`./contracts`](./contracts/). The contracts themselves live under [`./contracts/contracts`](./contracts/contracts/). Tests are under [`./contracts/tests/`](./contracts/tests/).
  - Auto-generated Clarity code documentation can be found under [`./docs`](./docs/).
  - This project uses Clarinet for testing and other Clarity development purposes.
- Web app
  - A web app for interfacing with BNS X can be found under [`./web`](./web/)
- API
  - A basic API for BNS X on-chain data is under [`./api/](./api/)
- Client
  - A library for interacting with all things BNS is available under [`./packages/client`](./packages/client/)

## Local development

To work on the project, here are a few commands needed to get setup.

**Install dependencies**

For this project, you'll need `pnpm`, `clarinet`, [`clarigen`](https://clarigen.dev), and [`velociraptor`](https://velociraptor.run).

Once they're installed, run `pnpm install` to install package dependencies.

**Running contract tests**

All contracts and tests are under the `contracts` folder. To run tests:

```ts
cd contracts
clarinet test
```

### Running a local environment (blockchain, API, and web app)

**Setup and start a Devnet chain**

Next, run a local Clarinet chain. To start this, run `vr integrate`. This will run some setup scripts and then run `clarinet integrate`.

Make a file at `./contracts/.env` with a few devnet private keys (these are not private, and are copied from `./contracts/Settings/Devnet.toml`):

```
DEPLOYER_KEY=753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601
FAUCET_KEY=de433bdfa14ec43aa1098d5be594c8ffb20a31485ff9de2923b2689471c401b801
```

At the root level of the project, run `vr bootstrap`. This will run a script that polls the local devnet chain and deploys a few setup contracts once the chain is setup.

**Build local packages**

The API and web app use local packages inside this monorepo, so they must be built. To do so, run:

```bash
pnpm build:packages
```

**Setup and run the API**

First, setup the API. Create a file at `./api/.env.local`. You need a few environment variables:

```
# local postgres DB, you can change the DB name:
BNSX_DB_URL="postgresql://localhost:5432/bnsx-dev?schema=public"

# Stacks API DB: don't change this, it comes from clarinet integrate's docker setup
STACKS_API_POSTGRES="postgresql://postgres:postgres@localhost:5433/stacks_api"

# keep this to ensure your local API stays in sync:
WORKER=true
```

Now, in the `api` folder, run `pnpm prisma migrate reset`. This will run migrations for your local database. Make sure you re-run this whenever you restart the local blockchain.

Once the Devnet chain is running, you can start the API server:

```
cd api
pnpm dev
```

**Setup and run the web app**

Create a file at `./web/.env.local` with a few environment variables. These are not private, they are keys copied from `./contracts/Settings/Devnet.toml`.

```
SECRET_COOKIE_PASSWORD=asdfasdfasdfasdfasdfasdfasdfasdf
WRAPPER_SIGNER_KEY=753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601
FAUCET_KEY=753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601

NEXT_PUBLIC_NETWORK_KEY=devnet
```

You can now run the web app with:

```
cd web
pnpm dev
```

### Running on mainnet

To run the Dots app for mainnet, modify `web/.env.local` to include:

```
NEXT_PUBLIC_NETWORK_KEY=mainnet
NEXT_PUBLIC_API_URL=https://api.bns.xyz
```

Once changes, run `pnpm dev` in the `web` folder to run a mainnet version of Dots.
