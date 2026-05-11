import React from "react";
import HeroSection from "@/components/layout/HeroSection";
import VerticalTabs from "@/components/layout/VerticalTabs";
import CategoryResourcesSection from "@/components/layout/CategoryResourcesSection";
import Footer from "@/components/layout/Footer";

export default function HomePage({ language = "km" }) {
  return (
    <>
      <HeroSection language={language} />
      <VerticalTabs language={language} />
      <CategoryResourcesSection language={language} />
      <Footer language={language} />
    </>
  );
}
