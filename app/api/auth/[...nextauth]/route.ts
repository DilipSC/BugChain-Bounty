import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";
import type { NextAuthOptions, Profile } from "next-auth";

interface GitHubProfile extends Profile {
  id: number;
  login: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo admin:repo_hook"
        }
      }
    })
  ],

  callbacks: {

    async signIn({ user, account, profile }) {

      if (account?.provider === "github" && profile) {

        const githubProfile = profile as GitHubProfile

        const existingUser = await prisma.user.findUnique({
          where: { githubId: String(githubProfile.id) }
        })

        if (!existingUser) {

          await prisma.user.create({
            data: {
              githubId: String(githubProfile.id),
              username: githubProfile.login,
              email: user.email,
              avatar: user.image
            }
          })

        }

      }

      return true
    },

    async jwt({ token, profile, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }

      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GitHubProfile
        token.githubId = String(githubProfile.id)
      }

      if (token.githubId) {
        const dbUser = await prisma.user.findUnique({
          where: { githubId: token.githubId as string }
        })

        if (dbUser) {
          token.userId = dbUser.id
          token.username = dbUser.username
          token.walletAddress = dbUser.walletAddress ?? undefined
        }
      }

      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined
      session.githubId = token.githubId as string | undefined

      if (session.user) {
        session.user.id = token.userId as string | undefined
        session.user.username = token.username as string | undefined
        session.user.walletAddress = token.walletAddress as string | undefined
      }

      return session
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/main`
    }

  },

  pages: {
    signIn: "/login"
  }

}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
