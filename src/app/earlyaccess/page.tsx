"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  color: string;
}

interface CrossParticleProps {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

// Add gtag type declaration
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, string>
    ) => void;
  }
}

const CrossParticle = ({ x, y, z, size, color }: CrossParticleProps) => (
  <motion.svg
    className="absolute pointer-events-none"
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

interface GlowingCrossProps {
  className?: string;
}

const GlowingCross = ({ className }: GlowingCrossProps) => (
  <motion.svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#d4a574"
    strokeWidth={2}
    animate={{
      opacity: [0.3, 0.8, 0.3],
      scale: [0.9, 1.1, 0.9],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      filter: "drop-shadow(0 0 8px #d4a574)",
    }}
  >
    <path d="M12 2v20M2 12h20" />
  </motion.svg>
);

const EarlyAccessPage = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDevice, setIsCheckingDevice] = useState(true);
  const [error, setError] = useState("");
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  // Generate device fingerprint and check if already registered
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        
        setDeviceFingerprint(visitorId);

        // Check if this device is already registered
        const response = await fetch(`/api/early-access?fingerprint=${visitorId}`);
        const data = await response.json();

        if (data.exists) {
          setRegisteredEmail(data.subscriber.email);
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error('Error generating fingerprint:', error);
      } finally {
        setIsCheckingDevice(false);
      }
    };

    initFingerprint();
  }, []);

  // Particle animation
  useEffect(() => {
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 15 : 25;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 40 - 20,
      size: Math.random() * 1 + 0.4,
      speed: Math.random() * 0.08 + 0.03,
      color: Math.random() > 0.4 ? "#d4a574" : "#f5f5f5",
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5) * 0.2,
            z: p.z + (Math.random() - 0.5) * 0.1,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Collect comprehensive user data
      const userData = {
        email,
        deviceFingerprint,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        referrer: document.referrer || null,
        landingPage: window.location.href,
        utmSource: new URLSearchParams(window.location.search).get('utm_source'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        language: navigator.language || (navigator.languages && navigator.languages[0]),
      };

      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyExists) {
          setError('This email is already registered!');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Success
      setRegisteredEmail(email);
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Optional: Track conversion with analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          event_category: 'early_access',
          event_label: 'signup',
        });
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  // Show loading state while checking device
  if (isCheckingDevice) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#2a1810] via-[#3d2617] to-[#1a0f08] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4a574"
              strokeWidth={2}
              className="w-16 h-16 mx-auto"
              style={{
                filter: "drop-shadow(0 0 10px #d4a574)",
              }}
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </motion.div>
          <p className="text-[#d4a574] text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#2a1810] via-[#3d2617] to-[#1a0f08]">
      {/* Background Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 165, 116, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(212, 165, 116, 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        {particles.map((p) => (
          <CrossParticle key={`particle-${p.id}`} {...p} />
        ))}
      </div>

      {/* Decorative Crosses - Hidden on small mobile */}
      <GlowingCross className="hidden sm:block absolute top-10 left-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 opacity-20" />
      <GlowingCross className="hidden md:block absolute top-20 right-20 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 opacity-15" />
      <GlowingCross className="hidden sm:block absolute bottom-20 left-1/4 w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 opacity-20" />
      <GlowingCross className="hidden md:block absolute bottom-40 right-1/4 w-10 h-10 sm:w-12 sm:h-12 lg:w-18 lg:h-18 opacity-15" />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 sm:py-12 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574] via-[#e2c299] to-[#d4a574] opacity-20 blur-xl" />

                <div className="relative bg-gradient-to-br from-[#3d2617]/90 to-[#2a1810]/90 backdrop-blur-sm border border-[#d4a574]/30 p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl rounded-lg sm:rounded-none">
                  {/* Top Cross Decoration */}
                  <motion.div
                    className="flex justify-center mb-6 sm:mb-8"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d4a574"
                      strokeWidth={2}
                      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                      style={{
                        filter: "drop-shadow(0 0 10px #d4a574)",
                      }}
                    >
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </motion.div>

                  {/* Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-center mb-4 sm:mb-6"
                  >
                    <h1
                      className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-[#e2c299] mb-3 sm:mb-4 tracking-wide leading-tight"
                      style={{
                        fontFamily:
                          "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
                        textShadow: "0 0 20px rgba(212, 165, 116, 0.5)",
                      }}
                    >
                      Faith Inspired
                    </h1>
                    <h2
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#d4a574] mb-3 sm:mb-4"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Coming Soon
                    </h2>
                    <motion.div
                      className="w-24 sm:w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-[#d4a574] to-transparent"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>

                  {/* Subheading */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-center text-[#e2c299]/90 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed px-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Discover our exclusive collection of <span className="text-[#d4a574] font-semibold">Jesus-inspired</span> products. 
                    Join our early access list to receive special blessings, insider updates, 
                    and be first to own <span className="text-[#d4a574] font-semibold">limited edition faith-based items</span>.
                  </motion.p>

                  {/* Form */}
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-[#1a0f08]/50 border-2 border-[#d4a574]/40 text-[#e2c299] placeholder-[#d4a574]/60 focus:outline-none focus:border-[#d4a574] transition-all duration-300 text-sm sm:text-base md:text-lg rounded-md sm:rounded-none"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      <motion.div
                        className="absolute inset-0 border-2 border-[#d4a574] pointer-events-none rounded-md sm:rounded-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-center text-xs sm:text-sm md:text-base bg-red-900/20 border border-red-500/30 rounded-md p-3"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 165, 116, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-[#d4a574] to-[#e2c299] text-[#1a0f08] px-6 py-3 sm:px-8 sm:py-4 uppercase text-base sm:text-lg md:text-xl font-bold tracking-wider relative overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed rounded-md sm:rounded-none"
                      style={{
                        fontFamily:
                          "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
                      }}
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center justify-center space-x-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-2 h-2 bg-[#1a0f08] rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-[#1a0f08] rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-[#1a0f08] rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                          />
                        </motion.div>
                      ) : (
                        "Join the Faith Journey"
                      )}
                      <motion.div
                        className="absolute inset-0 bg-white"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                        style={{ opacity: 0.1 }}
                      />
                    </motion.button>
                  </motion.form>

                  {/* Footer Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-center text-[#d4a574]/60 text-xs sm:text-sm mt-4 sm:mt-6 px-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ✝ We respect your privacy. Unsubscribe at any time. ✝
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Success Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574] via-[#e2c299] to-[#d4a574] opacity-30 blur-2xl" />

                <div className="relative bg-gradient-to-br from-[#3d2617]/90 to-[#2a1810]/90 backdrop-blur-sm border border-[#d4a574]/40 p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl text-center rounded-lg sm:rounded-none">
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2,
                    }}
                    className="flex justify-center mb-6 sm:mb-8"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-[#d4a574] rounded-full blur-xl opacity-50"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#d4a574] to-[#e2c299] rounded-full flex items-center justify-center">
                        <motion.svg
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-[#1a0f08]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        >
                          <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Success Message */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-[#e2c299] mb-4 sm:mb-6 tracking-wide"
                    style={{
                      fontFamily:
                        "'Helvetica Neue', 'Proxima Nova', 'Montserrat', sans-serif",
                      textShadow: "0 0 20px rgba(212, 165, 116, 0.5)",
                    }}
                  >
                    Blessed Be!
                  </motion.h2>

                  <motion.div
                    className="w-24 sm:w-32 h-1 mx-auto bg-gradient-to-r from-transparent via-[#d4a574] to-transparent mb-6 sm:mb-8"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="text-[#e2c299]/90 text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 leading-relaxed px-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {registeredEmail && (
                      <span className="block text-[#d4a574] font-semibold mb-2 text-sm sm:text-base break-all">
                        {registeredEmail}
                      </span>
                    )}
                    Your email has been{" "}
                    <span className="text-[#d4a574] font-semibold">
                      successfully registered
                    </span>
                    !
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="text-[#d4a574]/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    You&apos;re now part of our faith community! Watch your inbox for 
                    <span className="text-[#e2c299] font-semibold"> exclusive early access </span> 
                    to our Jesus-inspired collection and special blessings.
                  </motion.p>

                  {/* Bible Verse */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="border-t border-b border-[#d4a574]/20 py-4 sm:py-6 mb-6 sm:mb-8 px-2"
                  >
                    <p className="text-[#e2c299] italic text-xs sm:text-sm md:text-base mb-2 leading-relaxed">
                      &ldquo;For where two or three gather in my name, there am I with them.&rdquo;
                    </p>
                    <p className="text-[#d4a574]/70 text-xs sm:text-sm">
                      — Matthew 18:20
                    </p>
                  </motion.div>

                  {/* Decorative Elements */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="flex justify-center space-x-3 sm:space-x-4 mb-6 sm:mb-8"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d4a574"
                        strokeWidth={2}
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        style={{
                          filter: "drop-shadow(0 0 8px #d4a574)",
                        }}
                      >
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.3,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e2c299"
                        strokeWidth={2}
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        style={{
                          filter: "drop-shadow(0 0 8px #e2c299)",
                        }}
                      >
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.6,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d4a574"
                        strokeWidth={2}
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        style={{
                          filter: "drop-shadow(0 0 8px #d4a574)",
                        }}
                      >
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Social Proof */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="border-t border-[#d4a574]/20 pt-4 sm:pt-6"
                  >
                    <p className="text-[#d4a574]/60 text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
                      ✝ Join Our Faith Community ✝
                    </p>
                    <div className="flex justify-center space-x-4 sm:space-x-6">
                      {["Instagram", "Facebook", "YouTube"].map((social, index) => (
                        <motion.a
                          key={social}
                          href="#"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.5 + index * 0.1, duration: 0.4 }}
                          whileHover={{
                            scale: 1.2,
                            filter: "drop-shadow(0 0 8px #d4a574)",
                          }}
                          className="text-[#d4a574] hover:text-[#e2c299] transition-colors duration-300"
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-current rounded-full flex items-center justify-center">
                            <span className="text-xs sm:text-sm uppercase font-bold">
                              {social[0]}
                            </span>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#1a0f08] to-transparent pointer-events-none" />
    </div>
  );
};

export default EarlyAccessPage;