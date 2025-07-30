import React from 'react';
import { Button } from '@/components/ui/button';
import { 
    GitCommit, 
    UploadCloud, 
    Copy,
    // --- NEW: ICONS FOR VOICE CHAT ---
    Mic, 
    MicOff, 
    Volume2, 
    VolumeX,
    Shuffle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // It's good practice to import used components

// The component signature is updated with the new props from DSAProblemPage
const PairSessionHeader = ({ 
    sessionData, 
    isDriver, 
    handleSwitchRoles, 
    handleSyncCode, 
    sessionId, 
    addToast, 
    participantDetails,
    // --- NEW: PROPS FOR VOICE CHAT ---
    isMuted,
    isSpeakerOn,
    handleToggleMute,
    handleToggleSpeaker,
    currentUser
}) => {

    const copySessionId = async () => {
        if (!sessionId) {
            addToast("Could not find Session ID to copy.", "error");
            return;
        }
        try {
            await navigator.clipboard.writeText(sessionId);
            addToast("Session ID copied! Share it with your friend.", "success");
        } catch (err) {
            addToast("Failed to copy session ID.", "error");
        }
    };

    const getDriverName = () => {
        const driverId = sessionData?.current_driver;
        if (!driverId) return '...';
        // Using optional chaining for safety in case details haven't loaded
        const driverName = participantDetails[driverId]?.first_name;
        return driverName || `...${driverId.slice(-6)}`;
    };

    // --- NEW: LOGIC TO DETERMINE PARTNER'S MIC STATUS ---
    // This is safe even if currentUser or sessionData is initially null
    const isUser1 = sessionData?.user1_id === currentUser?._id;
    // We check `=== false` because `undefined` should not show as 'off'
    const partnerMicOn = (isUser1 ? sessionData?.user2_mic_on : sessionData?.user1_mic_on) === false ? false : true;
    const partnerJoined = sessionData?.user2_id;


    return (
        <div className="bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700/80 p-2 px-4 text-sm animate-fade-in flex-shrink-0">
            <div className="flex justify-between items-center">
                {}
                <div className="flex items-center gap-4">
                    <button onClick={copySessionId} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/60 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 rounded-md transition-all duration-200 group" title="Copy Invite ID">
                        <Copy size={14} className="text-neutral-500 dark:text-neutral-400" />
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium text-xs">Copy Invite ID</span>
                    </button>
                    <div className="text-neutral-500 dark:text-neutral-400 hidden md:block">
                        <span className="font-semibold">Driver:</span>
                        <span className="ml-1.5 font-medium text-neutral-800 dark:text-neutral-100">{getDriverName()}</span>
                        <span className="ml-1">{isDriver ? '🚗' : '🧭'}</span>
                    </div>
                </div>

                {}
                <div className="flex items-center gap-2 md:gap-3">
                    {}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleMute}
                        className="rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                        {isMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5 text-green-500" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleSpeaker}
                        className="rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        title={isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
                    >
                        {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>

                    {}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 border-l border-neutral-300 dark:border-neutral-700 pl-2 ml-1" title="Partner's microphone status">
                        <span>Partner:</span>
                        {}
                        {partnerJoined ? (
                             partnerMicOn ? (
                                <Mic className="h-4 w-4 text-green-500" />
                            ) : (
                                <MicOff className="h-4 w-4 text-red-500" />
                            )
                        ) : (
                             <span className="text-neutral-500">...</span>
                        )}
                    </div>
                    {}
                    
                    <Button 
                        onClick={handleSwitchRoles} 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        disabled={!partnerJoined}
                        title={!partnerJoined ? "Waiting for partner to join" : "Switch roles"}
                    >
                        <Shuffle size={14} /> Switch
                    </Button>

                    {isDriver && (
                        <Button
                            onClick={handleSyncCode}
                            size="sm"
                            className="h-8 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <UploadCloud size={14} /> Sync
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PairSessionHeader;