# Bounty Blockchain Setup

## Recommended Testnet

Use `Base Sepolia` for bounty payouts during development.

Why this is the best default:

- it is EVM-compatible, so it works with the current `ethers` setup
- it uses test `ETH` as the native token
- Base provides a public testnet RPC
- Base documents multiple faucet options for free test ETH

Network details:

- Network: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency Symbol: `ETH`
- Explorer: `https://sepolia-explorer.base.org`

## Env Vars

Put these in your `.env.local`:

```env
BOUNTY_PAYOUT_RPC_URL="https://sepolia.base.org"
BOUNTY_PAYOUT_PRIVATE_KEY="0xyour-test-wallet-private-key"
BOUNTY_PAYOUT_CHAIN_ID="84532"
```

Important:

- use a dedicated test wallet only
- do not use a real wallet that holds mainnet funds
- this private key is the backend payout wallet
- fund that wallet with Base Sepolia ETH from a faucet

## App Listing Values

When creating a bounty listing in the app, use:

- `chainId`: `84532`
- `currencySymbol`: `ETH`

This needs to match the payout env configuration.

## Free Test ETH Faucets

Base documents multiple faucet options for Base Sepolia, including:

- Coinbase Developer Platform Faucet
- thirdweb Faucet
- QuickNode Faucet
- LearnWeb3 Faucet
- Ethereum Ecosystem Faucet

Official Base docs:

- https://docs.base.org/chain/using-base
- https://docs.base.org/chain/network-faucets

## Alternative Option

If you prefer Ethereum Sepolia instead, use:

```env
BOUNTY_PAYOUT_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
BOUNTY_PAYOUT_PRIVATE_KEY="0xyour-test-wallet-private-key"
BOUNTY_PAYOUT_CHAIN_ID="11155111"
```

Ethereum.org currently recommends Sepolia as the default Ethereum application-development testnet.

Reference:

- https://ethereum.org/developers/docs/networks/

## Practical Flow

1. Create a fresh test wallet in MetaMask or another EVM wallet
2. Export the private key for that test wallet only
3. Put it into `BOUNTY_PAYOUT_PRIVATE_KEY`
4. Add Base Sepolia to the wallet if needed
5. Claim free Base Sepolia ETH from a faucet
6. Start the app
7. Create listings using chain ID `84532`
8. Connect contributor wallets on the same network

## Safety Note

This setup is only for testing.

Do not use:

- a real mainnet private key
- a wallet that stores valuable assets
- a production payout wallet in local development
