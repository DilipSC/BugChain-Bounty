"use client"
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Github } from "lucide-react";

const Signup = () => {
  const handleGitHubSignup = () => {
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-green/5" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md mx-6"
      >
        <div className="glass rounded-xl p-8 border-glow-green">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold tracking-widest text-primary text-glow-cyan">
                CHAINGUARD
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold">Join the Hunt</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Create your account and start earning bounties
            </p>
          </div>

          <button
            onClick={handleGitHubSignup}
            className="w-full cyber-button-solid py-3 rounded-md text-sm inline-flex items-center justify-center gap-2"
          >
            <Github className="h-5 w-5" />
            Sign up with GitHub
          </button>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
