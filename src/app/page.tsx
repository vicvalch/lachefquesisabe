import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { NewsletterSection } from "@/components/landing/NewsletterSection";
import { RecipeVideosSection } from "@/components/landing/RecipeVideosSection";
import { Features } from "@/components/landing/Features";
import { ThermomixSection } from "@/components/landing/ThermomixSection";
import { WhatsAppCtaSection } from "@/components/landing/WhatsAppCtaSection";
import { LeadFormSection } from "@/components/landing/LeadFormSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <NewsletterSection />
        <RecipeVideosSection />
        <Features />
        <ThermomixSection />
        <WhatsAppCtaSection />
        <LeadFormSection />
      </main>
      <Footer />
    </>
  );
}
