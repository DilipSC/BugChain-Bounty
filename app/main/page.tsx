"use client"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, LogOut, Github, Award, TrendingUp } from "lucide-react";

const MainPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <Shield className="h-12 w-12 text-primary animate-pulse" />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      <div className="relative">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold tracking-widest text-primary text-glow-cyan">
                  CHAINGUARD
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="h-10 w-10 rounded-full border-2 border-primary/50"
                    />
                  )}
                  <div className="text-right">
                    <p className="font-semibold text-sm">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="cyber-button-outline px-4 py-2 rounded-md text-sm inline-flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl font-bold mb-2">
              Welcome back, <span className="text-primary text-glow-cyan">{session.user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-muted-foreground mb-12">
              Your bug bounty hunting dashboard
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass rounded-xl p-6 border-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-primary">0</span>
                </div>
                <h3 className="font-display font-semibold">Bugs Found</h3>
                <p className="text-sm text-muted-foreground">Total vulnerabilities discovered</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass rounded-xl p-6 border-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-primary">0</span>
                </div>
                <h3 className="font-display font-semibold">Tokens Earned</h3>
                <p className="text-sm text-muted-foreground">BCH tokens in your wallet</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass rounded-xl p-6 border-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Github className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-primary">Connected</span>
                </div>
                <h3 className="font-display font-semibold">GitHub Status</h3>
                <p className="text-sm text-muted-foreground">Account linked successfully</p>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass rounded-xl p-6 border-glow"
            >
              <h2 className="font-display text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No activity yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start hunting for bugs to see your activity here!
                </p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 text-center"
            >
              <h2 className="font-display text-2xl font-bold mb-6">Ready to start hunting?</h2>
              <button className="cyber-button-solid px-8 py-4 rounded-lg text-lg">
                Browse Active Programs
              </button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainPage;
