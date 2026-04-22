"use client"
import Navbar from "@/components/Landing/Navbar";
import HeroSection from "@/components/Landing/HeroSection";
import HowItWorksSection from "@/components/Landing/HowItWorksSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import StatsSection from "@/components/Landing/StatsSection";
import FAQSection from "@/components/Landing/FAQSection";
import CTASection from "@/components/Landing/CTASection";
import Footer from "@/components/Landing/Footer";
import Link from "next/link";
import { Search } from "lucide-react";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <section className="container mx-auto px-6 pt-4">
          <Link
            href="/bounties"
            className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Browse Live Bounties
          </Link>
        </section>
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

export default Index;
