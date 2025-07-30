import React, { useState, useEffect } from 'react';
import axios_client from '../utils/axiosconfig';
import { Link } from 'react-router';
import { Calendar, Clock, Users, Check, Trophy, Code, Award, Star, ChevronRight, Timer, Play, Eye } from 'lucide-react';

// --- Custom Imports for Themed Style & Animation ---
import AOS from 'aos';
import 'aos/dist/aos.css';
import Particles from '../components/ui/particlebg'; // Adjust path if needed
import { useSelector } from 'react-redux';
import LoginAccessCard from '@/component/loginmessage';


const ContestCard = ({ contest, onRegister, isRegistering }) => {
    const user = useSelector((state) => state.auth.user);

    const getStatus = () => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (now < start) return {
            text: "Upcoming",
            color: "bg-gradient-to-r from-blue-500 to-indigo-500",
            icon: <Calendar className="w-4 h-4" />,
            type: "upcoming"
        };
        if (now >= start && now <= end) return {
            text: "Live Now",
            color: "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse",
            icon: <Timer className="w-4 h-4 animate-spin" />,
            type: "live"
        };
        return {
            text: "Ended",
            color: "bg-gradient-to-r from-gray-500 to-slate-500",
            icon: <Award className="w-4 h-4" />,
            type: "ended"
        };
    };

    const status = getStatus();

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (start, end) => {
        const durationMs = new Date(end) - new Date(start);
        const minutes = Math.floor(durationMs / 60000);
        if (minutes < 60) return `${minutes} mins`;
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        if (hours < 24) return `${hours}h ${remainingMins}m`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    };

    const getTimeToStart = () => {
        const now = new Date();
        const start = new Date(contest.startTime);
        if (now >= start) return null;

        const diffMs = start - now;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `Starts in ${days}d ${hours}h`;
        if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
        return `Starts in ${minutes}m`;
    };

    const getTimeRemaining = () => {
        const now = new Date();
        const end = new Date(contest.endTime);
        if (now >= end) return null;

        const diffMs = end - now;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    const isFull = contest.participants?.length >= contest.maxParticipants;
    const problemCount = contest.problems?.length || 0;
    const participantCount = contest.participants?.length || 0;
    const timeToStart = getTimeToStart();
    const timeRemaining = getTimeRemaining();

    // FIXED: Check if user is already registered by looking in participants array
    // AFTER (Correct):
    const isUserRegistered = user?._id ?
        contest.participants?.some(participantId =>
            participantId.toString() === user._id.toString()
        ) : false;
    const handleCardClick = () => {
        if (status.type === 'live' && isUserRegistered) {
            // Route to contest arena
            window.location.href = `/contest/${contest._id}/arena`;
        } else if (status.type === 'ended') {
            // Route to contest results
            window.location.href = `/contest/${contest._id}/results`;
        }
        // For upcoming contests, do nothing on card click
    };

    const isClickable = (status.type === 'live' && isUserRegistered) || status.type === 'ended';

    return (
        <div
            data-aos="fade-up"
            onClick={isClickable ? handleCardClick : undefined}
            className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border shadow-xl transition-all duration-500 hover:-translate-y-1 ${status.type === 'live'
                ? 'bg-green-50/10 dark:bg-green-900/10 border-green-300/30 dark:border-green-700/50 hover:border-green-400/50 hover:shadow-green-500/20'
                : status.type === 'ended'
                    ? 'bg-gray-50/10 dark:bg-gray-900/10 border-gray-300/30 dark:border-gray-700/50 hover:border-gray-400/50 hover:shadow-gray-500/20'
                    : 'bg-white/10 dark:bg-base-100/10 border-gray-300/20 dark:border-gray-700 hover:border-primary/40 hover:shadow-primary/10'
                } ${isClickable ? 'cursor-pointer' : ''}`}
        >
            {}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${status.type === 'live'
                ? 'bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10'
                : status.type === 'ended'
                    ? 'bg-gradient-to-br from-gray-500/10 via-transparent to-slate-500/10'
                    : 'bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5'
                }`} />


            {}
            <div className="absolute top-4 right-4 z-10">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white dark:text-white text-sm font-semibold ${status.color} shadow-lg`}>
                    {status.icon}
                    {status.text}
                </div>
            </div>

            <div className="relative p-6 space-y-6">
                {}
                <div className="space-y-3">
                    <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 ${status.type === 'live'
                        ? 'from-green-700 to-emerald-600 dark:from-green-300 dark:to-emerald-400 group-hover:from-green-600 group-hover:to-emerald-500'
                        : status.type === 'ended'
                            ? 'from-gray-700 to-gray-600 dark:from-gray-300 dark:to-gray-400 group-hover:from-gray-600 group-hover:to-gray-500'
                            : 'from-gray-900 to-gray-700 dark:from-white dark:via-slate-100 dark:to-slate-300 group-hover:from-primary group-hover:to-purple-400'
                        }`}>
                        {contest.title}
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {contest.description}
                    </p>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4">
                    {}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-300 ${status.type === 'live'
                        ? 'bg-green-100/60 dark:bg-green-800/40 border-green-200/50 dark:border-green-700/50 group-hover:border-green-400/40'
                        : status.type === 'ended'
                            ? 'bg-gray-100/60 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 group-hover:border-gray-400/40'
                            : 'bg-gray-100/60 dark:bg-slate-800/40 border-gray-200/50 dark:border-slate-700/50 group-hover:border-primary/30'
                        }`}>
                        <div className={`p-2 rounded-lg ${status.type === 'live'
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                            : status.type === 'ended'
                                ? 'bg-gradient-to-r from-gray-500/20 to-slate-500/20'
                                : 'bg-gradient-to-r from-primary/20 to-purple-500/20'
                            }`}>
                            <Code className={`w-5 h-5 ${status.type === 'live' ? 'text-green-600 dark:text-green-400'
                                : status.type === 'ended' ? 'text-gray-600 dark:text-gray-400'
                                    : 'text-primary'
                                }`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Problems</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{problemCount}</p>
                        </div>
                    </div>

                    {}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-300 ${status.type === 'live'
                        ? 'bg-green-100/60 dark:bg-green-800/40 border-green-200/50 dark:border-green-700/50 group-hover:border-emerald-500/40'
                        : status.type === 'ended'
                            ? 'bg-gray-100/60 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 group-hover:border-gray-400/40'
                            : 'bg-gray-100/60 dark:bg-slate-800/40 border-gray-200/50 dark:border-slate-700/50 group-hover:border-purple-500/30'
                        }`}>
                        <div className={`p-2 rounded-lg ${status.type === 'live'
                            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20'
                            : status.type === 'ended'
                                ? 'bg-gradient-to-r from-gray-500/20 to-slate-500/20'
                                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                            }`}>
                            <Users className={`w-5 h-5 ${status.type === 'live' ? 'text-emerald-600 dark:text-emerald-400'
                                : status.type === 'ended' ? 'text-gray-600 dark:text-gray-400'
                                    : 'text-purple-400'
                                }`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Registered</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {participantCount}<span className="text-sm text-gray-500 dark:text-slate-400">/{contest.maxParticipants}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {}
                <div className={`space-y-3 p-4 rounded-xl border ${status.type === 'live'
                    ? 'bg-gradient-to-r from-green-50/80 to-emerald-100/60 dark:from-green-800/30 dark:to-emerald-900/30 border-green-200/40 dark:border-green-700/30'
                    : status.type === 'ended'
                        ? 'bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-800/30 dark:to-gray-900/30 border-gray-200/40 dark:border-gray-700/30'
                        : 'bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-slate-800/30 dark:to-slate-900/30 border-gray-200/40 dark:border-slate-700/30'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-primary/70" />
                            <span className="text-sm font-medium">Start Time</span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-mono">{formatDateTime(contest.startTime)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <Clock className="w-4 h-4 text-primary/70" />
                            <span className="text-sm font-medium">Duration</span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-mono">{calculateDuration(contest.startTime, contest.endTime)}</span>
                    </div>

                    {timeToStart && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <Timer className="w-4 h-4" />
                                <span className="text-sm font-medium">Countdown</span>
                            </div>
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-mono font-bold">{timeToStart}</span>
                        </div>
                    )}

                    {status.type === 'live' && timeRemaining && (
                        <div className="flex items-center justify-between pt-2 border-t border-green-200/60 dark:border-green-700/50">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Timer className="w-4 h-4 animate-pulse" />
                                <span className="text-sm font-medium">Time Left</span>
                            </div>
                            <span className="text-sm text-red-600 dark:text-red-400 font-mono font-bold animate-pulse">{timeRemaining}</span>
                        </div>
                    )}
                </div>

                {}
                {contest.maxParticipants > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-slate-400">Registration Progress</span>
                            <span className="text-gray-700 dark:text-slate-300">{Math.round((participantCount / contest.maxParticipants) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ease-out ${status.type === 'live'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : status.type === 'ended'
                                        ? 'bg-gradient-to-r from-gray-500 to-slate-500'
                                        : 'bg-gradient-to-r from-primary to-purple-500'
                                    }`}
                                style={{ width: `${Math.min((participantCount / contest.maxParticipants) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {}
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    {status.text === 'Ended' ? (
                        <Link
                            to={`/contest/${contest._id}/results`}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25 flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                        >
                            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            View Results
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    ) : status.text === 'Live Now' ? (
                        isUserRegistered ? (
                            <Link
                                to={`/contest/${contest._id}/arena`}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                            >
                                <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                Enter Arena
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        ) : (
                            <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium cursor-not-allowed flex items-center justify-center gap-2">
                                <Users className="w-5 h-5" />
                                Registration Closed
                            </button>
                        )
                    ) : isUserRegistered ? (
                        <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium cursor-not-allowed flex items-center justify-center gap-2 shadow-lg opacity-75">
                            <Check className="w-5 h-5" />
                            Already Registered
                        </button>
                    ) : isFull ? (
                        <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium cursor-not-allowed flex items-center justify-center gap-2">
                            <Users className="w-5 h-5" />
                            Registration Full
                        </button>
                    ) : (
                        <button
                            className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2 group ${isRegistering ? 'opacity-75 cursor-wait' : 'hover:-translate-y-0.5'}`}
                            onClick={() => onRegister(contest._id)}
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                    Register Now
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

function ContestPage() {
    const [contests, setContests] = useState([]);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [loading, setLoading] = useState(true);
    const [registeringId, setRegisteringId] = useState(null);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic',
            offset: 100
        });
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await axios_client.get("/contest/getcontest");

            setContests(response.data);
        } catch (error) {
            console.error("Failed to fetch contests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (contestId) => {
        setRegisteringId(contestId);
        try {
            await axios_client.post(`/contest/${contestId}/register`);
            fetchContests();
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed. Please try again.");
            console.error("Registration failed", error);
        } finally {
            setRegisteringId(null);
        }
    };

    const filterContests = () => {
        const now = new Date();
        return contests.filter(contest => {
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            if (activeTab === 'Upcoming') return now < start;
            if (activeTab === 'Ongoing') return now >= start && now <= end;
            if (activeTab === 'Past') return now > end;
            return false;
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    };

    const filteredContests = filterContests();
    const totalContests = contests.length;
    const upcomingCount = contests.filter(c => new Date() < new Date(c.startTime)).length;
    const ongoingCount = contests.filter(c => {
        const now = new Date();
        return now >= new Date(c.startTime) && now <= new Date(c.endTime);
    }).length;


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-sky-100 to-pink-100 dark:from-slate-800 dark:to-slate-600">
                <LoginAccessCard message="You need to be logged in to start or join a collaborative programming session." />
            </div>
        );
    }
    return (
        <div className=" min-h-screen w-full bg-gray-50 dark:bg-[#1E1E1E]">
            {}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Particles
                    particleColors={['#3b82f6', '#8b5cf6', '#ffffff']}
                    particleCount={180}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                    className="absolute inset-0 w-full h-full"
                />
            </div>

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {}
                    <header className="text-center mb-12 space-y-6" data-aos="fade-down">
                        <div className="relative inline-block">
                            <Trophy className="w-12 h-12 mx-auto text-primary drop-shadow-lg" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                                Competitive Programming Contests
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                                Test your skills, climb the leaderboard.
                            </p>
                        </div>

                        {}
                        <div className="flex justify-center gap-8 pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{totalContests}</div>
                                <div className="text-sm text-gray-500 dark:text-slate-400">Total Contests</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-emerald-400">{upcomingCount}</div>
                                <div className="text-sm text-gray-500 dark:text-slate-400">Upcoming</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{ongoingCount}</div>
                                <div className="text-sm text-gray-500 dark:text-slate-400">Live Now</div>
                            </div>
                        </div>
                    </header>

                    {}
                    <div className="flex justify-center mb-10" data-aos="fade-down" data-aos-delay="200">
                        <div className="relative p-1 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/50 shadow-lg">
                            <div className="flex relative">
                                {}
                                <div
                                    className={`absolute top-1 bottom-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl transition-all duration-300 ease-in-out shadow-lg z-0 ${activeTab === 'Upcoming' ? 'left-1 right-[66.666%]' :
                                        activeTab === 'Ongoing' ? 'left-[33.333%] right-[33.333%]' :
                                            'left-[66.666%] right-1'
                                        }`}
                                />

                                {['Upcoming', 'Ongoing', 'Past'].map((tab) => (
                                    <button
                                        key={tab}
                                        className={`relative z-10 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 min-w-[120px] flex items-center justify-center gap-2 ${activeTab === tab
                                            ? 'text-white shadow-lg'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                                            }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab === 'Upcoming' && <Calendar className="w-4 h-4" />}
                                        {tab === 'Ongoing' && <Timer className={`w-4 h-4 ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                                        {tab === 'Past' && <Award className="w-4 h-4" />}

                                        <span>{tab}</span>

                                        {tab === 'Ongoing' && ongoingCount > 0 && (
                                            <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold transition-all duration-300 ${activeTab === tab
                                                ? 'bg-white/20 text-white'
                                                : 'bg-green-500 text-white animate-pulse'
                                                }`}>
                                                {ongoingCount}
                                            </span>
                                        )}

                                        {tab === 'Upcoming' && upcomingCount > 0 && activeTab !== tab && (
                                            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                                                {upcomingCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {}
                    <main className="space-y-8">
                        {loading ? (
                            <div className="flex justify-center p-16">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <div className="absolute top-2 left-2 w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-75"></div>
                                </div>
                            </div>
                        ) : filteredContests.length > 0 ? (
                            filteredContests.map((contest, index) => (
                                <div key={contest._id} data-aos="fade-up" data-aos-delay={index * 100}>
                                    <ContestCard
                                        contest={contest}
                                        onRegister={handleRegister}
                                        isRegistering={registeringId === contest._id}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 space-y-6" >
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm"></div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse"></div>
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        {activeTab === 'Upcoming' && <Calendar className="w-12 h-12 text-gray-400 dark:text-slate-500" />}
                                        {activeTab === 'Ongoing' && <Timer className="w-12 h-12 text-gray-400 dark:text-slate-500" />}
                                        {activeTab === 'Past' && <Award className="w-12 h-12 text-gray-400 dark:text-slate-500" />}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No {activeTab} Contests</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                        {activeTab === 'Upcoming' ? 'New contests are being planned. Check back later for exciting coding challenges!' :
                                            activeTab === 'Ongoing' ? 'No contests are currently running. Keep an eye on upcoming events!' :
                                                'Check out our upcoming contests to participate in future competitions!'}
                                    </p>
                                </div>

                                {}
                                <div className="pt-4">
                                    {activeTab !== 'Upcoming' && upcomingCount > 0 && (
                                        <button
                                            onClick={() => setActiveTab('Upcoming')}
                                            className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                                        >
                                            <Calendar className="w-5 h-5" />
                                            View Upcoming Contests
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ContestPage;