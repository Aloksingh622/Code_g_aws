import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// This is now a simple "presentational" component.
// It receives the current theme and the function to call when clicked.
export default function ThemeToggleButton({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme} // Note: We pass the whole event `(e) => toggleTheme(e)` in the parent
      className="relative z-50 flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-black shadow-md transition-transform hover:scale-105 dark:bg-zinc-700 dark:text-white"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}