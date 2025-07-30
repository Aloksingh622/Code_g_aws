// src/components/Nav_bar.jsx

import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router"; // Use useNavigate for navigation
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import your existing logic and components
import { user_logout, user_delete, check_auth } from "../redux/auth_slice"; // Assuming check_auth is available
import Theme_toggle from "./Theme_toggle";
import User_icon from "./usericon";
import NavLink from "./NavLink"; // Import the new NavLink component

// Import icons
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoLogOutOutline } from 'react-icons/io5';
import { Menu, X } from 'lucide-react';

// --- Main Navbar Component ---
export default function Nav_bar({ theme, toggleTheme }) {
  const { is_authenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  // State for mobile menu and modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // State to detect if the page has been scrolled
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  // Initialize AOS and add scroll listener
  useEffect(() => {
    AOS.init({ once: true, duration: 800 });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide/show navbar based on scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleLogout = () => {
    dispatch(user_logout())
      .unwrap()
      .then(() => {
        dispatch(check_auth());
        navigate('/');
      })
      .catch((err) => console.error('Logout failed', err));
  };

  const handleConfirmDelete = () => {
    dispatch(user_delete())
      .unwrap()
      .then(() => {
        dispatch(check_auth());
        navigate('/');
      })
      .catch((err) => console.error('Delete failed', err));

    setIsModalOpen(false);
  };

  const navLinks = [
    { href: "/problems", text: "Problems" },
    { href: "/contest", text: "Contest" },
    { href: "/pair-mode", text: "Collab" },
    { href: "/discussion", text: "Discuss" },
    { href: "/tscassistant", text: "TSC Assistant" },
    { href: "/problem/potd", text: "POTD" }
  ];

  // Enhanced Animated Nav Link with magnetic effect
  const AnimatedNavLink = ({ to, children }) => (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={to}
        className="relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-white/90 transition-all duration-300 hover:text-gray-900 dark:hover:text-white"
      >
        {children}

        {}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );

  // Enhanced logo with pulse animation
  const StyledCodeG = () => (
    <motion.span
      className='font-bold bg-gradient-to-r from-[#6b10e2e8] via-[#a310e2d7] to-[#e210ded7] dark:bg-gradient-to-r dark:from-[#10e2d4d7] dark:via-[#10b4e2d7] dark:to-[#106be2d7] bg-clip-text text-transparent'
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{ backgroundSize: "200% 200%" }}
    >
      CodeG
    </motion.span>
  );

  // Floating animation for buttons
  const buttonVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  // Define navbar height to be reused
  const navbarHeight = 'h-16'; // e.g., 4rem or 64px

  return (
    <>
      <div className={`${navbarHeight} w-full`}></div> {}
      <motion.header
        data-aos="fade-down"
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${navbarHeight} ${scrolled
          ? 'border-b border-gray-200/20 bg-white/70 shadow-lg backdrop-blur-xl dark:border-gray-800/20 dark:bg-gray-900/70'
          : 'bg-transparent'
          }`}
      >
        <nav className="container mx-auto max-w-[85%] flex h-full items-center justify-between px-4">
          {}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-base-content group">
              <motion.img
                src={logo}
                className="w-9 h-9"
                alt="CodeG Logo"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              <StyledCodeG />
            </Link>
          </motion.div>

          {}
          <motion.nav
            className="hidden lg:flex flex-grow justify-center items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {navLinks.map((link) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: link.index * 0.1 }}
              >
                <AnimatedNavLink to={link.href}>
                  {link.text}
                </AnimatedNavLink>
              </motion.div>
            ))}
          </motion.nav>

          {}
          <div className="flex items-center gap-2 md:gap-3">
            {user?.role === "admin" && (
              <motion.div className="hidden sm:block" variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link to="/admin">
                  <button className="relative overflow-hidden rounded-lg border border-blue-500/30 bg-blue-50/80 dark:bg-blue-900/20 px-3 py-2 text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 backdrop-blur-sm transition-all duration-300">
                    <span className="relative z-10">Admin</span>
                  </button>
                </Link>
              </motion.div>
            )}

            <motion.div
              className="hidden sm:inline-block"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link to="/payment">
                <button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-3 py-2 text-xs md:text-sm font-semibold text-white shadow-lg transition-all duration-300">
                  <span className="relative z-10">Subscribe ✨</span>
                </button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Theme_toggle theme={theme} toggleTheme={toggleTheme} />
            </motion.div>

            {is_authenticated && user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User_icon
                  user={user}
                  onLogoutClick={() => setIsLogoutModalOpen(true)}
                  onDeleteAccountClick={() => setIsModalOpen(true)}
                />
              </motion.div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link to="/login">
                    <button className="rounded-lg px-4 py-2 text-sm font-semibold">
                      Log In
                    </button>
                  </Link>
                </motion.div>

                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link to="/signup">
                    <button className="rounded-lg bg-gray-800 text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold">
                      Sign Up
                    </button>
                  </Link>
                </motion.div>
              </div>
            )}

            {}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2 lg:hidden p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed inset-x-0 top-16 z-40 mx-4 origin-top rounded-xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:bg-gray-900/80 lg:hidden border border-gray-200/50 dark:border-gray-700/50`}
          >
            <motion.div
              className="flex flex-col space-y-4"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.07 }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 }
                  }}
                >
                  <NavLink to={link.href} className="block py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                    {link.text}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                className="border-t border-gray-200/50 pt-4 dark:border-gray-700/50"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
              >
                {!is_authenticated && (
                  <div className="flex items-center space-x-3">
                    <Link to="/login" className="btn btn-outline btn-primary w-full" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                    <Link to="/signup" className="btn btn-primary w-full" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                  </div>
                )}
                <div className="mt-4 block sm:hidden">
                  <Link to="/payment">
                    <button className="btn btn-primary w-full" onClick={() => setIsMenuOpen(false)}>
                      Subscribe ✨
                    </button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="modal-box relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <FaExclamationTriangle className="mx-auto h-16 w-16 text-error" />
                </motion.div>
                <h3 className="text-2xl font-bold mt-4">Are you sure?</h3>
                <p className="py-4 text-base-content/80">
                  This action cannot be undone. All of your data will be permanently deleted.
                </p>
              </div>
              <div className="modal-action justify-center gap-4">
                <motion.button
                  className="btn btn-ghost w-32"
                  onClick={() => setIsModalOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn btn-error w-32"
                  onClick={handleConfirmDelete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="modal-box relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <IoLogOutOutline className="mx-auto h-16 w-16 text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold mt-4">Log Out Confirmation</h3>
                <p className="py-4 text-base-content/80">
                  Are you sure you want to log out? You will be returned to the homepage.
                </p>
              </div>
              <div className="modal-action justify-center gap-4">
                <motion.button
                  className="btn btn-ghost w-32"
                  onClick={() => setIsLogoutModalOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn btn-primary w-32"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}