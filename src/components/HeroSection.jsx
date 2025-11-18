"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { FaCross, FaArrowRight } from "react-icons/fa";

// ✅ Optimized particle with minimal animations
const CrossParticle = ({ x, y, size, color, index }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}rem`,
        height: `${size}rem`,
        filter: `drop-shadow(0 0 3px ${color})`,
        willChange: "opacity",
      }}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      initial={{ opacity: 0 }}
      animate={shouldReduceMotion ? { opacity: 0.3 } : {
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: 4 + index * 0.3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.2,
      }}
    >
      <path d="M12 2v20M2 12h20" />
    </motion.svg>
  );
};

const CrossIcon = ({ side, color }) => (
  <motion.div
    className={`absolute ${side === "left" ? "left-1/3" : "right-1/3"} bottom-4 sm:bottom-8 transform -translate-x-1/2`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 1.2 }}
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

const HomePage = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Generate particles ONCE - memoized, no updates
  const heroParticles = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.4 + 0.3,
      color: Math.random() > 0.6 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  const bg2Particles = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.4 + 0.3,
      color: Math.random() > 0.6 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  const bg3Particles = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.4 + 0.3,
      color: Math.random() > 0.6 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  const bg4Particles = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.4 + 0.3,
      color: Math.random() > 0.6 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  const bg5Particles = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.4 + 0.3,
      color: Math.random() > 0.6 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  const bg6Particles = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.4 + 0.3,
      color: Math.random() > 0.6 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  return (
    <div className="relative">
      {/* ✅ Hero Section - Optimized */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative min-h-[80vh] sm:min-h-[90vh] md:min-h-screen flex items-center justify-center pt-16 z-10 isolate"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg1.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
        }}
      >
        {/* ✅ Only show particles if motion is not reduced */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {heroParticles.map((particle, index) => (
              <CrossParticle
                key={`hero-${particle.id}`}
                x={particle.x}
                y={particle.y}
                size={particle.size}
                color={particle.color}
                index={index}
              />
            ))}
          </div>
        )}
        
        <motion.div
          className="absolute bottom-10 sm:bottom-12 md:bottom-20 left-0 right-0 text-xs sm:text-sm md:text-base font-thin tracking-widest uppercase text-white pb-2 sm:pb-3 text-center z-10"
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
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 mx-auto text-center text-white text-xs sm:text-sm md:text-base font-light tracking-widest uppercase px-4 sm:px-5 md:px-6 py-1 sm:py-1.5 md:py-2 border-white border-2 md:border-3 hover:border-[4px] bg-transparent hover:bg-white hover:text-black transition-all duration-300 w-fit z-10"
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
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative min-h-[80vh] sm:min-h-[90vh] md:min-h-screen flex items-center justify-center z-10 isolate"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
        }}
      >
        {!shouldReduceMotion && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {bg2Particles.map((particle, index) => (
              <CrossParticle
                key={`bg2-${particle.id}`}
                x={particle.x}
                y={particle.y}
                size={particle.size}
                color={particle.color}
                index={index}
              />
            ))}
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 text-center text-base sm:text-lg md:text-xl font-thin tracking-wide uppercase text-white z-10"
          style={{
            fontFamily: "'Helvetic', sans-serif",
          }}
        >
          Wear Your Faith
        </motion.div>
        <motion.a
          href="/shop"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 mx-auto text-center text-white text-xs sm:text-sm md:text-base font-light tracking-widest uppercase border-white border-2 md:border-3 hover:border-[4px] bg-transparent hover:bg-white hover:text-black transition-all duration-300 w-fit px-6 sm:px-7 md:px-8 py-1 sm:py-1.5 md:py-2 z-10"
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh] isolate"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg3.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          {!shouldReduceMotion && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {bg3Particles.map((particle, index) => (
                <CrossParticle
                  key={`bg3-${particle.id}`}
                  x={particle.x}
                  y={particle.y}
                  size={particle.size}
                  color={particle.color}
                  index={index}
                />
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight z-10"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            CARRY FAITH. CARRY PURPOSE.
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300 z-10"
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh] isolate"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg4.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          {!shouldReduceMotion && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {bg4Particles.map((particle, index) => (
                <CrossParticle
                  key={`bg4-${particle.id}`}
                  x={particle.x}
                  y={particle.y}
                  size={particle.size}
                  color={particle.color}
                  index={index}
                />
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight z-10"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            WALK IN FAITH. WEAR WITH PURPOSE.
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300 z-10"
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh] isolate"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg5.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          {!shouldReduceMotion && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {bg5Particles.map((particle, index) => (
                <CrossParticle
                  key={`bg5-${particle.id}`}
                  x={particle.x}
                  y={particle.y}
                  size={particle.size}
                  color={particle.color}
                  index={index}
                />
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight z-10"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            SHOP ALL
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300 z-10"
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative flex-1 min-h-[80vh] sm:min-h-[100vh] md:min-h-[150vh] isolate"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg6.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            aspectRatio: "9/16",
          }}
        >
          {!shouldReduceMotion && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {bg6Particles.map((particle, index) => (
                <CrossParticle
                  key={`bg6-${particle.id}`}
                  x={particle.x}
                  y={particle.y}
                  size={particle.size}
                  color={particle.color}
                  index={index}
                />
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-12 sm:bottom-14 md:bottom-16 text-[#f5f5f5] text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight z-10"
            style={{
              fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
            }}
          >
            STEP IN HIS PATH. WALK IN HIS LOVE.
          </motion.div>
          <motion.a
            href="/product"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute left-4 sm:left-5 md:left-6 bottom-4 sm:bottom-6 md:bottom-8 text-xs sm:text-sm md:text-base font-light tracking-wider uppercase text-[#f5f5f5] hover:underline transition duration-300 z-10"
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
        
        /* ✅ Ensure proper stacking */
        .isolate {
          isolation: isolate;
        }
      `}</style>
    </div>
  );
};

export default HomePage;