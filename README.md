# BugChain Bounty

BugChain Bounty is moving to a GitHub App based integration for merged-PR detection and automated bounty payouts.

The important product distinction is:

- users should sign in and install your GitHub App
- users should not manually create repo webhooks
- users should not manually generate or paste webhook secrets

The webhook secret belongs to the platform owner and is configured once in the GitHub App settings.

## Current Direction

The intended architecture is:

1. User signs in with GitHub
2. User installs your GitHub App on selected repositories
3. Your backend receives pull request webhooks from the GitHub App
4. When a PR is merged on a listed repo, the app creates a payout record
5. If blockchain payout env vars are configured, the app sends the payout automatically

This removes the per-repo manual webhook setup problem.

## Secrets And Env Vars

Create `.env` or `.env.local` from `.env.example`.

### Database and app session

- `DATABASE_URL`
  Your Postgres connection string
- `NEXTAUTH_SECRET`
  A random secret used by NextAuth for session encryption

### GitHub OAuth for user login

- `GITHUB_ID`
  OAuth App client ID
- `GITHUB_SECRET`
  OAuth App client secret

These are for user login only. They are not the GitHub App credentials.

### GitHub App credentials

- `GITHUB_APP_ID`
  Numeric GitHub App ID
- `GITHUB_APP_CLIENT_ID`
  GitHub App client ID
- `GITHUB_APP_CLIENT_SECRET`
  GitHub App client secret
- `GITHUB_APP_PRIVATE_KEY`
  Private key generated from the GitHub App settings
- `GITHUB_APP_WEBHOOK_SECRET`
  One shared secret you configure once in the GitHub App settings
- `GITHUB_APP_SLUG`
  The GitHub App URL slug used for the install flow

These belong to you, the platform owner.

Users do not create these values.
Users do not paste these values into repos manually.

### Blockchain payout wallet

- `BOUNTY_PAYOUT_RPC_URL`
  RPC endpoint for the chain you want to pay on
- `BOUNTY_PAYOUT_PRIVATE_KEY`
  Server-controlled wallet private key that sends payouts
- `BOUNTY_PAYOUT_CHAIN_ID`
  Chain ID that matches the RPC network

## Recommended Free Test Crypto

The best default for this project is `Base Sepolia`.

Why:

- it is an EVM chain, so it works with your current wallet and `ethers` setup
- the gas token is test `ETH`
- Base provides a public Sepolia RPC
- Base documents several faucet options for Base Sepolia test ETH

Recommended testnet config:

- Network: `Base Sepolia`
- Currency: `ETH`
- Chain ID: `84532`
- RPC URL: `https://sepolia.base.org`
- Explorer: `https://sepolia-explorer.base.org`

If you want an Ethereum L1 testnet instead, use `Ethereum Sepolia`. Ethereum.org currently recommends Sepolia as the default testnet for application development.

## Blockchain Env Setup

For local testing, use these values:

```env
BOUNTY_PAYOUT_RPC_URL="https://sepolia.base.org"
BOUNTY_PAYOUT_PRIVATE_KEY="0xyour-test-wallet-private-key"
BOUNTY_PAYOUT_CHAIN_ID="84532"
```

If you want Ethereum Sepolia instead:

```env
BOUNTY_PAYOUT_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
BOUNTY_PAYOUT_PRIVATE_KEY="0xyour-test-wallet-private-key"
BOUNTY_PAYOUT_CHAIN_ID="11155111"
```

Important:

- use a dedicated test wallet only
- do not use a real mainnet wallet private key here
- the payout wallet must be funded with testnet ETH
- the contributor wallet should also be on the same network

## How To Get Free Test ETH

### Base Sepolia

Base documents multiple faucets for Base Sepolia, including:

- Coinbase Developer Platform Faucet
- thirdweb Faucet
- QuickNode Faucet
- LearnWeb3 Faucet
- Ethereum Ecosystem Faucet

### Ethereum Sepolia

Ethereum.org lists Sepolia faucets including:

- Alchemy Sepolia Faucet
- Chainstack Sepolia Faucet
- Ethereum Ecosystem Faucet
- Infura Sepolia Faucet
- QuickNode Sepolia Faucet

## Practical Recommendation

Use `Base Sepolia` first.

It is the simplest fit for your current code because:

- you are sending native EVM currency
- fees are test ETH
- Base exposes a documented public RPC endpoint
- faucet access is usually easier than Ethereum Sepolia

## What You Create In GitHub

You need both:

- a GitHub OAuth App for login
- a GitHub App for repository installation and webhook events

Why both:

- OAuth App: lets users sign into your product
- GitHub App: gives your backend repo event access and installation-based permissions

## GitHub App Setup

Open GitHub:

- `Settings` -> `Developer settings` -> `GitHub Apps` -> `New GitHub App`

Use values like these for local development:

- GitHub App name: `BugChain Bounty Dev`
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/github-app/callback`
- Webhook URL: `http://localhost:3000/api/webhooks/github`
- Webhook secret: generate your own long random string and store it as `GITHUB_APP_WEBHOOK_SECRET`

### Repository permissions

Set these minimum permissions:

- Repository permissions -> Pull requests: `Read-only`
- Repository permissions -> Metadata: `Read-only`
- Repository permissions -> Contents: `Read-only`

If later you want the app to comment on PRs or update statuses, add those permissions separately.

### Subscribe to events

Subscribe at minimum to:

- `Pull request`

That is the event your backend uses to detect merged PRs.

### Generate the private key

After creating the GitHub App:

1. Open the app settings
2. Scroll to `Private keys`
3. Click `Generate a private key`
4. Download the `.pem` file
5. Put its full contents into `GITHUB_APP_PRIVATE_KEY`

On Windows PowerShell, if you want to inspect it:

```powershell
Get-Content .\your-github-app-private-key.pem -Raw
```

Paste that full multiline value into your env.

## Where Each GitHub Value Comes From

### OAuth App values

Create an OAuth App here:

- `Settings` -> `Developer settings` -> `OAuth Apps` -> `New OAuth App`

Use:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Then copy:

- `Client ID` -> `GITHUB_ID`
- `Client secret` -> `GITHUB_SECRET`

### GitHub App values

From the GitHub App settings page:

- `App ID` -> `GITHUB_APP_ID`
- `Client ID` -> `GITHUB_APP_CLIENT_ID`
- `Client secret` -> `GITHUB_APP_CLIENT_SECRET`
- your generated webhook secret -> `GITHUB_APP_WEBHOOK_SECRET`
- contents of downloaded `.pem` private key -> `GITHUB_APP_PRIVATE_KEY`
- app URL slug from the GitHub App URL -> `GITHUB_APP_SLUG`

## Who Sets The Webhook Secret

Only you set it.

Flow:

1. You create a random secret
2. You place it in the GitHub App webhook settings
3. You place the same value in your app env as `GITHUB_APP_WEBHOOK_SECRET`

That is done once for the GitHub App.

Users never do this manually for each repo.

## Database

Apply migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

## Run The App

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Product Flow After GitHub App Adoption

1. User signs in with GitHub
2. User installs your GitHub App
3. User selects a repo and configures a bounty amount
4. Contributor connects an EVM wallet
5. Maintainer merges a PR
6. GitHub App sends the webhook to your backend
7. Backend records payout and attempts blockchain transfer

## Important Constraint

Automatic payout from a maintainer's personal wallet is still not safe unless:

- you store that wallet private key on the server, or
- you move to an escrow smart contract

The current payout design assumes a server-controlled payout wallet defined in env vars.
