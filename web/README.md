# micro-stacks + next.js

This is an example Next.js application that implements `@micro-stacks/react` to add Stacks-based web3 authentication.
The example also details how to share session state between client and server
using [`iron-session`](https://github.com/vvo/iron-session.

This example is part of a guide found on
micro-stacks.dev: [Building a Stacks app with Next.js](https://micro-stacks.dev/guides/with-nextjs)

Online demo: [nextjs-example.micro-stacks.dev](https://nextjs-example.micro-stacks.dev)

## Overview

In this example:

- micro-stacks related dependencies are installed
- Stacks auth is implemented
- iron-session as a dependency
- API routes for saving/destroying session
- `_app.tsx` has the `ClientProvider` for micro-stacks context
- Fetching the user session and passing it to `ClientProvider`

## Getting Started

First, create a new `.env.local` file:

```
# ⚠️ The SECRET_COOKIE_PASSWORD should never be inside your repository directly, it's here only to ease
# the example deployment
# For local development, you should store it inside a `.env.local` gitignored file
# See https://nextjs.org/docs/basic-features/environment-variables#loading-environment-variables

SECRET_COOKIE_PASSWORD=2gyZ3GDw3LHZQKDhPmPDL3sjREVRXPr8
```

Then install your dependencies:

```bash
pnpm i
# or
yarn
```

Then run the dev task:

```bash
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed
on [http://localhost:3000/api/session/save](http://localhost:3000/api/session/save)
or [http://localhost:3000/api/session/destroy](http://localhost:3000/api/session/destroy). These endpoint can be found
in `pages/api/session/save.ts` and `pages/api/session/destroy.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated
as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about `micro-stacks`:

- [Overview](https://micro-stacks.dev/docs/overview)
- [Getting started](https://micro-stacks.dev/docs/getting-started)
- [Authentication](https://micro-stacks.dev/docs/authentication)
- [Transaction Signing](https://micro-stacks.dev/docs/transactions)
- [Working with post conditions](https://micro-stacks.dev/docs/transactions/working-with-post-conditions)
- [Message Signing](https://micro-stacks.dev/docs/message-signing)
- [Building a Remix app](https://micro-stacks.dev/guides/with-remix)
- [Building a Next.js app](https://micro-stacks.dev/guides/with-nextjs)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Community

<p style="display: flex; align-items: center; justify-content: flex-start; gap: 10px">
  <img alt="stars" src="https://badgen.net/github/stars/fungible-systems/micro-stacks" className="inline-block mr-2"/>
  <img alt="downloads" src="https://badgen.net/npm/dt/micro-stacks" className="inline-block mr-2"/>
  <img alt="license" src="https://badgen.net/npm/license/micro-stacks" className="inline-block mr-2"/>
</p>

`micro-stacks` is created and maintained by [Fungible Systems](https://fungible.systems), a web3-focused design and
engineering studio.

Follow [@FungibleSystems](https://twitter.com/FungibleSystems) on Twitter for updates and memes :~)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
