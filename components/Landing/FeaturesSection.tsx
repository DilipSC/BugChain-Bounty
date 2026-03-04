"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Eye, Code2, Trophy } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: ShieldCheck,
    title: "Smart Contract Escrow",
    description: "Bounty funds are locked in audited smart contracts. Automatic release on merge — no trust required.",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "No waiting periods. Merged PR triggers instant on-chain settlement in seconds.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Proofs",
    description: "Sensitive vulnerability reports are encrypted with ZK proofs, ensuring only authorized parties can view details.",
  },
  {
    icon: Eye,
    title: "Transparent Audit Trail",
    description: "Every bounty, submission, and payout is recorded on-chain for full transparency and accountability.",
  },
  {
    icon: Code2,
    title: "GitHub-Native Workflow",
    description: "No context switching. Hunters work directly in your GitHub repo with familiar tools and processes.",
  },
  {
    icon: Trophy,
    title: "Reputation & Rankings",
    description: "On-chain reputation scores and leaderboards that follow hunters across the entire ecosystem.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32">
      <div className="relative container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-mono text-xs tracking-[0.3em] text-neon-green/60 uppercase">
              Security Infrastructure
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 text-glow-green">
              Built for Web3 Security
            </h2>
            <p className="font-body text-muted-foreground mt-4 text-lg leading-relaxed">
              ChainGuard combines the power of blockchain with the familiarity of GitHub
              to create the most secure and efficient bug bounty platform in the industry.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <Image
                src='/shield-icon.jpg'
                alt="Blockchain security shield visualization"
                width={400}
                height={400}
                className="rounded-lg border border-border w-full animate-float"
              />
              <Image
                src='/bug-scan.jpg'
                alt="Bug detection scanning interface"
                width={400}
                height={400}
                className="rounded-lg border border-border w-full mt-8 animate-float"
                style={{ animationDelay: "2s" }}
              />
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-lg p-6 group hover:border-primary/20 transition-all duration-500"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{feature.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
