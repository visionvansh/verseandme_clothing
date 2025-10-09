"use client";
import HeroSection from "@/components/HeroSection";
import Cta from "@/components/Cta"
import Footer from "@/components/Footer"
export default function Home() {
  console.log("Home page rendered at:", new Date().toISOString());

  // Increased product IDs to ensure sufficient content height
  return (
    <div>
     

  <HeroSection />
  <Cta/>
  <Footer/>
      
    </div>
  );
}