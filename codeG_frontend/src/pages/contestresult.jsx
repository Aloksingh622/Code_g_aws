// src/pages/ContestResultsPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import axiosClient from '../utils/axiosconfig';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ShieldCheck, ChevronLeft } from 'lucide-react';
import 'aos/dist/aos.css';
import AOS from 'aos';

// --- Podium Item Component (for the Top 3) ---
const PodiumItem = ({ entry, rank }) => {
    const styles = {
        1: {
            borderColor: 'border-yellow-400',
            bgColor: 'bg-yellow-400/10',
            textColor: 'text-yellow-400',
            height: 'h-48',
            icon: <Trophy className="w-8 h-8" />
        },
        2: {
            borderColor: 'border-gray-300',
            bgColor: 'bg-gray-300/10',
            textColor: 'text-gray-300',
            height: 'h-40',
            icon: <Medal className="w-8 h-8" />
        },
        3: {
            borderColor: 'border-yellow-600/70',
            bgColor: 'bg-yellow-600/10',
            textColor: 'text-yellow-600/80',
            height: 'h-40',
            icon: <Star className="w-8 h-8" />
        },
    };
    const style = styles[rank];

    return (
        <motion.div
            className={`flex flex-col items-center justify-end w-1/3 p-4 m-1 rounded-t-xl border-b-4 ${style.borderColor} ${style.bgColor} ${style.height}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: rank * 0.2 }}
        >
            <img
                src={entry.userId.profile_pic_url || `https://ui-avatars.com/api/?name=${entry.userId.first_name}&background=random`}
                alt={entry.userId.username}
                className="w-16 h-16 rounded-full border-2 border-white/50 shadow-lg"
            />
            <h3 className="mt-2 text-lg font-bold text-white truncate">{entry.userId.first_name}</h3>
            <div className={`mt-2 p-2 rounded-full ${style.textColor}`}>{style.icon}</div>
            <p className="mt-1 text-2xl font-black text-white">{entry.totalSolved}</p>
            <p className="text-xs text-gray-400">Solved</p>
        </motion.div>
    );
};

// --- Leaderboard Row Component (for ranks 4+) ---
const LeaderboardRow = ({ entry, rank }) => (
    <motion.tr
        className="border-b border-gray-700/50 hover:bg-gray-500/10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: (rank - 4) * 0.05 }}
    >
        <td className="p-4 text-center font-bold text-lg text-gray-300">{rank}</td>
        <td className="p-4 flex items-center space-x-3">
            <img src={entry.userId.profile_pic_url || `https://ui-avatars.com/api/?name=${entry.userId.first_name}&background=random`} alt={entry.userId.username} className="w-10 h-10 rounded-full" />
            <span className="font-semibold text-white">{entry.userId.first_name}</span>
        </td>
        <td className="p-4 text-center text-lg font-semibold text-green-400">{entry.totalSolved}</td>
        <td className="p-4 text-center font-mono text-sm text-gray-400">{entry.totalScore}</td>
        <td className="p-4 text-center text-sm text-gray-500">{new Date(entry.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
    </motion.tr>
);


const ContestResultsPage = () => {
    const { contestId } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 800 });
        const fetchLeaderboard = async () => {
            try {
                const response = await axiosClient.get(`/contest/${contestId}/leaderboard`);
                setLeaderboard(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load results.');
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [contestId]);


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
if (error) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400 text-xl">{error}</div>;

    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center justify-between mb-12" data-aos="fade-down">
                     <Link to="/contest" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} /> Back to Contests
                    </Link>
                    <div className="text-center">
                        <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                        <h1 className="text-4xl font-extrabold tracking-tight">Final Standings</h1>
                        <p className="text-lg text-gray-400">The results are in. Congratulations to all participants!</p>
                    </div>
                    <div className="w-36"></div> {}
                </header>

                {}
                {topThree.length > 0 && (
                    <div className="flex items-end justify-center mb-12" data-aos="fade-up">
                        {topThree.find(e => leaderboard.indexOf(e) + 1 === 2) && <PodiumItem entry={topThree.find(e => leaderboard.indexOf(e) + 1 === 2)} rank={2} />}
                        {topThree.find(e => leaderboard.indexOf(e) + 1 === 1) && <PodiumItem entry={topThree.find(e => leaderboard.indexOf(e) + 1 === 1)} rank={1} />}
                        {topThree.find(e => leaderboard.indexOf(e) + 1 === 3) && <PodiumItem entry={topThree.find(e => leaderboard.indexOf(e) + 1 === 3)} rank={3} />}
                    </div>
                )}
                
                {}
                 {restOfLeaderboard.length > 0 && (
                    <div className="bg-[#1c1c1c]/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl" data-aos="fade-up" data-aos-delay="300">
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-gray-700">
                                <tr>
                                    <th className="p-4 w-20 text-center text-gray-400 font-semibold tracking-wider">Rank</th>
                                    <th className="p-4 text-gray-400 font-semibold tracking-wider">User</th>
                                    <th className="p-4 w-32 text-center text-gray-400 font-semibold tracking-wider">Solved</th>
                                    <th className="p-4 w-32 text-center text-gray-400 font-semibold tracking-wider">Score</th>
                                    <th className="p-4 w-40 text-center text-gray-400 font-semibold tracking-wider">Finish Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restOfLeaderboard.map((entry, index) => (
                                    <LeaderboardRow key={entry._id} rank={index + 4} entry={entry} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ContestResultsPage;