import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

function Home({ onRequestTutor }) {
  return (
    <div className="home-page">
      <Hero onRequestTutor={onRequestTutor} />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default Home;
