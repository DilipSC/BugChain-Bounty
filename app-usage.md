# App Usage Guide

This guide explains how to use the app after you have:

- set up your env vars
- funded the backend payout wallet with Base Sepolia ETH
- started the app locally

## 1. Start The App

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 2. Sign In With GitHub

From the landing page:

1. Click the GitHub login button
2. Sign in with your GitHub account
3. Complete OAuth approval
4. You should land on `/main`

What this does:

- creates or loads your user record
- connects your GitHub identity to the app
- lets the app fetch repositories tied to your account

## 3. Connect A Developer Wallet

If you are testing the developer flow:

1. Open the dashboard
2. Find the wallet section
3. Click `Connect Wallet`
4. MetaMask should open
5. Approve the wallet connection
6. Make sure MetaMask is using `Base Sepolia`

What this does:

- saves the developer's receiving address in the database
- allows payouts to be sent to that wallet after PR merge detection

Important:

- contributors only connect MetaMask
- contributors do not share private keys with the app

## 4. Create A Bounty Listing

On the dashboard:

1. Select one of your repositories
2. Enter the bounty amount
3. Enter:
   - `currencySymbol`: `ETH`
   - `chainId`: `84532`
4. Click `Create Listing`

What this does:

- saves a bounty configuration for that repository
- tells the app what to pay when a PR is merged

Use values that match your backend payout wallet setup:

- network: `Base Sepolia`
- chain ID: `84532`
- currency: `ETH`

## 5. Confirm The Listing Exists

After creating the listing:

1. Look at the `Active Listings` section
2. Verify your repo appears there
3. Verify the bounty amount, symbol, and chain ID are correct

If the repo is not shown:

- refresh the dashboard
- confirm the listing was created successfully
- confirm your GitHub account can access that repo

## 6. Test The Developer Flow

To test a full payout flow, use two roles:

- `Maintainer`
  Owns or manages the repo and creates the bounty listing
- `Developer`
  Connects MetaMask and submits a pull request

### Developer side

1. Sign in
2. Connect MetaMask
3. Save the wallet address in the app
4. Submit a PR to the listed repo

### Maintainer side

1. Review the PR on GitHub
2. Merge the PR

## 7. What Should Happen After Merge

After the PR is merged:

1. GitHub sends a webhook event to your backend
2. Your backend checks whether that repo has an active listing
3. The app creates a payout record
4. If the developer has already connected a wallet, the backend attempts the payout
5. The payout appears in the `Merged PR Payouts` section

Possible statuses:

- `PENDING_WALLET`
  The PR was merged but the developer has not connected a wallet yet
- `READY_TO_PAY`
  The app has enough info to pay
- `PAID`
  The transaction was sent successfully
- `FAILED`
  The payout attempt failed and the error should be shown

## 8. If The Developer Connects Wallet Late

If a PR was merged before the developer connected MetaMask:

1. The payout will be created as `PENDING_WALLET`
2. The developer can connect MetaMask later
3. The app updates the wallet address
4. The backend can then move that payout toward payment

## 9. How To Verify A Payout

In the dashboard:

1. Open `Merged PR Payouts`
2. Find the payout entry
3. Check the status
4. If there is a transaction hash, copy it
5. Open Base Sepolia explorer:

```text
https://sepolia-explorer.base.org
```

Search the transaction hash there.

## 10. Common Things To Check

If payouts are not working, verify:

- `.env.local` has:
  - `BOUNTY_PAYOUT_RPC_URL`
  - `BOUNTY_PAYOUT_PRIVATE_KEY`
  - `BOUNTY_PAYOUT_CHAIN_ID`
- the backend payout wallet has Base Sepolia ETH
- the listing uses chain ID `84532`
- the contributor wallet is on Base Sepolia
- the webhook setup is correct
- the merged PR belongs to a repo that has an active listing

## 11. Recommended Test Sequence

Use this order:

1. Start app
2. Sign in as maintainer
3. Create a listing for a test repo
4. Sign in as developer
5. Connect MetaMask on Base Sepolia
6. Open a PR to the listed repo
7. Merge the PR
8. Refresh the dashboard
9. Check payout status
10. Verify the transaction in the explorer

## 12. Current Model

Right now the app is built around:

- MetaMask for contributor wallet connection
- backend payout wallet for actually sending funds

That means:

- developers connect only their receiving wallet
- the backend sends the payout transaction automatically

This is the intended test setup for now.
