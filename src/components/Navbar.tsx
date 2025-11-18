// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaSearch,
  FaHome,
  FaQuestionCircle,
  FaUser,
  FaTag,
  FaShoppingCart,
  FaLock,
  FaBox,
  FaHeart,
} from "react-icons/fa";
import { IconType } from "react-icons";

// ============ TYPES ============
interface BaseCommandItem {
  icon: IconType;
  label: string;
  href: string;
  color?: string;
  shortcut?: string;
  subtext?: string;
}

interface CommandCategory {
  category: string;
  items: BaseCommandItem[];
}

const Navbar = () => {
  const { cartCount } = useCart();
  const { customer, isAuthenticated, isLoading, logout } = useCustomer();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Command Palette Items
  const commandItems: CommandCategory[] = [
    {
      category: "Shopping",
      items: [
        {
          icon: FaShoppingCart,
          label: "View Cart",
          shortcut: "C",
          href: "/cart",
          color: "text-[#e2c299]",
        },
        {
          icon: FaTag,
          label: "All Products",
          shortcut: "P",
          href: "/product",
          color: "text-blue-400",
        },
      ],
    },
    {
      category: "Navigation",
      items: [
        {
          icon: FaHome,
          label: "Home",
          href: "/",
          color: "text-[#e2c299]",
        },
        {
          icon: FaQuestionCircle,
          label: "Help",
          href: "/help",
          color: "text-cyan-400",
        },
      ],
    },
    ...(isAuthenticated
      ? [
          {
            category: "Account",
            items: [
              {
                icon: FaUser,
                label: "My Account",
                href: "/account",
                color: "text-purple-400",
                subtext: "View orders and settings",
              },
              {
                icon: FaBox,
                label: "Order History",
                href: "/account",
                color: "text-green-400",
              },
            ],
          },
        ]
      : []),
  ];

  // ============ SCROLL HANDLER ============
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ============ KEYBOARD SHORTCUTS ============
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
        setIsProfileOpen(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ============ CLICK OUTSIDE HANDLER ============
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  // ============ LOGOUT HANDLER ============
  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  // ============ COMPUTED VALUES ============
  const filteredCommands = commandItems
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-[99999]"
        style={{ isolation: "isolate" }}
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="relative rounded-xl sm:rounded-2xl overflow-visible">
            {/* Background with scroll effect */}
            <motion.div
              className="absolute inset-0 rounded-xl sm:rounded-2xl"
              animate={{
                opacity: isScrolled ? 1 : 0.9,
              }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                  isScrolled
                    ? "bg-gradient-to-br from-[#1a0f0b]/95 to-black/98 backdrop-blur-3xl"
                    : "bg-gradient-to-br from-[#1a0f0b]/70 to-black/80 backdrop-blur-xl"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#e2c299]/5 to-transparent rounded-xl sm:rounded-2xl" />
              <div
                className={`absolute inset-0 border rounded-xl sm:rounded-2xl transition-all duration-300 ${
                  isScrolled ? "border-[#e2c299]/30" : "border-[#e2c299]/20"
                }`}
              />
              <div className="absolute inset-0 shadow-2xl shadow-[#e2c299]/5 rounded-xl sm:rounded-2xl" />
            </motion.div>

            <div className="relative px-3 sm:px-4 md:px-6 py-2 sm:py-3">
              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] items-center gap-4">
                {/* Left: Logo */}
                <div className="flex items-center gap-4">
                  <Link href="/" className="flex items-center gap-2 group">
                    <motion.div
                      className="relative w-8 h-8 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#e2c299] to-[#d4b589] rounded-xl shadow-lg shadow-[#e2c299]/30" />
                      <div className="absolute inset-0 border border-[#e2c299]/30 rounded-xl" />
                      <div className="relative z-10 text-[#1a0f0b] font-bold text-xs">
                        VM
                      </div>
                    </motion.div>
                    <span className="hidden lg:block text-sm font-semibold text-[#f5f5f5] group-hover:text-[#e2c299] transition-colors">
                      VerseAndMe
                    </span>
                  </Link>
                </div>

                {/* Center: Command Bar */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={() => setIsCommandOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-lg relative rounded-xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2b1e1e]/50 to-black/70 backdrop-blur-sm" />
                    <div className="absolute inset-0 border border-[#e2c299]/20 group-hover:border-[#e2c299]/40 rounded-xl transition-all" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#e2c299]/0 to-transparent group-hover:from-[#e2c299]/5"
                      whileHover={{ opacity: 1 }}
                    />

                    <div className="relative flex items-center gap-3 px-4 py-2.5">
                      <FaSearch className="text-[#f5f5f5]/50 text-sm" />
                      <span className="flex-1 text-left text-sm text-[#f5f5f5]/50">
                        Search products...
                      </span>
                      <kbd className="px-2 py-1 bg-[#2b1e1e]/50 border border-[#e2c299]/20 rounded text-xs text-[#f5f5f5]/60 font-mono">
                        ⌘K
                      </kbd>
                    </div>
                  </motion.button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  {/* Cart Icon */}
                  <Link href="/cart">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative p-2.5 rounded-xl text-[#f5f5f5] hover:text-[#e2c299] transition-colors"
                    >
                      <div className="absolute inset-0 bg-[#2b1e1e]/30 hover:bg-[#2b1e1e]/50 backdrop-blur-sm rounded-xl transition-all" />
                      <div className="absolute inset-0 border border-[#e2c299]/20 hover:border-[#e2c299]/40 rounded-xl transition-all" />
                      <FaShoppingCart className="w-4 h-4 relative z-10" />
                      {cartCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#e2c299] to-[#d4b589] text-[#1a0f0b] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1a0f0b] z-20"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </motion.button>
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative dropdown-container">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="relative p-2.5 rounded-xl text-[#f5f5f5] hover:text-[#e2c299] transition-colors"
                    >
                      <div className="absolute inset-0 bg-[#2b1e1e]/30 hover:bg-[#2b1e1e]/50 backdrop-blur-sm rounded-xl transition-all" />
                      <div className="absolute inset-0 border border-[#e2c299]/20 hover:border-[#e2c299]/40 rounded-xl transition-all" />
                      <FaUserCircle className="w-5 h-5 relative z-10" />
                      {isAuthenticated && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a0f0b] z-20"
                        />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[100000]"
                            onClick={() => setIsProfileOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-72 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl z-[100001]"
                            style={{ top: "calc(100% + 0.5rem)" }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f0b]/98 to-black/98 backdrop-blur-2xl" />
                            <div className="absolute inset-0 border border-[#e2c299]/20 rounded-xl sm:rounded-2xl" />

                            {isAuthenticated && customer ? (
                              <div className="relative">
                                {/* User Info */}
                                <div className="p-6 border-b border-[#e2c299]/10">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e2c299]/20 to-[#d4b589]/20 border-2 border-[#e2c299]/30 flex items-center justify-center">
                                      <FaUser className="text-xl text-[#e2c299]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-base font-bold text-[#f5f5f5] truncate">
                                        {customer.firstName} {customer.lastName}
                                      </h3>
                                      <p className="text-xs text-[#f5f5f5]/60 truncate">
                                        {customer.email}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Quick Stats */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[#2b1e1e]/30 border border-[#e2c299]/10 rounded-lg p-2 text-center">
                                      <p className="text-xs text-[#f5f5f5]/60 mb-1">
                                        Orders
                                      </p>
                                      <p className="text-lg font-bold text-[#e2c299]">
                                        {customer.orders?.edges?.length || 0}
                                      </p>
                                    </div>
                                    <div className="bg-[#2b1e1e]/30 border border-[#e2c299]/10 rounded-lg p-2 text-center">
                                      <p className="text-xs text-[#f5f5f5]/60 mb-1">
                                        Member
                                      </p>
                                      <p className="text-lg font-bold text-[#e2c299]">
                                        {new Date(
                                          customer.createdAt
                                        ).getFullYear()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2">
                                  <Link
                                    href="/account"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2b1e1e]/30 transition-all group"
                                  >
                                    <FaUser className="text-[#e2c299] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-[#f5f5f5] group-hover:text-[#e2c299] transition-colors">
                                      My Account
                                    </span>
                                  </Link>
                                  <Link
                                    href="/account"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#2b1e1e]/30 transition-all group"
                                  >
                                    <FaBox className="text-[#e2c299] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-[#f5f5f5] group-hover:text-[#e2c299] transition-colors">
                                      Order History
                                    </span>
                                  </Link>
                                </div>

                                {/* Logout Button */}
                                <div className="p-4 border-t border-[#e2c299]/10">
                                  <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg font-semibold transition-all text-sm group"
                                  >
                                    <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                                    Sign Out
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Guest View
                              <div className="relative p-6 text-center">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#e2c299]/20 to-[#d4b589]/20 border-2 border-[#e2c299]/30 flex items-center justify-center">
                                  <FaLock className="text-2xl text-[#e2c299]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#f5f5f5] mb-2">
                                  Sign in to Continue
                                </h3>
                                <p className="text-sm text-[#f5f5f5]/60 mb-4">
                                  Access your orders and account settings
                                </p>
                                <Link
                                  href="/account/login"
                                  onClick={() => setIsProfileOpen(false)}
                                  className="block w-full px-4 py-2.5 mb-2 bg-gradient-to-r from-[#e2c299] to-[#d4b589] text-[#1a0f0b] rounded-xl font-semibold hover:scale-105 transition-transform text-sm"
                                >
                                  Sign In
                                </Link>
                                <Link
                                  href="/account/register"
                                  onClick={() => setIsProfileOpen(false)}
                                  className="block w-full px-4 py-2.5 bg-[#2b1e1e]/50 border border-[#e2c299]/20 text-[#f5f5f5] rounded-xl font-semibold hover:bg-[#2b1e1e] transition-colors text-sm"
                                >
                                  Create Account
                                </Link>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="flex md:hidden items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#e2c299] to-[#d4b589] rounded-lg shadow-lg shadow-[#e2c299]/30" />
                    <div className="relative z-10 text-[#1a0f0b] font-bold text-[10px]">
                      VM
                    </div>
                  </div>
                </Link>

                <motion.button
                  onClick={() => setIsCommandOpen(true)}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 max-w-[200px] sm:max-w-xs mx-auto relative rounded-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2b1e1e]/50 to-black/70 backdrop-blur-sm" />
                  <div className="absolute inset-0 border border-[#e2c299]/20 rounded-lg" />

                  <div className="relative flex items-center gap-2 px-3 py-2">
                    <FaSearch className="text-[#f5f5f5]/50 text-xs flex-shrink-0" />
                    <span className="flex-1 text-left text-xs text-[#f5f5f5]/50 truncate">
                      Search...
                    </span>
                  </div>
                </motion.button>

                <Link href="/cart">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-lg"
                  >
                    <div className="absolute inset-0 bg-[#2b1e1e]/30 backdrop-blur-sm rounded-lg" />
                    <FaShoppingCart className="w-5 h-5 text-[#f5f5f5]/60 relative z-10" />
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#e2c299] to-[#d4b589] text-[#1a0f0b] text-[9px] font-bold rounded-full flex items-center justify-center border border-[#1a0f0b] z-20"
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>

                <div className="relative dropdown-container">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative p-0.5 rounded-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[#2b1e1e]/30 backdrop-blur-sm rounded-lg" />
                    <FaUserCircle className="w-7 h-7 text-[#f5f5f5]/60 relative z-10" />
                    {isAuthenticated && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#1a0f0b] z-20"
                      />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Command Palette */}
      <AnimatePresence>
        {isCommandOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200000]"
            />

            <div className="fixed inset-0 z-[200001] flex items-start justify-center pt-[10vh] px-4">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="w-full max-w-2xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f0b]/98 to-black/98 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#e2c299]/10 to-transparent" />
                <div className="absolute inset-0 border border-[#e2c299]/30 rounded-xl sm:rounded-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-[#e2c299]/10">
                    <FaSearch className="text-[#f5f5f5]/60 text-base sm:text-lg flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="flex-1 bg-transparent text-sm sm:text-base text-[#f5f5f5] placeholder-[#f5f5f5]/40 outline-none"
                    />
                    <kbd className="hidden sm:block px-2 py-1 bg-[#2b1e1e]/50 border border-[#e2c299]/20 rounded text-xs text-[#f5f5f5]/60 font-mono">
                      ESC
                    </kbd>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                      filteredCommands.map((category) => (
                        <div key={category.category} className="py-2 sm:py-3">
                          <div className="px-4 sm:px-6 py-1.5 sm:py-2">
                            <h3 className="text-[10px] sm:text-xs font-semibold text-[#f5f5f5]/40 uppercase tracking-wider">
                              {category.category}
                            </h3>
                          </div>
                          <div>
                            {category.items.map((item, index) => (
                              <Link
                                key={index}
                                href={item.href}
                                onClick={() => {
                                  setIsCommandOpen(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-gradient-to-r hover:from-[#e2c299]/10 hover:to-transparent transition-all group"
                              >
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#2b1e1e]/50 border border-[#e2c299]/20 flex items-center justify-center group-hover:border-[#e2c299]/30 transition-all flex-shrink-0">
                                  <item.icon
                                    className={`text-sm sm:text-lg ${
                                      item.color || "text-[#f5f5f5]/60"
                                    } group-hover:scale-110 transition-transform`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs sm:text-sm font-medium text-[#f5f5f5] group-hover:text-[#e2c299] transition-colors truncate">
                                    {item.label}
                                  </div>
                                  {item.subtext && (
                                    <div className="text-[10px] sm:text-xs text-[#f5f5f5]/40 truncate">
                                      {item.subtext}
                                    </div>
                                  )}
                                </div>
                                {item.shortcut && (
                                  <kbd className="hidden sm:block px-2 py-1 bg-[#2b1e1e]/50 border border-[#e2c299]/20 rounded text-xs text-[#f5f5f5]/60 font-mono flex-shrink-0">
                                    {item.shortcut}
                                  </kbd>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 sm:py-16 text-center">
                        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                          🔍
                        </div>
                        <p className="text-xs sm:text-sm text-[#f5f5f5]/40">
                          No results found
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-[#e2c299]/10 flex items-center justify-between">
                    <div className="text-[10px] sm:text-xs text-[#f5f5f5]/40">
                      Press ESC to close
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#f5f5f5]/40">
                      VerseAndMe
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;