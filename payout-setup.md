# Payout Setup

This project will use:

- `Base Sepolia` for backend payout transactions
- `MetaMask` for developers to connect their receiving wallet

This is the simplest setup for testing:

- your backend holds a dedicated test wallet private key
- developers connect MetaMask and save their wallet address
- when a PR is merged, the backend sends Base Sepolia test ETH to the developer wallet

## 1. What You Need

You need two wallets:

- `Backend payout wallet`
  This is a dedicated test wallet whose private key goes into `.env.local`
- `Developer wallet`
  This is the contributor's MetaMask wallet address that gets paid

Do not use a mainnet wallet for backend testing.

## 2. Base Sepolia Network Details

Use these values:

- Network Name: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia-explorer.base.org`

Official Base docs:

- Base network info: https://docs.base.org/chain/using-base
- Base faucets: https://docs.base.org/chain/network-faucets

## 3. Create The Backend Payout Wallet

Use MetaMask to create a fresh wallet account only for testing payouts.

Suggested flow:

1. Open MetaMask
2. Create a new account dedicated to test payouts
3. Copy the wallet address
4. Export the private key for that test account only
5. Keep it private

That private key is what you put into:

```env
BOUNTY_PAYOUT_PRIVATE_KEY="0xyour-test-wallet-private-key"
```

## 4. Add Base Sepolia To MetaMask

Open MetaMask and add Base Sepolia if it is not already available.

Use these values:

- Network Name: `Base Sepolia`
- New RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency Symbol: `ETH`
- Block Explorer URL: `https://sepolia-explorer.base.org`

Reference:

- https://docs.base.org/chain/using-base

## 5. Fund The Backend Wallet With Free Test ETH

Visit one of the Base Sepolia faucets from the official Base docs:

- https://docs.base.org/chain/network-faucets

That page lists faucet options such as:

- Coinbase Developer Platform Faucet
- thirdweb Faucet
- QuickNode Faucet
- LearnWeb3 Faucet
- Ethereum Ecosystem Faucet

Claim Base Sepolia ETH into your backend payout wallet address.

## 6. Set Your Env Vars

Put this in `.env.local`:

```env
BOUNTY_PAYOUT_RPC_URL="https://sepolia.base.org"
BOUNTY_PAYOUT_PRIVATE_KEY="0xyour-test-wallet-private-key"
BOUNTY_PAYOUT_CHAIN_ID="84532"
```

Important:

- the private key should belong to the backend payout wallet
- the chain ID must match Base Sepolia
- the RPC URL must match Base Sepolia

## 7. Developer Wallet Setup

For developers receiving payouts:

1. Install MetaMask if needed
2. Connect MetaMask in your app
3. Switch MetaMask to `Base Sepolia`
4. Save the wallet address in the app

The developer does not need to export a private key to your app.
They only connect MetaMask so your app can store their receiving address.

## 8. Creating Bounty Listings

When you create a listing in your app, use:

- `currencySymbol`: `ETH`
- `chainId`: `84532`

That needs to match the backend payout wallet network.

## 9. How The Flow Works

1. Maintainer lists a repo with bounty amount and Base Sepolia chain ID
2. Developer connects MetaMask and saves their wallet address
3. Maintainer merges the PR
4. GitHub notifies your backend
5. Your backend sends Base Sepolia test ETH from the payout wallet to the developer wallet

## 10. Safety Rules

Only use this setup for testing.

Do not:

- use a wallet that holds real funds
- use a mainnet private key
- commit `.env.local` to git
- share the backend payout private key

## 11. Quick Checklist

- Create a dedicated MetaMask test account for backend payouts
- Add Base Sepolia to MetaMask
- Claim faucet ETH
- Put the private key into `.env.local`
- Set `BOUNTY_PAYOUT_RPC_URL` to `https://sepolia.base.org`
- Set `BOUNTY_PAYOUT_CHAIN_ID` to `84532`
- Have developers connect MetaMask on Base Sepolia
- Create listings with chain ID `84532`
