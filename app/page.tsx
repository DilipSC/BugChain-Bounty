"use client"
import Navbar from "@/components/Landing/Navbar";
import HeroSection from "@/components/Landing/HeroSection";
import HowItWorksSection from "@/components/Landing/HowItWorksSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import StatsSection from "@/components/Landing/StatsSection";
import FAQSection from "@/components/Landing/FAQSection";
import CTASection from "@/components/Landing/CTASection";
import Footer from "@/components/Landing/Footer";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
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
