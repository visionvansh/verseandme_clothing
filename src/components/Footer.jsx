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
      filter: `drop-shadow(0 0 4px ${color}) blur(${Math.abs(z) / 15}px)`,
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    animate={{
      opacity: [0.2, 0.7, 0.2],
      rotate: [0, 15, -15, 0],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const CrossSVG = ({ color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    className="w-4 h-4 sm:w-6 "
    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
  >
    <path d="M12 2v20M2 12h20" />
  </svg>
);

const Footer = () => {
  const [footerParticles, setFooterParticles] = useState([]);

  useEffect(() => {
    const particleCount = Math.floor(Math.random() * 5) + 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.06 + 0.03,
      color: Math.random() > 0.5 ? "#fff9e6" : "#f5f5f5",
    }));
    setFooterParticles(newParticles);

    const interval = setInterval(() => {
      setFooterParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.15,
            z: p.z + (Math.random() - 0.5) * 0.07,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative w-full overflow-hidden h-auto sm:min-h-[calc(100vw*(4.5/16))]">
      {/* Background Image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/mob1.png"
          alt="Mobile Background"
          className="w-full h-[100%] min-h-screen object-cover object-right sm:hidden"
          style={{ aspectRatio: "16/9" }}
        />
        <img
          src="/bg10n.png"
          alt="Footer Background"
          className="w-full h-[calc(100vw*(4.5/16))] object-cover object-center hidden sm:block"
          style={{ aspectRatio: "16/9" }}
        />
        <div className="absolute inset-0 bg-black/40 z-2" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        {footerParticles.map((p) => (
          <CrossParticle key={`footer-${p.id}`} {...p} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-6 py-10 sm:py-12 text-[#e2c299] max-w-[90%] sm:max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {/* Shipping & Returns */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">Shipping and Returns</h3>
            <ul className="space-y-2 text-sm sm:text-base md:text-xl">
              {["Store Policy", "About Us", "SMS Terms", "Ambassador Form"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Helpful Links */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">Helpful Links</h3>
            <ul className="space-y-2 text-sm sm:text-base md:text-xl">
              <li><a href="#" className="hover:text-white transition duration-300">Search</a></li>
              <li><a href="#" className="hover:text-white transition duration-300">Contact Us</a></li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">Our Mission</h3>
            <p className="text-sm sm:text-base md:text-xl">
              Inspiring a God fearing generation.
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">Join Our Club</h3>
            <p className="mb-4 text-sm sm:text-base md:text-xl">
              Stay up to date with the new collections, products and exclusive offers.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-2 sm:px-4 py-1.5 sm:py-2 bg-transparent border border-[#e2c299] text-[#e2c299] placeholder-[#e2c299] focus:outline-none text-sm sm:text-base md:text-xl"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#e2c299] text-black px-2 sm:px-4 py-1.5 sm:py-2 uppercase font-bold text-sm sm:text-base md:text-xl"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm md:text-base text-[#d9cbb5]">
          <span></span>
          <span className="mt-2 md:mt-0">© 2025, verseandme.</span>
        </div>
      </div>

      {/* Animated Crosses Bottom */}
      <motion.div
        className="absolute left-1/4 bottom-2 sm:bottom-4"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <CrossSVG color="#f5f5f5" />
      </motion.div>
      <motion.div
        className="absolute right-1/4 bottom-2 sm:bottom-4"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <CrossSVG color="#f5f5f5" />
      </motion.div>
    </footer>
  );
};

export default Footer;