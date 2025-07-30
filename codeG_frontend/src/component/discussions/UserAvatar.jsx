// src/components/discussion/UserAvatar.jsx
import React from 'react';

const UserAvatar = ({ user, size = 'h-8 w-8' }) => { // Default size is h-8 w-8
  // 1. Check for profile picture URL
  if (user?.profile_pic_url) {
    
    return (
      <img
        src={user.profile_pic_url}
        alt={user.first_name || 'User Avatar'}
        className={`${size} rounded-full object-cover`}
        title={user.first_name || 'User'}
      />
    );
  }

  // 2. Fallback to initials
  const initials = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
  const fontSize = size.includes('10') || size.includes('12') ? 'text-base' : 'text-sm';

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gray-300 font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-200 ${size}`}
      title={user?.first_name || 'User'}
    >
      <span className={fontSize}>{initials}</span>
    </div>
  );
};

export default UserAvatar;