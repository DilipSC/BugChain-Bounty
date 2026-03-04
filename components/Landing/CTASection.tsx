"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

      <div className="relative container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl p-12 md:p-20 border-glow max-w-4xl mx-auto"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-glow-cyan mb-6">
            Ready to Secure <br className="hidden sm:block" /> Your Protocol?
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join 120+ blockchain projects that trust ChainGuard to find and fix critical
            vulnerabilities before they hit production.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="cyber-button-solid px-10 py-4 rounded-md text-sm inline-flex items-center justify-center gap-2"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
