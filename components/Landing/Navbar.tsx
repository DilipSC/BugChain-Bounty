"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Stats", href: "#stats" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold tracking-widest text-primary text-glow-cyan">
            CHAINGUARD
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase"
            >
              {link.label}
            </a>
          ))}
          
          <Link href="/login" className="cyber-button px-5 py-2 rounded text-sm text-primary">
            Login
          </Link>
          <Link href="/signup" className="cyber-button-solid px-5 py-2 rounded text-sm">
            Sign Up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-sm tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link href="/login" className="cyber-button px-5 py-2 rounded text-sm text-primary text-center">
                Login
              </Link>
              <Link href="/signup" className="cyber-button-solid px-5 py-2 rounded text-sm text-center">
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
