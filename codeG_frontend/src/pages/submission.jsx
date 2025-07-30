// components/SubmissionItem.jsx

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge"; // Adjust path as needed
import { ChevronRight } from "lucide-react";

const SubmissionItem = ({ sub }) => {
    // State for toggling code visibility remains the same
    const [isCodeVisible, setIsCodeVisible] = useState(false);

    const isAccepted = sub.status === 'accepted';
    const statusText = sub.status?.replace(/_/g, ' ') || 'Failed';

    return (
        // --- THEME AWARE CARD ---
        // Default: Light theme (white bg, border)
        // Dark: Dark theme (dark bg, dark border)
        <div className="bg-white dark:bg-neutral-900/80 rounded-lg p-4 flex flex-col gap-3 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-center flex-wrap gap-3">
                    {}
                    <Badge variant="outline" className="
                        bg-blue-100 text-blue-800 border-blue-200 
                        dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500/30
                        font-mono capitalize"
                    >
                        {sub.language}
                    </Badge>
                    
                    {}
                    <span className={`text-sm font-semibold capitalize 
                        ${isAccepted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                        {statusText}
                    </span>
                </div>
                {}
                <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap pl-4">
                    {new Date(sub.submitted_at).toLocaleString()}
                </span>
            </div>
            
            {}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <span>Test Cases: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{sub.testcases_passed}</span></span>
                <span>Runtime: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{sub.runtime}</span></span>
                <span>Memory: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{sub.memory}</span></span>
            </div>

            {}
            {!isAccepted && sub.error_message && (
                <div className="mt-1 text-sm 
                    bg-red-50 text-red-700 p-3 rounded-md border border-red-200
                    dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/20"
                >
                   <span className="font-semibold">Error:</span> {sub.error_message}
                </div>
            )}

            <div className="mt-1">
                <details
                    className="group"
                    open={isCodeVisible}
                    onToggle={(e) => setIsCodeVisible(e.currentTarget.open)}
                >
                    {}
                    <summary className="cursor-pointer text-sm font-medium 
                        text-blue-600 hover:underline 
                        dark:text-sky-400
                        flex items-center gap-1 list-none"
                    >
                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isCodeVisible ? 'rotate-90' : ''}`} />
                        {isCodeVisible ? 'Hide Code' : 'View Code'}
                    </summary>
                    
                    {}
                    <div className="mt-2 
                        bg-neutral-100 text-neutral-800
                        dark:bg-neutral-800/60 dark:text-neutral-200
                        rounded p-3 overflow-x-auto text-xs font-mono border border-neutral-200 dark:border-neutral-700"
                    >
                        <pre>{sub.code}</pre>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default SubmissionItem;