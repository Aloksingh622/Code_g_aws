// src/components/NavLink.jsx
import React from 'react';
import { Link, useLocation } from 'react-router';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-gray-900 dark:text-white' // Active link style
          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white' // Inactive link style
      }`}
    >
      {children}
      {isActive && (
        // Animated underline for the active link
        <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-blue-500"></span>
      )}
    </Link>
  );
};

export default NavLink;