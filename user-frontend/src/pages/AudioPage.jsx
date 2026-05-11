import React from "react";
import EventAudioSection from "@/components/layout/EventAudioSection";
import Footer from "@/components/layout/Footer";

export default function AudioPage({ language = "km" }) {
  return (
    <>
      <div className="h-[104px] sm:h-20 lg:h-[72px]" />
      <EventAudioSection language={language} />
      <Footer language={language} />
    </>
  );
}
