"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Wallet, Link2, CheckCircle2 } from "lucide-react"

function shortAddress(address?: string | null) {
  if (!address) {
    return "No wallet saved"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnectPanel() {
  const { data: session, update } = useSession()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    setError("")
    setSuccess("")

    if (!window.ethereum) {
      setError("MetaMask or another injected wallet is required.")
      return
    }

    setLoading(true)

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[]
      const walletAddress = accounts[0]

      const response = await fetch("/api/wallet", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save wallet")
      }

      await update()
      setSuccess("Wallet saved. If your PR gets merged, payouts can target this address.")
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Could not connect wallet")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-border/60 bg-secondary/20 p-5">
        <h3 className="font-display text-xl text-primary mb-2">Connect Wallet To Receive Payouts</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in first, then connect MetaMask on Base Sepolia so the app knows where to send bounty payouts.
        </p>
        <Link href="/login" className="cyber-button-solid px-4 py-3 rounded-md text-sm inline-flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Sign In With GitHub
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl text-primary">Developer Wallet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect MetaMask on Base Sepolia before or after you submit the pull request.
          </p>
        </div>
        <Wallet className="h-5 w-5 text-primary" />
      </div>

      <div className="rounded-lg border border-border/60 bg-background/30 p-4 mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Saved wallet</p>
        <p className="font-mono text-primary">{shortAddress(session.user.walletAddress)}</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 mb-4">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300 mb-4 inline-flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          {success}
        </div>
      ) : null}

      <button
        onClick={() => void connectWallet()}
        disabled={loading}
        className="cyber-button-solid px-4 py-3 rounded-md text-sm inline-flex items-center gap-2 disabled:opacity-60"
      >
        <Link2 className="h-4 w-4" />
        {loading ? "Connecting..." : session.user.walletAddress ? "Reconnect MetaMask" : "Connect MetaMask"}
      </button>
    </div>
  )
}
