// In ContestArena.js

import React, { useState, useEffect,useRef } from 'react';
import { CheckCircle, Clock, Circle, Users, Trophy, Timer, Code, ArrowRight, Star, Zap, Calendar, Target } from 'lucide-react';
import axiosClient from '../utils/axiosconfig';
import { useParams, useNavigate } from 'react-router'; // Import useNavigate


const ContestArena = () => {
    const { contestId } = useParams();
    const navigate = useNavigate(); // Use navigate for redirection
    const [contest, setContest] = useState(null);
    const [progress, setProgress] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch contest data
    useEffect(() => {
        const fetchContestData = async () => {
            if (!contestId) {
                setError('Contest ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [contestResponse, progressResponse] = await Promise.all([
                    axiosClient.get(`/contest/${contestId}/arena`),
                    axiosClient.get(`/contest/${contestId}/progress`)
                ]);

                setContest(contestResponse.data);
                setProgress(progressResponse.data);

                const solvedProblemId = sessionStorage.getItem(`solvedProblem_${contestId}`);
                if (solvedProblemId) {
                    updateProblemStatus(solvedProblemId, 'SOLVED', progressResponse.data);
                    sessionStorage.removeItem(`solvedProblem_${contestId}`); // Clean up
                }

            } catch (err) {
                console.error('Error fetching contest data:', err);
                setError(err.response?.data?.message || 'Failed to load contest data');
            } finally {
                setLoading(false);
            }
        };

        fetchContestData();
    }, [contestId]);

    // Calculate time remaining
    useEffect(() => {
        if (!contest?.endTime) return;

        const timer = setInterval(() => {
            const now = new Date();
            const endTime = new Date(contest.endTime);
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeRemaining('Contest Ended');
                clearInterval(timer);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [contest?.endTime]);


    // ✅ FIXED: Helper function to update progress state immutably
    const updateProblemStatus = (problemId, newStatus, currentProgress) => {
        const targetProgress = currentProgress || progress;
        if (!targetProgress) return;

        const updatedProblemProgress = targetProgress.problemProgress.map(p => {
            // Compare the string ID with the object's _id property
            if (p.problemId?._id.toString() === problemId.toString()) {
                if (p.status !== newStatus) {
                    return { ...p, status: newStatus };
                }
            }
            return p;
        });

        const totalSolved = updatedProblemProgress.filter(p => p.status === 'SOLVED').length;

        setProgress({
            ...targetProgress,
            problemProgress: updatedProblemProgress,
            totalSolved: totalSolved
        });
    };

    // Track problem visit and navigate
    const handleSolveProblem = async (problemId) => {
        try {
            const currentStatus = getProblemStatus(problemId);
            if (currentStatus === 'NOT_ATTEMPTED') {
                updateProblemStatus(problemId, 'ATTEMPTED');
            }
            await axiosClient.post(`/contest/${contestId}/track-visit/${problemId}`);
            // Use navigate for SPA navigation
            navigate(`/problems/${problemId}?contestId=${contestId}`);
        } catch (err) {
            console.error('Error tracking problem visit:', err);
            navigate(`/problems/${problemId}?contestId=${contestId}`);
        }
    };

    // ✅ FIXED: Get problem status with correct comparison
    const getProblemStatus = (problemId) => {
        if (!progress?.problemProgress) return 'NOT_ATTEMPTED';
        // Compare the string ID with the object's _id property
        const problemProgress = progress.problemProgress.find(p => p.problemId?._id.toString() === problemId.toString());
        return problemProgress?.status || 'NOT_ATTEMPTED';
    };


    // Get difficulty color (no changes needed here)
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };
    
    // ... (The rest of your component's JSX and return statement are perfectly fine)
    // ... (Loading state, error state, and the entire return() block can remain as is)

   
if (loading) {
  return (
    <div className="flex justify-center items-center h-screen p-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-75"></div>
      </div>
    </div>
  );
}
    if (error) return <div>Error: {error}</div>;
    if (!contest) return null;

    return (
        <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {}
            <header
                className="backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border-b border-white/20 dark:border-gray-700/20 sticky top-0 "
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {contest.title}
                                </h1>
                            </div>
                            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{contest.participants?.length || 0} participants</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            {}
                            <div className="flex items-center space-x-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {progress?.totalSolved || 0}/{contest.problems?.length || 0}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">solved</span>
                            </div>

                            {}
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 px-4 py-2 rounded-full">
                                <Timer className="w-5 h-5 text-red-500" />
                                <span className="text-lg font-mono font-bold text-red-600 dark:text-red-400">
                                    {timeRemaining}
                                </span>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${((progress?.totalSolved || 0) / (contest.problems?.length || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {}
                    <div className="lg:col-span-1">
                        <div
                            className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 sticky top-24"
                        >
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                <Code className="w-5 h-5 mr-2 text-indigo-600" />
                                Problems
                            </h2>

                            <div className="space-y-3">
                                {contest.problems?.map((problem, index) => {
                                    const status = getProblemStatus(problem._id);
                                    return (
                                        <div
                                            key={problem._id}
                                            className={`group cursor-pointer p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedProblem?._id === problem._id
                                                    ? 'bg-indigo-500/20 border-indigo-500/30'
                                                    : 'bg-white/5 dark:bg-gray-800/5 hover:bg-white/10 dark:hover:bg-gray-800/10'
                                                } border border-white/10 dark:border-gray-700/10`}
                                            onClick={() => setSelectedProblem(problem)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    {status === 'SOLVED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                                    {status === 'ATTEMPTED' && <Clock className="w-5 h-5 text-blue-500" />}
                                                    {status === 'NOT_ATTEMPTED' && <Circle className="w-5 h-5 text-gray-400" />}
                                                    <span className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {problem.title}
                                                    </span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <span className={`${getDifficultyColor(problem.difficulty)} font-medium`}>
                                                    {problem.difficulty}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">{problem.points}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                     {}
                     <div className="lg:col-span-3">
                        <div
                            className="backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 rounded-2xl border border-white/20 dark:border-gray-700/20 p-8"
                        >
                            {selectedProblem ? (
                                <div>
                                    {}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                                                {selectedProblem.title}
                                            </h2>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProblem.difficulty)} bg-current/10`}>
                                                    {selectedProblem.difficulty}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">{selectedProblem.points} pts</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 mb-6">
                                            {getProblemStatus(selectedProblem._id) === 'SOLVED' && (
                                                <div className="flex items-center space-x-2 text-green-600">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span className="font-medium">Solved</span>
                                                </div>
                                            )}
                                            {getProblemStatus(selectedProblem._id) === 'ATTEMPTED' && (
                                                <div className="flex items-center space-x-2 text-blue-600">
                                                    <Clock className="w-5 h-5" />
                                                    <span className="font-medium">Attempted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {}
                                    <div>
                                        <button
                                            onClick={() => handleSolveProblem(selectedProblem._id)}
                                            className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <div className="relative flex items-center justify-center space-x-2">
                                                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span>Solve Problem</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {}
                                    <div className="text-center" >
                                        <div className="mb-8">
                                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                                                {contest.title}
                                            </h2>
                                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                                {contest.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            <div className="backdrop-blur-sm bg-white/5 dark:bg-gray-800/5 rounded-xl p-6 border border-white/10 dark:border-gray-700/10">
                                                <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-gray-800 dark:text-white">{contest.participants?.length || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Participants</div>
                                            </div>

                                            <div className="backdrop-blur-sm bg-white/5 dark:bg-gray-800/5 rounded-xl p-6 border border-white/10 dark:border-gray-700/10">
                                                <Code className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-gray-800 dark:text-white">{contest.problems?.length || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Problems</div>
                                            </div>

                                            <div className="backdrop-blur-sm bg-white/5 dark:bg-gray-800/5 rounded-xl p-6 border border-white/10 dark:border-gray-700/10">
                                                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-gray-800 dark:text-white">{progress?.totalSolved || 0}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Solved</div>
                                            </div>
                                        </div>

                                        <div className="text-gray-600 dark:text-gray-400">
                                            <p className="mb-4">Select a problem from the sidebar to get started!</p>
                                            <div className="flex items-center justify-center space-x-4 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Started: {new Date(contest.startTime).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Timer className="w-4 h-4" />
                                                    <span>Ends: {new Date(contest.endTime).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ContestArena;