import { ethers } from "ethers"

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

export function getPayoutConfig() {
  const rpcUrl = process.env.BOUNTY_PAYOUT_RPC_URL
  const privateKey = process.env.BOUNTY_PAYOUT_PRIVATE_KEY
  const chainIdValue = process.env.BOUNTY_PAYOUT_CHAIN_ID

  if (!rpcUrl || !privateKey || !chainIdValue) {
    return null
  }

  const chainId = Number(chainIdValue)

  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error("BOUNTY_PAYOUT_CHAIN_ID must be a positive integer")
  }

  return { rpcUrl, privateKey, chainId }
}

export async function sendNativePayout(params: {
  recipientAddress: string
  amount: string
  chainId: number
}) {
  const config = getPayoutConfig()

  if (!config) {
    throw new Error("Payout wallet is not configured")
  }

  if (config.chainId !== params.chainId) {
    throw new Error(
      `Configured payout chain ${config.chainId} does not match listing chain ${params.chainId}`
    )
  }

  if (!ethers.isAddress(params.recipientAddress)) {
    throw new Error("Invalid recipient wallet address")
  }

  const provider = new ethers.JsonRpcProvider(getRequiredEnv("BOUNTY_PAYOUT_RPC_URL"), config.chainId)
  const wallet = new ethers.Wallet(getRequiredEnv("BOUNTY_PAYOUT_PRIVATE_KEY"), provider)

  const tx = await wallet.sendTransaction({
    to: params.recipientAddress,
    value: ethers.parseEther(params.amount),
  })

  await tx.wait()

  return tx.hash
}

export function normalizeWalletAddress(address: string) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid EVM wallet address")
  }

  return ethers.getAddress(address)
}

