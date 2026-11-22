import { useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Philosophy } from "./components/Philosophy";
import { Services } from "./components/Services";
import { HowWeWork } from "./components/HowWeWork";
import { Works } from "./components/Works";
import { Journal } from "./components/Journal";
import { Company } from "./components/Company";
import { InquiryForm } from "./components/InquiryForm";
import { Footer } from "./components/Footer";
import { DEFAULT_THEME_ID } from "./config/themes";
import { DEFAULT_FONT_ID } from "./config/fonts";

export function App() {
  // Design is fixed: colour theme 17 (浅葱と砂) × font 5 (丸ゴシック).
  // The theme/font selector bar was retired; the other palettes and font
  // sets remain defined in config/ and index.css if it is ever restored.
  useEffect(() => {
    document.documentElement.dataset.theme = DEFAULT_THEME_ID;
    document.documentElement.dataset.font = DEFAULT_FONT_ID;
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="sticky top-0 z-40">
        <Header />
      </div>
      <main>
        <Hero />
        <Philosophy />
        <Services />
        <HowWeWork />
        <Works />
        <Journal />
        <Company />
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
}
