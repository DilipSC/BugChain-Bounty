import { Shield } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-bold tracking-widest text-primary">CHAINGUARD</span>
            </div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              The most transparent blockchain bug bounty platform. Powered by smart contracts, driven by community.
            </p>
          </div>

          {[
            {
              title: "Platform",
              links: ["How It Works", "Features", "Pricing", "Documentation"],
            },
            {
              title: "Community",
              links: ["Discord", "Twitter", "GitHub", "Blog"],
            },
            {
              title: "Legal",
              links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-xs font-semibold tracking-wider uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 ChainGuard. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
