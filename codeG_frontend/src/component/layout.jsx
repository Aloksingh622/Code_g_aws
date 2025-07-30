import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Nav_bar from '../component/navbar';
import ThemeAnimationOverlay from '../components/ui/ThemeAnimationOverlay';

// Helper function to calculate the animation's expanding circle
const getClipPath = (startPos) => {
  const endRadius = Math.hypot(
    Math.max(startPos.x, window.innerWidth - startPos.x),
    Math.max(startPos.y, window.innerHeight - startPos.y)
  );
  return {
    initial: `circle(0px at ${startPos.x}px ${startPos.y}px)`,
    animate: `circle(${endRadius}px at ${startPos.x}px ${startPos.y}px)`,
  };
};

export default function Layout() {
  // 1. All state is managed here, at the highest shared level.
  const [theme, setTheme] = useState('dark');
  const [animation, setAnimation] = useState(null);

  // 2. On initial mount, get the theme from localStorage.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  // 3. This is the crucial effect that applies the theme to the entire app.
  useEffect(() => {
    const htmlEl = document.documentElement;

    // A) Manages Tailwind's dark mode (for dark:bg-gray-800 etc.)
    if (theme === 'dark') {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }

    // B) Manages DaisyUI's theming system (for bg-base-100, btn-primary etc.)
    htmlEl.setAttribute('data-theme', theme);

    // C) Saves the user's choice for their next visit.
    localStorage.setItem('theme', theme);
  }, [theme]); // This effect runs every time the `theme` state changes.

  // 4. The master toggle function that controls the entire process.
  const toggleTheme = (event) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    // Get the button's position to start the animation from there.
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const startPos = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2,
    };
    
    // Trigger the animation by setting the animation state.
    const clipPath = getClipPath(startPos);
    setAnimation({ type: 'circle', key: Date.now(), clipPath });

    // Delay the actual theme state change to let the animation play visibly.
    setTimeout(() => {
      setTheme(newTheme);
    }, 300);
  };

  return (
    <>
      {}
      <Nav_bar theme={theme} toggleTheme={toggleTheme} />

      {}
      <main>
        <Outlet />
      </main>

      {}
      <ThemeAnimationOverlay
        animation={animation}
        setAnimation={setAnimation}
        theme={theme}
      />
    </>
  );
}