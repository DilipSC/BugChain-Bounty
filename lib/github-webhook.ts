import crypto from "crypto"

export function verifyGitHubSignature(body: string, signatureHeader: string | null) {
  if (!signatureHeader) {
    return false
  }

  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET ?? process.env.GITHUB_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("Missing GITHUB_APP_WEBHOOK_SECRET")
  }

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`
  const actual = Buffer.from(signatureHeader)
  const comparison = Buffer.from(expected)

  if (actual.length !== comparison.length) {
    return false
  }

  return crypto.timingSafeEqual(actual, comparison)
}
