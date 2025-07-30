// src/pages/PairSessionPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

// Firebase Imports for Real-time data
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase'; // Ensure this path is correct

// UI and Icons
import { Users, Wifi, Code, GitCommit, Bot, FileText, Share2, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import StyledButton from '../components/ui/StyledButton';

// Mock Code Editor - Replace with your actual editor later
const MockEditor = ({ code, setCode, readOnly }) => {
    return (
        <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            readOnly={readOnly}
            className={`w-full h-full p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-lg border-2 ${readOnly ? 'border-transparent' : 'border-blue-500'} focus:outline-none focus:ring-0 resize-none transition-all duration-300`}
            placeholder="Loading code..."
        />
    )
}

const PairSessionPage = () => {
    const { sessionId } = useParams();
    const currentUser = useSelector((state) => state.auth.user);

    const [sessionData, setSessionData] = useState(null);
    const [localCode, setLocalCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSwitchingRoles, setIsSwitchingRoles] = useState(false);
    const [switchError, setSwitchError] = useState(null);

    // Effect for real-time Firestore listener
    useEffect(() => {
        if (!sessionId || !currentUser?._id) return;

        const sessionRef = doc(db, 'pair_sessions', sessionId);
        const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSessionData(data);
                
                // If you are the navigator, update your local code with synced content
                if (data.current_driver !== currentUser._id) {
                    setLocalCode(data.code_content);
                }
                
                // If user2 is null, set current user as user2
                if (data.user1_id !== currentUser._id && !data.user2_id) {
                    updateDoc(sessionRef, { user2_id: currentUser._id });
                }

                setIsLoading(false);
            } else {
                setError("Session not found.");
                setIsLoading(false);
            }
        }, (err) => {
            console.error("Firestore subscription error:", err);
            setError("Failed to connect to the session.");
            setIsLoading(false);
        });

        // Cleanup function to detach the listener on component unmount
        return () => unsubscribe();
    }, [sessionId, currentUser?._id]);
    
    // Derived state for easier use in JSX
    const isDriver = sessionData?.current_driver === currentUser?._id;

    // FIXED: Enhanced role switching logic with better error handling
    const handleSwitchRoles = async () => {
        if (!sessionData || !currentUser?._id) {
            setSwitchError("Session data not available");
            return;
        }
        
        // Check if both users are present
        if (!sessionData.user1_id || !sessionData.user2_id) {
            setSwitchError("Cannot switch roles. Waiting for the other participant to join.");
            return;
        }

        // Clear any previous errors
        setSwitchError(null);
        setIsSwitchingRoles(true);
        
        try {
            // Determine who should be the next driver based on current user
            let nextDriver;
            
            // If current user is the driver, make the other user the driver
            if (sessionData.current_driver === currentUser._id) {
                // Current user is driver, switch to the other user
                if (sessionData.user1_id === currentUser._id) {
                    nextDriver = sessionData.user2_id;
                } else {
                    nextDriver = sessionData.user1_id;
                }
            } else {
                // Current user is navigator, they want to become driver
                nextDriver = currentUser._id;
            }


            const sessionRef = doc(db, 'pair_sessions', sessionId);
            await updateDoc(sessionRef, { 
                current_driver: nextDriver,
                last_role_switch: new Date().toISOString(),
                switched_by: currentUser._id
            });
            
            
        } catch (error) {
            console.error("Error switching roles:", error);
            setSwitchError("Failed to switch roles. Please try again.");
        } finally {
            setIsSwitchingRoles(false);
            // Clear error after 3 seconds
            setTimeout(() => setSwitchError(null), 3000);
        }
    };

    const handleSyncCode = async () => {
        if (!isDriver) {
            alert("Only the driver can sync code.");
            return;
        }
        
        try {
            const sessionRef = doc(db, 'pair_sessions', sessionId);
            await updateDoc(sessionRef, { 
                code_content: localCode,
                last_sync: new Date().toISOString(),
                synced_by: currentUser._id
            });
        } catch (error) {
            console.error("Error syncing code:", error);
            alert("Failed to sync code. Please try again.");
        }
    };
    
    const copySessionId = () => {
        navigator.clipboard.writeText(sessionId)
            .then(() => alert("Session ID copied to clipboard!"))
            .catch(() => alert("Failed to copy Session ID"));
    }

    // Helper function to get user role display
    const getUserRole = (userId) => {
        if (!sessionData) return '';
        if (sessionData.current_driver === userId) {
            return 'DRIVER 🚗';
        } else {
            return 'NAVIGATOR 🧭';
        }
    };

    // Helper function to get participant display name
    const getParticipantName = (userId) => {
        if (!userId) return 'Waiting to join...';
        if (userId === currentUser?._id) return `${userId} (You)`;
        return userId;
    };

    // Helper to check if role switching is available
    const canSwitchRoles = () => {
        return sessionData?.user1_id && sessionData?.user2_id && !isSwitchingRoles;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p>Loading Session...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-500">
                <div className="text-center">
                    <p className="text-xl mb-2">❌ {error}</p>
                    <p className="text-sm text-slate-400">Please check the session ID and try again.</p>
                </div>
            </div>
        );
    }

    // Animation Variants
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="min-h-screen bg-slate-900 text-white p-4 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
                
                {}
                <div className="lg:col-span-2 h-full flex flex-col gap-4">
                     <header className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Bot size={24} className="text-blue-400" />
                            <h1 className="font-bold text-lg text-slate-200">Collaborative Editor</h1>
                        </div>
                        <div className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-all duration-300 ${
                            isDriver 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        }`}>
                            {isDriver ? '🚗 You are the DRIVER' : '🧭 You are the NAVIGATOR'}
                        </div>
                     </header>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg flex-grow relative">
                         {!isDriver && (
                            <div className="absolute top-2 right-2 bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-medium border border-orange-500/30 z-10">
                                Read-only (Navigator)
                            </div>
                         )}
                         <MockEditor code={localCode} setCode={setLocalCode} readOnly={!isDriver} />
                    </div>
                </div>

                {}
                <div className="h-full flex flex-col gap-4">
                     {}
                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                         <h2 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <GitCommit size={16} />
                            Session Controls
                         </h2>
                         
                         {}
                         {switchError && (
                             <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs flex items-center gap-2">
                                 <AlertCircle size={14} />
                                 <span>{switchError}</span>
                             </div>
                         )}
                         
                         <div className="flex flex-col gap-3">
                             <StyledButton 
                                onClick={handleSwitchRoles} 
                                disabled={!canSwitchRoles()}
                                className={`transition-all duration-200 ${(!canSwitchRoles()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={!sessionData?.user2_id ? "Waiting for second participant" : "Switch driver/navigator roles"}
                             >
                                {isSwitchingRoles ? (
                                    <RefreshCw size={16} className="mr-2 animate-spin" />
                                ) : (
                                    <GitCommit size={16} className="mr-2" />
                                )}
                                {isSwitchingRoles ? 'Switching...' : `Switch Roles ${isDriver ? '(Give Control)' : '(Take Control)'}`}
                             </StyledButton>
                             
                             {isDriver && (
                                <StyledButton onClick={handleSyncCode} variant="primary">
                                    <Code size={16} className="mr-2"/> 
                                    Sync Code with Navigator
                                </StyledButton>
                             )}
                             
                             {!isDriver && (
                                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-slate-400 mb-2">You're the Navigator</p>
                                    <p className="text-xs text-slate-500">Guide the driver and suggest improvements</p>
                                    {canSwitchRoles() && (
                                        <p className="text-xs text-blue-400 mt-2">Click "Switch Roles" to become the driver</p>
                                    )}
                                </div>
                             )}
                         </div>
                     </div>

                     {}
                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                         <h2 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <Wifi size={16} /> 
                            Session Info
                         </h2>
                         <div className="text-sm space-y-3 text-slate-400">
                             <div className="flex justify-between items-center">
                                <span>Status:</span>
                                <span className="text-green-400 font-semibold flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    {sessionData.status}
                                </span>
                             </div>
                             <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                                <span className="text-xs font-mono truncate">{sessionId}</span>
                                <button 
                                    onClick={copySessionId} 
                                    className="ml-2 p-1 hover:bg-slate-600 rounded transition-colors" 
                                    title="Copy Session ID"
                                >
                                    <Copy size={14} />
                                </button>
                             </div>
                             {sessionData?.last_role_switch && (
                                 <div className="text-xs text-slate-500">
                                     <span>Last role switch: </span>
                                     <span className="text-slate-400">
                                         {new Date(sessionData.last_role_switch).toLocaleTimeString()}
                                     </span>
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     {}
                     <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                         <h2 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <Users size={16} /> 
                            Participants ({sessionData?.user2_id ? '2' : '1'}/2)
                         </h2>
                         <div className="text-sm space-y-3">
                             <div className="bg-slate-700/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-slate-300 font-medium">User 1</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        sessionData?.current_driver === sessionData?.user1_id 
                                            ? 'bg-blue-500/20 text-blue-300' 
                                            : 'bg-orange-500/20 text-orange-300'
                                    }`}>
                                        {getUserRole(sessionData?.user1_id)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">
                                    {getParticipantName(sessionData?.user1_id)}
                                </p>
                             </div>
                             
                             <div className="bg-slate-700/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-slate-300 font-medium">User 2</span>
                                    {sessionData?.user2_id && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            sessionData?.current_driver === sessionData?.user2_id 
                                                ? 'bg-blue-500/20 text-blue-300' 
                                                : 'bg-orange-500/20 text-orange-300'
                                        }`}>
                                            {getUserRole(sessionData?.user2_id)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 truncate">
                                    {getParticipantName(sessionData?.user2_id)}
                                </p>
                             </div>
                         </div>
                     </div>
                     
                      {}
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mt-auto">
                         <h2 className="font-bold text-slate-300 mb-3 flex items-center gap-2">
                            <FileText size={16}/> 
                            Pair Programming Guide
                         </h2>
                         <div className="text-xs text-slate-500 space-y-2">
                            <p><strong className="text-slate-400">Driver (🚗):</strong> Types code, runs tests, implements solutions</p>
                            <p><strong className="text-slate-400">Navigator (🧭):</strong> Reviews code, suggests improvements, catches bugs</p>
                            <p><strong className="text-slate-400">Switch Roles:</strong> Both users can switch roles anytime!</p>
                            <p><strong className="text-slate-400">Tip:</strong> Switch roles every 15-20 minutes for best collaboration!</p>
                         </div>
                     </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PairSessionPage;