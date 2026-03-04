"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image src='/hero-bg.jpg' alt="" fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
      <div className="absolute inset-0 bg-grid" />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-primary/20 animate-scan-line" />
      </div>

      <div className="relative container mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block font-mono text-xs tracking-[0.3em] text-primary/70 border border-primary/20 px-4 py-1.5 rounded-full mb-8 uppercase">
            Blockchain Security Protocol v2.0
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6 text-glow-cyan"
        >
          <span className="text-foreground">Hunt Bugs.</span>
          <br />
          <span className="text-primary">Earn Crypto.</span>
          <br />
          <span className="text-foreground">Secure Web3.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Connect your GitHub repo. Every issue is a bounty. Every merged PR unlocks funds.
          The most transparent bug bounty platform on the blockchain.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login"
            className="cyber-button-solid px-8 py-3.5 rounded-md text-sm inline-flex items-center justify-center gap-2"
          >
            Start Hunting <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="cyber-button px-8 py-3.5 rounded-md text-sm text-primary inline-flex items-center justify-center gap-2"
          >
            <Github className="h-4 w-4" /> How It Works
          </a>
        </motion.div>

        {/* Stats ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "$12M+", label: "Bounties Paid" },
            { value: "4,200+", label: "Bugs Found" },
            { value: "850+", label: "White Hats" },
            { value: "120+", label: "Projects Secured" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-primary text-glow-cyan">
                {stat.value}
              </div>
              <div className="font-body text-xs text-muted-foreground tracking-wider uppercase mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
