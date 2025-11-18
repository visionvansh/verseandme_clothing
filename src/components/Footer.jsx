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

const CrossSVG = ({ color }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    className="w-4 h-4 sm:w-6"
    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    aria-hidden="true"
  >
    <path d="M12 2v20M2 12h20" />
  </svg>
);

const Footer = () => {
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
  const footerParticles = useMemo(() => {
    const count = isMobile ? 4 : 7;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 0.6 + 0.3,
      color: Math.random() > 0.5 ? "#fff9e6" : "#f5f5f5",
    }));
  }, [isMobile]);

  // ✅ Memoize static navigation data
  const footerSections = useMemo(() => [
    {
      title: "Shipping and Returns",
      links: [
        { text: "Store Policy", href: "#" },
        { text: "About Us", href: "#" },
        { text: "SMS Terms", href: "#" },
        { text: "Ambassador Form", href: "#" }
      ]
    },
    {
      title: "Helpful Links",
      links: [
        { text: "Search", href: "#" },
        { text: "Contact Us", href: "#" }
      ]
    }
  ], []);

  return (
    <footer className="relative w-full overflow-hidden h-auto sm:min-h-[calc(100vw*(4.5/16))] isolate">
      {/* Background Image with dark overlay */}
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
            srcSet="/bg10n.png"
          />
          <img
            src="/bg10n.png"
            alt="Footer Background"
            className="w-full h-full object-cover object-center"
            style={{ 
              aspectRatio: "16/9",
              contentVisibility: "auto",
            }}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-black/40 z-2" />
      </div>

      {/* Particles - only show if motion is not reduced */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
          {footerParticles.map((p, index) => (
            <CrossParticle 
              key={`footer-${p.id}`} 
              x={p.x}
              y={p.y}
              size={p.size}
              color={p.color}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-6 py-10 sm:py-12 text-[#e2c299] max-w-[90%] sm:max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {/* Dynamic Sections */}
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm sm:text-base md:text-xl">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <a 
                      href={link.href} 
                      className="hover:text-white transition-colors duration-200 inline-block"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Mission */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">
              Our Mission
            </h3>
            <p className="text-sm sm:text-base md:text-xl">
              Inspiring a God fearing generation.
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 uppercase">
              Join Our Club
            </h3>
            <p className="mb-4 text-sm sm:text-base md:text-xl">
              Stay up to date with the new collections, products and exclusive offers.
            </p>
            <form 
              className="flex flex-col space-y-2"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription"
            >
              <input
                type="email"
                placeholder="Your email"
                className="px-2 sm:px-4 py-1.5 sm:py-2 bg-transparent border border-[#e2c299] text-[#e2c299] placeholder-[#e2c299] focus:outline-none text-sm sm:text-base md:text-xl transition-colors duration-200 focus:border-[#f5d9a8]"
                aria-label="Email address"
                required
              />
              <motion.button
                whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                whileTap={!shouldReduceMotion ? { scale: 0.95 } : {}}
                className="bg-[#e2c299] text-black px-2 sm:px-4 py-1.5 sm:py-2 uppercase font-bold text-sm sm:text-base md:text-xl transition-colors duration-200 hover:bg-[#f5d9a8]"
                type="submit"
                aria-label="Subscribe to newsletter"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm md:text-base text-[#d9cbb5]">
          <span aria-hidden="true"></span>
          <span className="mt-2 md:mt-0">© 2025, verseandme.</span>
        </div>
      </div>

      {/* Animated Crosses Bottom - only if motion is not reduced */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute left-1/4 bottom-2 sm:bottom-4 pointer-events-none"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
          >
            <CrossSVG color="#f5f5f5" />
          </motion.div>
          <motion.div
            className="absolute right-1/4 bottom-2 sm:bottom-4 pointer-events-none"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            style={{ willChange: "transform" }}
          >
            <CrossSVG color="#f5f5f5" />
          </motion.div>
        </>
      )}

      <style jsx>{`
        /* Ensure proper stacking */
        .isolate {
          isolation: isolate;
        }
      `}</style>
    </footer>
  );
};

export default Footer;