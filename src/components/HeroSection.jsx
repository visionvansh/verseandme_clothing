"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaBars, FaCross, FaArrowRight } from "react-icons/fa";

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

const HeaderCross = ({ x, y, size, color }) => (
  <motion.svg
    className="absolute"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}rem`,
      height: `${size}rem`,
      filter: `drop-shadow(0 0 4px ${color})`,
    }}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const CrossIcon = ({ side, color }) => (
  <motion.div
    className={`absolute ${side === "left" ? "left-1/3" : "right-1/3"} bottom-4 sm:bottom-8 transform -translate-x-1/2`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, rotate: [0, 5, -5, 0] }}
    transition={{ duration: 0.8, delay: 1.2, repeat: Infinity, repeatType: "loop" }}
    whileHover={{ scale: 1.2 }}
  >
    <FaCross
      className="text-[#f5f5f5]"
      style={{
        fontSize: "1.2rem sm:1.5rem",
        color: color,
        filter: `drop-shadow(0 0 6px #f5f5f5)`,
      }}
    />
  </motion.div>
);

const ArrowIcon = ({ side }) => (
  <motion.div
    className={`absolute ${side === "right" ? "right-4 sm:right-6" : "left-4 sm:left-6"} bottom-4 sm:bottom-8`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 1.2 }}
    whileHover={{ scale: 1.2 }}
  >
    <FaArrowRight
      style={{
        fontSize: "1.2rem sm:1.5rem",
        color: "#f5f5f5",
        filter: `drop-shadow(0 0 6px #f5f5f5)`,
      }}
    />
  </motion.div>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(scrollY.get() > 0);
    };
    const unsubscribe = scrollY.onChange(handleScroll);
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="fixed w-full top-0 text-white py-2 sm:py-3 z-50 shadow-2xl"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundColor: "transparent" }}
        animate={{ backgroundColor: isScrolled ? "#2b1e1e" : "transparent" }}
        transition={{ duration: 0.1 }}
      >
        {isScrolled && (
          <>
            <HeaderCross x={10} y={50} size={0.6} color="#f5f5f5" />
            <HeaderCross x={50} y={50} size={0.6} color="#f5f5f5" />
            <HeaderCross x={90} y={50} size={0.6} color="#f5f5f5" />
          </>
        )}
      </motion.div>
      <div className="relative z-10 container mx-auto flex items-center justify-between px-4 sm:px-6">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#f5f5f5] p-2 order-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaBars className="text-sm sm:text-base" />
        </motion.button>

        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 order-2"
          style={{
            filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))",
          }}
        >
          <img
            src="/mainlogo.png"
            alt="Logo"
            className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16"
            style={{ fontFamily: "'Playfair Display', serif" }}
          />
        </motion.div>

        <div className="flex items-center space-x-2 sm:space-x-3 order-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2"
          >
            <FaUser className="text-xs sm:text-sm" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#f5f5f5] p-2 flex items-center space-x-1"
          >
            <FaShoppingCart className="text-xs sm:text-sm" />
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs sm:text-sm">(0)</span>
          </motion.button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a0f0b]/95 backdrop-blur-xl rounded-b-xl shadow-2xl p-4 sm:p-5 border border-[#f5f5f5]/20 z-50"
          >
            <ul className="flex flex-col space-y-3">
              {["Home", "Shop", "About", "Lookbook", "Journal"].map(
                (item, index) => (
                  <li key={index}>
                    <a
                      href={item === "Shop" ? "/shop" : "#"}
                      className="text-[#f5f5f5] text-sm sm:text-base hover:text-white transition duration-300"
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
    </motion.header>
  );
};

const HomePage = () => {
  const [heroParticles, setHeroParticles] = useState([]);
  const [bg2Particles, setBg2Particles] = useState([]);
  const [bg3Particles, setBg3Particles] = useState([]);
  const [bg4Particles, setBg4Particles] = useState([]);
  const [bg5Particles, setBg5Particles] = useState([]);
  const [bg6Particles, setBg6Particles] = useState([]);
  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 300], [0, 20]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const heroParticleCount = isMobile ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 7) + 6;
    const newHeroParticles = Array.from({ length: heroParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setHeroParticles(newHeroParticles);

    const bg2ParticleCount = isMobile ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 7) + 6;
    const newBg2Particles = Array.from({ length: bg2ParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setBg2Particles(newBg2Particles);

    const bg3ParticleCount = isMobile ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 7) + 6;
    const newBg3Particles = Array.from({ length: bg3ParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setBg3Particles(newBg3Particles);

    const bg4ParticleCount = isMobile ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 7) + 6;
    const newBg4Particles = Array.from({ length: bg4ParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setBg4Particles(newBg4Particles);

    const bg5ParticleCount = isMobile ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 7) + 6;
    const newBg5Particles = Array.from({ length: bg5ParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setBg5Particles(newBg5Particles);

    const bg6ParticleCount = isMobile ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 7) + 6;
    const newBg6Particles = Array.from({ length: bg6ParticleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 20 - 10,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.08 + 0.04,
      color: Math.random() > 0.7 ? "#fff9e6" : "#f5f5f5",
    }));
    setBg6Particles(newBg6Particles);

    const particleInterval = setInterval(() => {
      setHeroParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
      setBg2Particles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
      setBg3Particles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
      setBg4Particles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
      setBg5Particles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
      setBg6Particles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.1,
            z: p.z + (Math.random() - 0.5) * 0.05,
          }))
          .map((p) => ({
            ...p,
            y: p.y > 100 ? 0 : p.y < 0 ? 100 : p.y,
            x: p.x > 100 ? 0 : p.x < 0 ? 100 : p.x,
          }))
      );
    }, 60);

    return () => clearInterval(particleInterval);
  }, []);

  return (
    <div className="relative">
      <Header />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative min-h-[80vh] sm:min-h-[90vh] md:min-h-screen flex items-center justify-center pt-16 z-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg1.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
        }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroParticles.map((particle) => (
            <CrossParticle
              key={`hero-${particle.id}`}
              x={particle.x}
              y={particle.y}
              z={particle.z}
              size={particle.size}
              color={particle.color}
            />
          ))}
        </div>
        <motion.div
          className="absolute bottom-10 sm:bottom-12 md:bottom-20 left-0 right-0 text-xs sm:text-sm md:text-base font-thin tracking-widest uppercase text-white pb-2 sm:pb-3 text-center"
          style={{
            fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
          }}
        >
          SECRET SALE 2025<br />SMS & EMAIL ONLY
        </motion.div>
        <motion.a
          href="/product"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 mx-auto text-center text-white text-xs sm:text-sm md:text-base font-light tracking-widest uppercase px-4 sm:px-5 md:px-6 py-1 sm:py-1.5 md:py-2 border-white border-2 md:border-3 hover:border-[4px] bg-transparent hover:bg-white hover:text-black transition-all duration-300 w-fit"
          style={{
            fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Access Now
        </motion.a>
      </motion.section>

      <div
        className="w-full h-0.5"
        style={{
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
        }}
      ></div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="relative min-h-[80vh] sm:min-h-[90vh] md:min-h-screen flex items-center justify-center z-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
        }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          {bg2Particles.map((particle) => (
            <CrossParticle
              key={`bg2-${particle.id}`}
              x={particle.x}
              y={particle.y}
              z={particle.z}
              size={particle.size}
              color={particle.color}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 text-center text-base sm:text-lg md:text-xl font-thin tracking-wide uppercase text-white"
          style={{
            fontFamily: "'Helvetic', sans-serif",
          }}
        >
          Wear Your Faith
        </motion.div>
        <motion.a
          href="/shop"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 mx-auto text-center text-white text-xs sm:text-sm md:text-base font-light tracking-widest uppercase border-white border-2 md:border-3 hover:border-[4px] bg-transparent hover:bg-white hover:text-black transition-all duration-300 w-fit px-6 sm:px-7 md:px-8 py-1 sm:py-1.5 md:py-2"
          style={{
            fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Buy Now
        </motion.a>
        <CrossIcon side="left" color="#f5f5f5" />
        <CrossIcon side="right" color="#3c2f2f" />
      </motion.section>

      <div
        className="w-full h-0.5"
        style={{
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
        }}
      ></div>

      <div className="flex flex-col md:flex-row w-full gap-0.5 z-20">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg3.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            {bg3Particles.map((particle) => (
              <CrossParticle
                key={`bg3-${particle.id}`}
                x={particle.x}
                y={particle.y}
                z={particle.z}
                size={particle.size}
                color={particle.color}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            CARRY FAITH. CARRY PURPOSE.
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now →
          </motion.a>
        </motion.section>

        <div className="hidden md:block w-0.5 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"></div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg4.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            {bg4Particles.map((particle) => (
              <CrossParticle
                key={`bg4-${particle.id}`}
                x={particle.x}
                y={particle.y}
                z={particle.z}
                size={particle.size}
                color={particle.color}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            WALK IN FAITH. WEAR WITH PURPOSE.
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now →
          </motion.a>
        </motion.section>
      </div>

      <div
        className="w-full h-0.5"
        style={{
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
        }}
      ></div>

      <div className="flex flex-col md:flex-row w-full gap-0.5 z-20">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg5.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            {bg5Particles.map((particle) => (
              <CrossParticle
                key={`bg5-${particle.id}`}
                x={particle.x}
                y={particle.y}
                z={particle.z}
                size={particle.size}
                color={particle.color}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            SHOP ALL
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now →
          </motion.a>
          <CrossIcon side="right" color="#f5f5f5" />
        </motion.section>

        <div className="hidden md:block w-0.5 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"></div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg6.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden">
            {bg6Particles.map((particle) => (
              <CrossParticle
                key={`bg6-${particle.id}`}
                x={particle.x}
                y={particle.y}
                z={particle.z}
                size={particle.size}
                color={particle.color}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            STEP IN HIS PATH. WALK IN HIS LOVE.
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now →
          </motion.a>
          <CrossIcon side="right" color="#f5f5f5" />
        </motion.section>
      </div>

      <div
        className="w-full h-0.5"
        style={{
          backgroundColor: "white",
        }}
      ></div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@300;400;700&family=Proxima+Nova:wght@300;400;700&family=Montserrat:wght@300;400;700&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
};

export default HomePage;