// src/pages/CollabModePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { SquareCode, LogIn, Search, X, CheckCircle, Users, Code, Clock, Mic, Volume2, Zap } from 'lucide-react';
import axios_client from '@/utils/axiosconfig';
import StyledButton from '../components/ui/StyledButton';
import Particles from '@/components/ui/particlebg';
import { useSelector } from 'react-redux';
import LoginAccessCard from '@/component/loginmessage';

const CollabModePage = () => {
  const [joinSessionId, setJoinSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [problemInput, setProblemInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  // Handle search with debouncing
  useEffect(() => {
    if (problemInput.trim().length >= 1) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const response = await axios_client.get(`/contest/find?query=${problemInput.trim()}`);
          let problems = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              problems = response.data;
            } else if (response.data.problems && Array.isArray(response.data.problems)) {
              problems = response.data.problems;
            } else if (response.data._id) {
              problems = [response.data]; // Wrap single object in an array
            }
          }
          setSearchResults(problems);
        } catch (error) {
          console.error("Error searching problems:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [problemInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateSession = async () => {
    if (!selectedProblem) {
      alert("Please select a problem first.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios_client.post('/pairMode/createSession', {
        problemId: selectedProblem._id
      });
      const { sessionId } = response.data;
      if (sessionId) {
        navigate(`/problem/${selectedProblem._id}/session/${sessionId}`);
      }
    } catch (error) {
      console.error("Error creating collab session:", error);
      alert("Failed to create session. Please try again.");
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    const sessionIdToJoin = joinSessionId.trim();
    if (!sessionIdToJoin) {
      alert("Please enter a Session ID.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios_client.get(`/pairMode/details/${sessionIdToJoin}`);
      const { problemId } = response.data;
      if (problemId) {
        navigate(`/problem/${problemId}/session/${sessionIdToJoin}`);
      } else {
        alert("Could not find a problem associated with that session.");
      }
    } catch (error) {
      console.error("Error joining session:", error);
      if (error.response?.status === 404) {
        alert("Invalid Session ID. Please check the ID and try again.");
      } else {
        alert("Failed to join session. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setProblemInput(problem.title);
    setShowDropdown(false);
  };

  const clearSelectedProblem = () => {
    setSelectedProblem(null);
    setProblemInput('');
    setSearchResults([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-sky-100 to-pink-100 dark:from-slate-800 dark:to-slate-600">
        <LoginAccessCard message="You need to be logged in to start or join a collaborative programming session." />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className=" min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 sm:p-8 flex items-center justify-center overflow-hidden"
    >
     <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={180}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl w-full">
        <motion.header variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-10 w-10 text-blue-500" />
            <h1 className="bg-gradient-to-r py-2 from-blue-500 to-indigo-600 bg-clip-text font-serif text-4xl font-bold text-transparent sm:text-5xl">
              Collab Programming
            </h1>
          </div>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Solve problems together with a shared real-time editor and integrated voice chat.
          </p>

          <motion.div
            variants={itemVariants}
            className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-[#cf85f06f] dark:to-[#4c30667b] border-2 border-purple-200 dark:border-purple-600/50 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <Mic className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <Volume2 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              <Zap className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Real-Time Voice Communication Included!
            </h2>
            <p className="text-purple-700 dark:text-purple-300 font-medium text-lg max-w-lg mx-auto">
              Talk to your partner instantly while coding—no external apps needed!
            </p>
          </motion.div>
        </motion.header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl p-8 flex flex-col shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
                <SquareCode className="h-8 w-8 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create New Session</h2>
                <p className="text-slate-600 dark:text-slate-400">Start a fresh coding session.</p>
              </div>
            </div>

            <div className="mb-6 relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select a Problem</label>
              {selectedProblem ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2"><CheckCircle className="h-5 w-5 text-green-600" /><span className="font-semibold text-green-800 dark:text-green-300">Selected Problem</span></div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{selectedProblem.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">#{selectedProblem.serial_number}</p>
                    </div>
                    <button onClick={clearSelectedProblem} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg" title="Clear selection"><X className="h-4 w-4 text-red-500" /></button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="text" placeholder="Search by name or serial number..." value={problemInput} onChange={(e) => setProblemInput(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"/>
                    {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>}
                  </div>
                  <AnimatePresence>
                    {showDropdown && searchResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                        {searchResults.map((problem) => (
                          <button key={problem._id} onClick={() => handleProblemSelect(problem)} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 border-b dark:border-slate-700 last:border-b-0">
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100">{problem.title}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">#{problem.serial_number}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {showDropdown && !isSearching && searchResults.length === 0 && problemInput.trim() && <div className="absolute top-full w-full mt-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl p-4 text-center text-slate-500 z-50">No problems found.</div>}
                </div>
              )}
            </div>
            <StyledButton onClick={handleCreateSession} disabled={isLoading || !selectedProblem} className="w-full mt-auto">{isLoading ? 'Creating...' : 'Create Collab Session'}</StyledButton>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl p-8 flex flex-col shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl">
                <LogIn className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Join Existing Session</h2>
                <p className="text-slate-600 dark:text-slate-400">Enter session ID from your partner.</p>
              </div>
            </div>
            <form onSubmit={handleJoinSession} className="flex flex-col gap-6 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Session ID</label>
                <input type="text" placeholder="Enter partner's Session ID..." value={joinSessionId} onChange={(e) => setJoinSessionId(e.target.value)} className="w-full py-4 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/20"/>
              </div>
              <StyledButton type="submit" disabled={isLoading || !joinSessionId.trim()} className="w-full mt-auto">{isLoading ? 'Joining...' : 'Join Session'}</StyledButton>
            </form>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span></div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Create & Share</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Choose a problem, start a session, and share the ID with your partner.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-xl font-bold text-green-600 dark:text-green-400">2</span></div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Join & Connect</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your partner joins, instantly connecting the editor and voice chat.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span></div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Code & Talk</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Solve the problem together, talking strategy with integrated, low-latency audio.</p>
              </div>
            </div>
            
            <div className="mt-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-blue-500" />Key Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3"><div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0"></div><div><strong className="text-slate-800 dark:text-slate-100">Integrated Voice Chat:</strong><span className="text-slate-600 dark:text-slate-400 ml-1">Talk to your partner while you code, right in the browser.</span></div></div>
                  <div className="flex items-start gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div><div><strong className="text-slate-800 dark:text-slate-100">Real-Time Sync:</strong><span className="text-slate-600 dark:text-slate-400 ml-1">See your partner’s edits and cursor movements live.</span></div></div>
                  <div className="flex items-start gap-3"><div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0"></div><div><strong className="text-slate-800 dark:text-slate-100">Driver/Navigator Roles:</strong><span className="text-slate-600 dark:text-slate-400 ml-1">Control who drives the coding with easy role-switching.</span></div></div>
                  <div className="flex items-start gap-3"><div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0"></div><div><strong className="text-slate-800 dark:text-slate-100">No Setup Required:</strong><span className="text-slate-600 dark:text-slate-400 ml-1">Works directly in your browser—no downloads or plugins needed.</span></div></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CollabModePage;