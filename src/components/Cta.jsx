"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

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
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 3.5 + index * 0.3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.2,
      }}
    >
      <path d="M12 2v20M2 12h20" />
    </motion.svg>
  );
};

const CTASection = () => {
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
  const ctaParticles = useMemo(() => {
    const count = isMobile ? 5 : 8;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.6 + 0.4,
      color: Math.random() > 0.5 ? "#fff9e6" : "#f5f5f5"
    }));
  }, [isMobile]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8 }}
      className="relative w-full overflow-hidden isolate"
    >
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <picture>
          {/* Mobile image */}
          <source 
            media="(max-width: 640px)" 
            srcSet="/mob1.png"
          />
          {/* Desktop image */}
          <source 
            media="(min-width: 641px)" 
            srcSet="/bg9.png"
          />
          <img
            src="/bg9.png"
            alt="Background"
            className="w-full h-full object-cover object-center"
            style={{ 
              aspectRatio: "16/9",
              contentVisibility: "auto",
            }}
            loading="lazy"
            decoding="async"
          />
        </picture>
        
        {/* Mobile Overlay - only on mobile */}
        {isMobile && (
          <img
            src="/mob2.png"
            alt="Mobile Overlay"
            className="absolute top-[-84px] right-[-88px] h-96 w-96"
            style={{
              objectFit: "contain",
              zIndex: 1,
              transform: "scale(1)",
              opacity: 0.9,
              contentVisibility: "auto",
            }}
            loading="lazy"
            decoding="async"
          />
        )}
        
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40 z-2" />
      </div>

      {/* Particle FX - only show if motion is not reduced */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
          {ctaParticles.map((p, index) => (
            <CrossParticle 
              key={`cta-${p.id}`} 
              x={p.x}
              y={p.y}
              size={p.size}
              color={p.color}
              index={index}
            />
          ))}
        </div>
      )}

      {/* CTA Content */}
      <div className="relative z-10 w-full h-[calc(100vw*(10/16))] sm:h-[calc(100vw*(5/16))] flex items-center justify-start px-2 sm:px-6 md:px-20">
        <motion.div 
          className="text-left max-w-full sm:max-w-xl text-white ml-1 sm:ml-0"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
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
              className="px-2 sm:px-5 py-1.5 sm:py-3 rounded-none w-52 sm:w-100 bg-transparent border border-[#e2c299] text-[#e2c299] placeholder-[#e2c299] focus:outline-none text-xs sm:text-base transition-colors duration-200 focus:border-[#f5d9a8]"
              style={{ fontFamily: "'Inter', sans-serif" }}
              aria-label="Email address"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#e2c299] text-black px-3 sm:px-6 py-1.5 sm:py-3 uppercase text-xs sm:text-lg font-bold transition-colors duration-200 hover:bg-[#f5d9a8]"
              style={{
                fontFamily: "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif"
              }}
              aria-label="Sign up for newsletter"
            >
              Sign Up
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        /* Ensure proper stacking */
        .isolate {
          isolation: isolate;
        }
      `}</style>
    </motion.section>
  );
};

export default CTASection;