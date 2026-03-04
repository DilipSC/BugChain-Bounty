"use client";

import { motion } from "framer-motion";
import { Github, Bug, GitPullRequest, Wallet } from "lucide-react";

const steps = [
  {
    icon: Github,
    title: "Connect GitHub",
    description: "Link your repository to ChainGuard. Our protocol scans your codebase and creates a smart contract-backed bounty program automatically.",
    color: "text-primary",
  },
  {
    icon: Bug,
    title: "Issues = Bounties",
    description: "Every GitHub issue tagged with a bounty label becomes a live on-chain bounty. Set severity levels and reward tiers directly from your repo.",
    color: "text-neon-green",
  },
  {
    icon: GitPullRequest,
    title: "Merged PR = Payout",
    description: "When a hunter's pull request is reviewed and merged, the smart contract automatically releases the bounty funds. No middlemen, no delays.",
    color: "text-neon-purple",
  },
  {
    icon: Wallet,
    title: "Instant Crypto Rewards",
    description: "Funds are distributed instantly via blockchain. Hunters receive rewards in ETH, USDC, or project tokens directly to their wallet.",
    color: "text-neon-cyan",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="font-mono text-xs tracking-[0.3em] text-primary/60 uppercase">Protocol Flow</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-4 text-glow-cyan">
            How ChainGuard Works
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            From repo to rewards in four seamless steps. Fully automated, fully on-chain.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="glass rounded-lg p-6 h-full border-glow hover:border-primary/30 transition-all duration-500">
                {/* Step number */}
                <div className="font-display text-6xl font-black text-primary/5 absolute top-4 right-4">
                  0{i + 1}
                </div>

                <div className={`${step.color} mb-4`}>
                  <step.icon className="h-8 w-8" />
                </div>

                <h3 className="font-display text-lg font-semibold mb-3">{step.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
