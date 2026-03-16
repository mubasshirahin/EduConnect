import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home-page">
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default Home;
