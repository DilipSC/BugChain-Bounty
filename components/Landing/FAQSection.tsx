"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I start a bug bounty program?",
    a: "Simply connect your GitHub repository, tag issues with bounty labels and severity levels, and fund your smart contract escrow. ChainGuard handles the rest — from hunter matching to automated payouts.",
  },
  {
    q: "How are bounty payouts triggered?",
    a: "When a hunter submits a fix via pull request and it gets reviewed and merged by the repository maintainers, the smart contract automatically releases the escrowed funds to the hunter's wallet.",
  },
  {
    q: "What cryptocurrencies are supported for payouts?",
    a: "We currently support ETH, USDC, USDT, and DAI on Ethereum and Polygon. We're also adding support for Solana and Arbitrum in Q2 2026.",
  },
  {
    q: "Is my vulnerability report kept confidential?",
    a: "Yes. All vulnerability reports are encrypted and can only be viewed by authorized project maintainers. We use zero-knowledge proofs to verify report validity without exposing sensitive details.",
  },
  {
    q: "What fees does ChainGuard charge?",
    a: "ChainGuard charges a 5% platform fee on successful payouts. There are no upfront costs, listing fees, or monthly subscriptions. You only pay when bugs are actually found and fixed.",
  },
  {
    q: "Can I use ChainGuard for private repositories?",
    a: "Absolutely. We support both public and private repositories. For private repos, hunters sign NDAs enforced via smart contracts before gaining access to the codebase.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-32">
      <div className="relative container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs tracking-[0.3em] text-primary/60 uppercase">FAQ</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-lg px-6 border-none"
              >
                <AccordionTrigger className="font-body font-semibold text-sm hover:text-primary transition-colors hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
