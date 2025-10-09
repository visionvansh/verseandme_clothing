"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const CrossParticle = ({ x, y, z, size, color }) => (
  <motion.svg
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: `translateZ(${z}px) scale(${1 + z / 50})`,
      width: `${size}rem`,
      height: `${size}rem`,
      filter: `drop-shadow(0 0 4px ${color}) blur(${Math.abs(z) / 15}px)`
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    animate={{
      opacity: [0.2, 0.7, 0.2],
      rotate: [0, 15, -15, 0],
      scale: [0.8, 1.2, 0.8]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const CTASection = () => {
  const [ctaParticles, setCtaParticles] = useState([]);

  useEffect(() => {
    const ctaParticleCount = Math.floor(Math.random() * 5) + 10;
    const newCtaParticles = Array.from({ length: ctaParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 30 - 15,
      size: Math.random() * 0.8 + 0.4,
      speed: Math.random() * 0.07 + 0.04,
      color: Math.random() > 0.5 ? "#fff9e6" : "#f5f5f5"
    }));
    setCtaParticles(newCtaParticles);

    const particleInterval = setInterval(() => {
      setCtaParticles(prev =>
        prev.map(p => ({
          ...p,
          y: p.y + p.speed,
          x: p.x + (Math.random() - 0.5) * 0.15,
          z: p.z + (Math.random() - 0.5) * 0.07
        })).map(p => ({
          ...p,
          y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
          x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x
        }))
      );
    }, 50);

    return () => clearInterval(particleInterval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative w-full overflow-hidden"
    >
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/mob1.png"
          alt="Mobile Background"
          className="w-full h-[calc(100vw*(10/16))] object-cover object-right sm:hidden"
          style={{ aspectRatio: "16/9" }}
        />
        <img
          src="/bg9.png"
          alt="Background"
          className="w-full h-[calc(100vw*(6/16))] object-cover object-center hidden sm:block"
          style={{ aspectRatio: "16/9" }}
        />
        <img
          src="/mob2.png"
          alt="Mobile Overlay"
          className="absolute top-[-84] right-[-88] sm:hidden h-96 w-96"
          style={{
            objectFit: "contain",
            zIndex: 1,
            transform: "scale(1)",
            opacity: 0.9
          }}
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40 z-2" />
      </div>

      {/* Particle FX */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        {ctaParticles.map((p) => (
          <CrossParticle key={`cta-${p.id}`} {...p} />
        ))}
      </div>

      {/* CTA Content */}
      <div className="relative z-10 w-full h-[calc(100vw*(10/16))] sm:h-[calc(100vw*(5/16))] flex items-center justify-start px-2 sm:px-6 md:px-20">
        <div className="text-left max-w-full sm:max-w-xl text-white ml-1 sm:ml-0">
          <h1
            className="text-2xl sm:text-5xl md:text-6xl font-bold uppercase text-[#e2c299]"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif"
            }}
          >
            Join Our Club
          </h1>
          <p
            className="text-xs sm:text-lg md:text-xl text-[#e2c299] mt-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Sign up for exclusive deals and&nbsp;
            <span className="block sm:inline">early access to new products.</span>
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-start justify-start gap-2 sm:gap-4 max-w-full">
            <input
              type="email"
              placeholder="Your email"
              className="px-2 sm:px-5 py-1.5 sm:py-3 rounded-none w-52 sm:w-100 bg-transparent border border-[#e2c299] text-[#e2c299] placeholder-[#e2c299] focus:outline-none text-xs sm:text-base"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#e2c299] text-black px-3 sm:px-6 py-1.5 sm:py-3 uppercase text-xs sm:text-lg font-bold"
              style={{
                fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif"
              }}
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CTASection;