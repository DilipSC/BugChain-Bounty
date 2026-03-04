"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const StatsSection = () => {
  return (
    <section id="stats" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Image
              src='/merge-visual.jpg'
              alt="Code merge and contribution visualization"
              width={600}
              height={400}
              className="rounded-lg border border-border w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-mono text-xs tracking-[0.3em] text-neon-purple/60 uppercase">
              Track Record
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-8">
              Trusted by the <span className="text-primary text-glow-cyan">Top Protocols</span>
            </h2>

            <div className="space-y-6">
              {[
                { label: "Total Value Locked in Bounties", value: "$12.4M", sub: "Across 120+ protocols" },
                { label: "Average Response Time", value: "< 4hrs", sub: "First triage within minutes" },
                { label: "Critical Bugs Prevented", value: "340+", sub: "Before they reached mainnet" },
                { label: "Hunter Satisfaction Rate", value: "98.7%", sub: "Based on 2,400+ payouts" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass rounded-lg p-5 flex items-center gap-6"
                >
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary text-glow-cyan min-w-[100px]">
                    {item.value}
                  </div>
                  <div>
                    <div className="font-body font-semibold text-sm">{item.label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
