"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";

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
    strokeWidth="1.5"
    animate={{
      opacity: [0.2, 0.6, 0.2],
      rotate: [0, 10, -10, 0],
      scale: [0.9, 1.1, 0.9],
    }}
    transition={{
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.7 + 0.4,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setParticles(newParticles);

    const particleInterval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? -10 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
    }, 60);

    return () => clearInterval(particleInterval);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="fixed w-full top-0 text-white py-4 z-50 shadow-2xl border-b border-gradient"
      style={{
        backgroundImage: `url('/bg1.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-black/50">
        {particles.map((particle) => (
          <CrossParticle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            z={particle.z}
            size={particle.size}
            color={particle.color}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto grid grid-cols-3 items-center px-6">
        <div className="hidden md:block relative">
          <motion.button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-[#f5f5f5] p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Menu
          </motion.button>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-48 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-[#f5f5f5]/20"
            >
              <ul className="flex flex-col space-y-4">
                {["Home", "Shop", "About", "Lookbook", "Journal"].map(
                  (item, index) => (
                    <li key={index}>
                      <a
                        href={item === "Shop" ? "/shop" : "#"}
                        className="text-[#f5f5f5] text-lg hover:text-white transition duration-300"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          )}
        </div>

        <motion.div
          className="flex justify-center"
          whileHover={{
            scale: 1.1,
            filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))",
          }}
        >
          <div
            className="text-3xl font-bold text-[#f5f5f5]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            †VM
          </div>
        </motion.div>

        <div className="flex justify-end items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2"
          >
            <FaUser className="text-lg" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2 flex items-center space-x-2"
          >
            <FaShoppingCart className="text-lg" />
            <span style={{ fontFamily: "'Inter', sans-serif" }}>(0)</span>
          </motion.button>
        </div>

        <div className="md:hidden flex items-center space-x-4 justify-end col-span-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2"
          >
            <FaShoppingCart className="text-lg" />
          </motion.button>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#f5f5f5] focus:outline-none w-8 h-8"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className={`w-8 h-8 transition-opacity duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            <svg
              className={`w-8 h-8 absolute top-0 left-0 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </motion.button>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-4 mt-3 w-56 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-[#f5f5f5]/20"
            >
              <ul className="flex flex-col space-y-4">
                {["Home", "Shop", "About", "Lookbook", "Journal"].map(
                  (item, index) => (
                    <li key={index}>
                      <a
                        href={item === "Shop" ? "/shop" : "#"}
                        className="text-[#f5f5f5] text-lg hover:text-white transition duration-300"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        onClick={() => setIsOpen(false)}
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap');
        .border-gradient {
          border-image: linear-gradient(to right, rgba(245, 245, 245, 0.2), rgba(245, 245, 245, 0.5), rgba(245, 245, 245, 0.2)) 1;
        }
      `}</style>
    </motion.header>
  );
};

export default Header;