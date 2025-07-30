// User_icon.jsx

import React from 'react';
import { Link } from 'react-router';
import { CgProfile } from 'react-icons/cg';
import { IoLogOutOutline } from 'react-icons/io5';
import { FaKey, FaUserSlash } from 'react-icons/fa';

// This component now receives `onLogoutClick` instead of `onLogout`.
function User_icon({ user, onLogoutClick, onDeleteAccountClick }) {
    if (!user) {
        return null;
    }

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${user.first_name}&background=random`;

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                    <img
                        src={user.profile_pic_url || fallbackAvatar}
                        alt={`${user.first_name}'s profile`}
                        onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
                    />
                </div>
            </label>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content z-[1000] mt-3 w-56 rounded-box bg-base-200 p-2 shadow-xl focus:outline-none"
            >
                <li className="menu-title px-4 pt-2 pb-1 text-sm">
                    <span>Hi, {user.first_name}!</span>
                </li>
                <li>
                    <Link to="/profile" className="p-3">
                        <CgProfile className="h-4 w-4" />
                        Profile
                    </Link>
                </li>
                <li>
                    {user.setpassword ? (
                        <Link to="/settings/change-password" className="p-3">
                            <FaKey className="h-4 w-4" />
                            Change Password
                        </Link>
                    ) : (<Link to="/settings/set-password" className="p-3">
                        <FaKey className="h-4 w-4" />
                        Set Password
                    </Link>)
                    }
                </li>

                <li>
                    {}
                    <button onClick={onLogoutClick} className="p-3 w-full flex items-center gap-2">
                        <IoLogOutOutline className="h-4 w-4" />
                        Logout
                    </button>
                </li>
                <li className="px-4"><div className="divider my-1 h-px bg-base-content/20"></div></li>
                <li>
                    <button
                        onClick={onDeleteAccountClick}
                        className="p-3 text-error w-full flex items-center gap-2"
                    >
                        <FaUserSlash className="h-4 w-4" />
                        Delete Account
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default User_icon;