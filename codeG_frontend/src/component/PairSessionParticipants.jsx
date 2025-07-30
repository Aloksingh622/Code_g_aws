// src/component/PairSessionParticipants.jsx

import React from 'react';
import { Users, Hourglass } from 'lucide-react';

const PairSessionParticipants = ({ sessionData, participantDetails }) => {

    // A robust helper to get user info and generate avatar URLs
    const getUserInfo = (userId, userNum) => {
        if (!userId) return null; // Return null if the user hasn't joined yet

        const details = participantDetails[userId];
        
        // --- Fallback Logic for Avatars ---
        let avatarUrl = `https://ui-avatars.com/api/?name=?&background=333&color=fff`; // A generic fallback
        const name = details?.first_name || `User ${userNum}`;

        if (details) {
             // Create a name-based fallback avatar URL
             const fallbackAvatar = `https://ui-avatars.com/api/?name=${details.first_name}+${details.last_name || ''}&background=random&color=fff&rounded=true`;
            
             // Use the real profile picture if it exists, otherwise use the name-based fallback
             avatarUrl = details.profile_pic_url || fallbackAvatar;
        }

        return {
            name: name,
            avatarUrl: avatarUrl,
            fallbackAvatar: `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&rounded=true`
        };
    };
    
    // --- Generate info for both users ---
    const user1Info = getUserInfo(sessionData.user1_id, 1);
    const user2Info = getUserInfo(sessionData.user2_id, 2);

    // This sub-component keeps our code clean
    const UserRow = ({ info, role }) => {
        if (!info) return null;

        return (
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    {}
                    <img 
                        src={info.avatarUrl} 
                        alt={`${info.name}'s avatar`}
                        // --- CRITICAL: This handles broken image links ---
                        onError={(e) => { e.currentTarget.src = info.fallbackAvatar; }}
                        className="w-7 h-7 rounded-full object-cover bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600" 
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">{info.name}</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{role}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#282828] border-b border-neutral-200 dark:border-neutral-700/80 px-4 py-3 flex-shrink-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                <Users size={16} />
                Participants
            </h3>
            <div className="space-y-4">
                {user1Info && <UserRow info={user1Info} role="Host" />}

                {user2Info ? (
                    <UserRow info={user2Info} role="Partner" />
                ) : (
                    // This is the elegant "Waiting" message
                    <div className="flex items-center gap-3 text-sm text-yellow-600 dark:text-yellow-400 opacity-80">
                        <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                           <Hourglass size={15} />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-semibold">Waiting for partner...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PairSessionParticipants;