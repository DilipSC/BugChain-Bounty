import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import prisma from "@/lib/prisma";
import type { Profile } from "next-auth";

interface GitHubProfile extends Profile {
  id: number;
  login: string;
}

const handler = NextAuth({
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

      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GitHubProfile
        token.githubId = String(githubProfile.id)
      }

      return token
    },

    async session({ session, token }) {

      if (session.user && token.githubId) {

        const dbUser = await prisma.user.findUnique({
          where: { githubId: token.githubId as string }
        })

        if (dbUser) {
          ;(session.user as any).id = dbUser.id
        }

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

})

export { handler as GET, handler as POST }