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

**Speedrun version**

1. `vr integrate` - start the Clarinet devnet
   - Leave running and open a new CLI tab
1. `vr boostrap`
   - Leave running and open a new CLI tab
1. `pnpm build:packages`
1. `pnpm dev:api`
   - Leave running and open a new CLI tab
1. `pnpm dev:web`
   - Visit Dots at [localhost:3000](http://localhost:3000)

#### Setup and start a Devnet chain

To start up the local devnet environment:

```bash
vr integrate
```

This will run some setup scripts and then run `clarinet integrate`.

Once the chain is running and BNS contracts are deployed, run:

```bash
vr bootstrap
```

This will run a script that polls the local devnet chain and deploys a few setup contracts once the chain is setup.

#### Build local packages

The API and web app use local packages inside this monorepo, so they must be built. To do so, run:

```bash
pnpm build:packages
```

#### Setup and run the API

Next, run:

```bash
pnpm dev: api
```

This will start the API at [localhost:3002](http://localhost:3002)

**Optional: setup Postgres in the API server**

By default, the API runs in a "fallback" mode that queries on-chain contracts for all API requests. This works, but is less efficient and doesn't include all API endpoints.

To setup Postgres, make sure Postgres is installed and running on your machine. Next, create a file at `./api/.env` with:

```
# local postgres DB, you can change the DB name:
BNSX_DB_URL="postgresql://localhost:5432/bnsx-dev?schema=public"
```

You might need to change the username and password for this to work, depending on your local Postgres environment.

Next, create another file at `./api/.env.local` with:

```
# Stacks API DB: don't change this, it comes from clarinet integrate's docker setup
STACKS_API_POSTGRES="postgresql://postgres:postgres@localhost:5433/stacks_api"

# keep this to ensure your local API stays in sync:
WORKER=true
```

Next, run (in the `api` folder):

```bash
pnpm prisma migrate dev
```

When you restart your local devnet environment, you'll need to run `pnpm prisma migrate reset` to wipe your DB.

Then, run the API with `pnpm dev`.

#### Setup and run the web app

You can now run the web app with:

```
pnpm dev:web
```

### Running Dots on mainnet

To run the Dots app for mainnet, modify `web/.env.local` to include:

```
NEXT_PUBLIC_NETWORK_KEY=mainnet
NEXT_PUBLIC_API_URL=https://api.bns.xyz
```

Once changes, run `pnpm dev` in the `web` folder to run a mainnet version of Dots.
