"use client"
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Github } from "lucide-react";
import { signIn } from "next-auth/react";

const Login = () => {
  const handleGitHubLogin = () => {
    signIn("github", { callbackUrl: "/main" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md mx-6"
      >
        <div className="glass rounded-xl p-8 border-glow">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold tracking-widest text-primary text-glow-cyan">
                CHAINGUARD
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold">Welcome to ChainGuard</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Sign in with GitHub to start hunting bugs and earning rewards
            </p>
          </div>

          <button
            onClick={handleGitHubLogin}
            className="w-full cyber-button-solid py-3 rounded-md text-sm inline-flex items-center justify-center gap-2"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>

          <div className="mt-6 text-center">
            <p className="font-body text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

