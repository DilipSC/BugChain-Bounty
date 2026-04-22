import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    githubId?: string
    user: DefaultSession["user"] & {
      id?: string
      username?: string
      walletAddress?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    githubId?: string
    userId?: string
    username?: string
    walletAddress?: string
  }
}
