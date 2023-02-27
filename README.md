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
