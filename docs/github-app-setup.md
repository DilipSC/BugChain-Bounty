# GitHub App Setup

This document explains exactly what you need to create for the GitHub App integration and where each value comes from.

## What You Need

You need two GitHub integrations:

- an OAuth App for login
- a GitHub App for repository install permissions and webhook events

## OAuth App

Create it at:

- `GitHub Settings` -> `Developer settings` -> `OAuth Apps`

Use:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Copy:

- `Client ID` -> `GITHUB_ID`
- `Client secret` -> `GITHUB_SECRET`

## GitHub App

Create it at:

- `GitHub Settings` -> `Developer settings` -> `GitHub Apps`

Use:

- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/github-app/callback`
- Webhook URL: `http://localhost:3000/api/webhooks/github`
- Webhook secret: a long random string you generate

Copy:

- `App ID` -> `GITHUB_APP_ID`
- `Client ID` -> `GITHUB_APP_CLIENT_ID`
- `Client secret` -> `GITHUB_APP_CLIENT_SECRET`
- the app URL slug -> `GITHUB_APP_SLUG`

Generate:

- `Private key` -> `GITHUB_APP_PRIVATE_KEY`

Use the same webhook secret in:

- GitHub App webhook settings
- `GITHUB_APP_WEBHOOK_SECRET`

Example:

If your install URL is:

```text
https://github.com/apps/bugchain-bounty-dev/installations/new
```

then:

```text
GITHUB_APP_SLUG=bugchain-bounty-dev
```

## Minimum Permissions

Repository permissions:

- Pull requests: `Read-only`
- Metadata: `Read-only`
- Contents: `Read-only`

Subscribe to events:

- `Pull request`

## Who Owns The Webhook Secret

You do.

Your users do not:

- create it
- paste it into repositories
- manage it repo by repo

It is configured once at the GitHub App level.

## Local Development Note

GitHub must reach your webhook URL from the public internet.

For local testing, use a tunnel such as `ngrok` or `cloudflared`, then set:

- GitHub App webhook URL to your public tunnel URL plus `/api/webhooks/github`

Example:

```text
https://your-subdomain.ngrok-free.app/api/webhooks/github
```

## Recommended Testnet For Payouts

For development, use `Base Sepolia`.

Suggested env values:

```env
BOUNTY_PAYOUT_RPC_URL="https://sepolia.base.org"
BOUNTY_PAYOUT_CHAIN_ID="84532"
```

Then fund your server payout wallet with free Base Sepolia ETH from one of the faucets documented by Base.
