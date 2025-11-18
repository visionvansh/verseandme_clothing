"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";

// Memoized particle component with reduced complexity
const CrossParticle = ({ x, y, size, color, delay }) => (
  <motion.div
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}rem`,
      height: `${size}rem`,
    }}
    initial={{ opacity: 0.2 }}
    animate={{
      opacity: [0.2, 0.5, 0.2],
      y: [0, 15, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      style={{
        filter: `drop-shadow(0 0 3px ${color})`,
      }}
    >
      <path d="M12 2v20M2 12h20" />
    </svg>
  </motion.div>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reduced particles for mobile, static particles instead of moving
  const particles = useMemo(() => {
    const count = isMobile ? 4 : 8; // Reduce particle count
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (i * (100 / count)) + Math.random() * 10,
      y: Math.random() * 100,
      size: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
      delay: i * 0.3,
    }));
  }, [isMobile]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const closeMenus = useCallback(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, []);

  const menuItems = useMemo(() => 
    ["Home", "Shop", "About", "Lookbook", "Journal"],
    []
  );

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
      {/* Simplified particle background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black/50 pointer-events-none">
        {!isMobile && particles.map((particle) => (
          <CrossParticle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            size={particle.size}
            color={particle.color}
            delay={particle.delay}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto grid grid-cols-3 items-center px-6">
        {/* Desktop Menu */}
        <div className="hidden md:block relative">
          <motion.button
            onClick={toggleDropdown}
            className="text-[#f5f5f5] p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Menu
          </motion.button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-2 w-48 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-[#f5f5f5]/20"
              >
                <ul className="flex flex-col space-y-4">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item === "Shop" ? "/shop" : "#"}
                        className="text-[#f5f5f5] text-lg hover:text-white transition duration-300"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        onClick={closeMenus}
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo */}
        <motion.div
          className="flex justify-center"
          whileHover={{
            scale: 1.05,
            filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))",
          }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="text-3xl font-bold text-[#f5f5f5]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            †VM
          </div>
        </motion.div>

        {/* Desktop Icons */}
        <div className="hidden md:flex justify-end items-center space-x-4">
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

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-4 justify-end col-span-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2"
          >
            <FaShoppingCart className="text-lg" />
          </motion.button>
          <motion.button
            onClick={toggleMenu}
            className="text-[#f5f5f5] focus:outline-none relative w-8 h-8"
            whileTap={{ scale: 0.9 }}
          >
            <motion.svg
              className="w-8 h-8 absolute top-0 left-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ opacity: isOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </motion.svg>
            <motion.svg
              className="w-8 h-8 absolute top-0 left-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M12 2v20M2 12h20" />
            </motion.svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full right-4 mt-3 w-56 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-[#f5f5f5]/20"
          >
            <ul className="flex flex-col space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item === "Shop" ? "/shop" : "#"}
                    className="text-[#f5f5f5] text-lg hover:text-white transition duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    onClick={closeMenus}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

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