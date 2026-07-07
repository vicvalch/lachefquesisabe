import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { About } from "@/components/landing/About";
import { WhatsAppCtaSection } from "@/components/landing/WhatsAppCtaSection";
import { LeadFormSection } from "@/components/landing/LeadFormSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <About />
        <WhatsAppCtaSection />
        <LeadFormSection />
      </main>
      <Footer />
    </>
  );
}
