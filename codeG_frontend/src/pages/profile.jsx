import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios_client from "../utils/axiosconfig"; // Your Axios instance
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router';
import Particles from '@/components/ui/particlebg';


// --- Icon Imports ---
import {
    FaStar, FaCode, FaCheckCircle, FaTimesCircle, FaUser, FaCalendarAlt, FaMapMarkerAlt,
    FaTrophy, FaFire, FaChartPie, FaPlus, FaPython, FaJava, FaJsSquare, FaCamera, FaSave, FaTimes
} from 'react-icons/fa';
import { SiCplusplus } from "react-icons/si";



const Card = ({ children, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-base-100 shadow-md border border-base-300/50 rounded-lg p-6 ${className}`}
    >
        {children}
    </motion.div>
);


const ProfileCard = ({ user }) => {
    // --- State Management ---
    const [isEditing, setIsEditing] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form data state
    const [name, setName] = useState(user?.first_name || 'User');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const fileInputRef = useRef(null);

    // --- Core Save Logic ---
    const handleSaveClick = async () => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            let finalPhotoUrl = user.profile_pic_url; // Start with the existing URL

            // --- Step 1: Upload new photo to Cloudinary (if one was selected) ---
            if (photoFile) {
                // 1a: Get the signature from our backend
                const signatureResponse = await axios_client.get('/video/upload/pic');
                const { signature, timestamp, api_key, cloud_name, upload_url, public_id } = signatureResponse.data;

                // 1b: Create FormData for the direct Cloudinary upload
                const formData = new FormData();
                formData.append('file', photoFile);
                formData.append('signature', signature);
                formData.append('timestamp', timestamp);
                formData.append('api_key', api_key);
                formData.append('public_id', public_id);


                // 1c: Upload directly to Cloudinary
                const uploadResponse = await axios.post(upload_url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    },
                });

                // Get the new URL from Cloudinary's response
                finalPhotoUrl = uploadResponse.data.secure_url;
            }

            // --- Step 2: Save the final data to our backend ---
            const updatePayload = {
                first_name: name,
                profile_pic_url: finalPhotoUrl, // Send either the new URL or the original one
            };

            const saveResponse = await axios_client.put(`/user/updateUser`, updatePayload);

            alert('Profile updated successfully!');

            // TODO: Dispatch a Redux action to update the user state globally
            // dispatch(updateUserSuccess(saveResponse.data.user));

            setIsEditing(false);

        } catch (error) {
            console.error("Failed to update profile:", error);
            alert('Update failed. Please check the console and try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // --- Other Handlers (no changes) ---
    const handleEditClick = () => { setIsEditing(true); setName(user?.first_name || 'User'); setPhotoFile(null); setPhotoPreview(null); };
    const handleCancelClick = () => { setIsEditing(false); setPhotoFile(null); setPhotoPreview(null); };
    const handlePhotoInputChange = (e) => {
        const file = e.target.files[0];
        if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
    };
    useEffect(() => { return () => { if (photoPreview) { URL.revokeObjectURL(photoPreview); } }; }, [photoPreview]);
    const avatarSrc = photoPreview || user?.profile_pic_url || 'https://i.imgur.com/rLgnS6y.jpg';

    return (
        <>
            <Card className="items-center text-center">
                {}
                <div className="avatar relative group">
                    <div className="w-32 rounded-full ring ring-[#44444355] ring-offset-base-100 ring-offset-3 cursor-pointer" onClick={() => !isEditing && setIsZoomed(true)}>
                        <img src={avatarSrc} alt="User Avatar" />
                    </div>
                    {isEditing && (
                        <><input type="file" ref={fileInputRef} onChange={handlePhotoInputChange} className="hidden" accept="image/*" />
                            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current.click()} title="Upload new photo">
                                <FaCamera size={24} />
                            </div></>
                    )}
                </div>

                {}
                {isEditing ? (
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered w-full max-w-xs mt-6 text-center text-3xl font-bold" placeholder="Enter your name" disabled={isUploading} />
                ) : (<h1 className="text-3xl font-bold mt-6">{user?.first_name || 'User'}</h1>)}

                <p className="text-base-content/60">{user?.email_id || 'username'}</p>
                <div className="badge badge-primary badge-lg mt-4 font-semibold">Rank #4</div>
                <div className="text-left text-sm text-base-content/70 mt-6 space-y-3">
                    <p className="flex items-center gap-3"><FaUser /><span>Role: {user.role}</span></p>
                    <p className="flex items-center gap-3"><FaCalendarAlt /><span>Joined: {new Date(user.createdAt).toLocaleDateString('en-GB')}</span></p>
                </div>

                {}
                <div className="w-full mt-6 space-y-4">
                    {isUploading && (
                        <div>
                            <progress className="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
                            <p className="text-sm text-center">{uploadProgress}% uploaded</p>
                        </div>
                    )}
                    {isEditing ? (
                        <div className="flex gap-4">
                            <button className="btn btn-ghost flex-1" onClick={handleCancelClick} disabled={isUploading}><FaTimes /> Cancel</button>
                            <button className={`btn btn-primary flex-1 ${isUploading ? 'loading' : ''}`} onClick={handleSaveClick} disabled={isUploading}><FaSave /> Save</button>
                        </div>
                    ) : (
                        <button className="btn btn-primary btn-block" onClick={handleEditClick}>Edit Profile</button>
                    )}
                </div>
            </Card>

            {}
            {isZoomed && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setIsZoomed(false)}>
                    <motion.img layoutId="profile-avatar" src={avatarSrc} alt="User Avatar - Zoomed" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </>
    );
};

/**
 * A reusable card for displaying a single statistic.
 */
const StatCard = ({ icon, title, value, unit = '', children }) => (
    <Card className="text-center">
        <div className="flex justify-center text-3xl text-primary mb-3">{icon}</div>
        <div className="text-4xl font-bold">
            <CountUp end={value} duration={2} />{unit}
        </div>
        <p className="text-base-content/70 mt-1">{title}</p>
        {children}
    </Card>
);

/**
 * An interactive component to show and filter by problem difficulty.
 */
const DifficultyBreakdown = ({ stats, activeFilter, onFilterChange }) => {
    const difficulties = [
        { level: 'Easy', solved: stats.easySolved, total: 3, color: 'text-success', icon: '🟢' },
        { level: 'Medium', solved: stats.mediumSolved, total: 3, color: 'text-warning', icon: '🟡' },
        { level: 'Hard', solved: stats.hardSolved, total: 3, color: 'text-error', icon: '🔴' }
    ];

    return (
        <Card>
            <h2 className="card-title mb-4">Difficulty Breakdown</h2>
            <div className="space-y-4">
                {difficulties.map(({ level, solved, total, color, icon }) => (
                    <div
                        key={level}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${activeFilter === level.toLowerCase() ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-base-content/5'}`}
                        onClick={() => onFilterChange(activeFilter === level.toLowerCase() ? 'all' : level.toLowerCase())}
                    >
                        <div className="flex items-center justify-between text-sm font-semibold">
                            <span className={`flex items-center gap-2 ${color}`}>{icon} {level}</span>
                            <span>{solved} / {total}</span>
                        </div>
                        <progress className={`progress ${color} w-full mt-1 h-[6px]`} value={solved} max={total}></progress>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const languageIcons = {
    'python': <FaPython className="text-blue-400" />,
    'java': <FaJava className="text-orange-500" />,
    'javascript': <FaJsSquare className="text-yellow-400" />,
    'c++': <SiCplusplus className="text-blue-600" />,
};

/**
 * A rich table for displaying user submissions with filters.
 */
const SubmissionsTable = ({ submissions }) => {

    const navigate = useNavigate();

    return (
    
    <div className="overflow-x-auto">
        <table className="table w-full">
            <thead>
                <tr>
                    <th>Problem</th>
                    <th>Status</th>
                    <th>Language</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <AnimatePresence>
                    {submissions.map((sub) => (
                     
                        <motion.tr key={sub._id + new Date(sub.date).toLocaleTimeString()} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover cursor-pointer" onClick={() => navigate(`/problems/${sub.problem_id}`)}>
                             
                            <td className="font-semibold">
                                <div className="flex items-center gap-2">
                                    <span className={`badge badge-xs border-none ${sub.problem_difficulty?.toLowerCase() === 'easy' ? 'bg-success' :
                                        sub.problem_difficulty?.toLowerCase() === 'medium' ? 'bg-warning' :
                                            sub.problem_difficulty?.toLowerCase() === 'hard' ? 'bg-error' : 'bg-base-300'
                                        }`}></span>
                                    {sub.problem_name}
                                </div>
                            </td>
                            <td>
                                <span className={`capitalize font-semibold flex items-center gap-2 ${sub.status === "accepted" ? "text-success" : "text-error"}`}>
                                    {sub.status === "accepted" ? <FaCheckCircle /> : <FaTimesCircle />}
                                    {sub.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                <span className="flex items-center gap-2">
                                    {languageIcons[sub.language?.toLowerCase()] || <FaCode />}
                                    {sub.language || 'N/A'}
                                </span>
                            </td>
                            <td>
                                <div className="tooltip" data-tip={new Date(sub.date).toLocaleString()}>
                                    <span className='text-xs text-base-content/70'>{formatDistanceToNow(new Date(sub.date), { addSuffix: true })}</span>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </AnimatePresence>
            </tbody>
        </table>
    </div>
);
}
/**
 * The calendar heatmap component.
 */
let submissionData = undefined
const CalendarHeatmap = ({ submissions }) => {
    // ... (This self-contained component is already robust and needs no changes)
    submissionData = useMemo(() => {
        const data = { counts: new Map(), totalSubmissions: 0, activeDays: 0, maxStreak: 0 };
        const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        for (const sub of submissions) {
            const subDate = new Date(sub.date);
            if (subDate >= oneYearAgo) { const dateString = format(subDate, 'yyyy-MM-dd'); data.counts.set(dateString, (data.counts.get(dateString) || 0) + 1); }
        }
        data.totalSubmissions = Array.from(data.counts.values()).reduce((sum, count) => sum + count, 0); data.activeDays = data.counts.size;
        let currentStreak = 0;
        for (let i = 0; i < 365; i++) {
            const date = new Date(); date.setDate(date.getDate() - i); const dateString = format(date, 'yyyy-MM-dd');
            if (data.counts.has(dateString)) { currentStreak++; data.maxStreak = Math.max(data.maxStreak, currentStreak); } else { currentStreak = 0; }
        }
        return data;
    }, [submissions]);

    const monthlyGrids = useMemo(() => {
        const today = new Date(); const result = [];
        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1); const monthName = format(monthDate, 'MMM'); const weeks = [];
            const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1); const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0); let currentWeek = new Array(7).fill(null);
            for (let day = new Date(firstDayOfMonth); day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
                const dayOfWeek = day.getDay(); const dateString = format(day, 'yyyy-MM-dd'); currentWeek[dayOfWeek] = { date: dateString, count: submissionData.counts.get(dateString) || 0 };
                if (dayOfWeek === 6) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
            }
            if (currentWeek.some(d => d !== null)) { weeks.push(currentWeek); } result.push({ monthName, weeks });
        }
        return result.reverse();
    }, [submissionData.counts]);

    const getCellColor = (count) => {
        if (count === 0) return 'bg-base-content/10'; if (count <= 2) return 'bg-success/40'; if (count <= 5) return 'bg-success/70'; return 'bg-success';
    };
    const getTooltipText = (day) => {
        if (!day) return ''; const date = parseISO(day.date); const plural = day.count === 1 ? '' : 's';
        return `${day.count} submission${plural} on ${format(date, 'MMM d, yyyy')}`;
    };

    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h2 className="text-lg font-medium">{submissionData.totalSubmissions} submissions in the past year</h2>
                <div className="flex items-center space-x-4 sm:space-x-6 text-sm text-base-content/70">
                    <span>Active days: <span className="font-semibold text-base-content">{submissionData.activeDays}</span></span>
                    <span>Max streak: <span className="font-semibold text-base-content">{submissionData.maxStreak}</span></span>
                </div>
            </div>
            <div className="heatmap-container flex gap-x-3 overflow-x-auto pt-2 pb-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
                {monthlyGrids.map(({ monthName, weeks }, monthIndex) => (
                    <div key={monthIndex} className="flex-shrink-0">
                        <div className="grid grid-flow-col grid-rows-7 gap-1">
                            {weeks.map((week, weekIndex) => week.map((day, dayIndex) => (
                                <div key={`${weekIndex}-${dayIndex}`}
                                    className={`w-3.5 h-3.5 rounded-sm tooltip ${day ? getCellColor(day.count) : 'bg-transparent'}`}
                                    data-tip={getTooltipText(day)} />
                            )))}
                        </div><p className="text-xs text-base-content/60 text-center mt-2">{monthName}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};


// =================================================================================
//  2. MAIN PROFILE PAGE COMPONENT
// =================================================================================

const ProfilePage = () => {
    const user = useSelector((state) => state.auth.user);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user?._id) { setLoading(false); return; }
            try {
                setLoading(true);
                const response = await axios_client.get(`/problem/allsubmission`);
                const sorted = (response.data.submissions || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setSubmissions(sorted);
            } catch (err) { setError(err.message || 'Failed to fetch submissions.'); }
            finally { setLoading(false); }
        };
        fetchSubmissions();
    }, [user]);

    const stats = useMemo(() => {
        const totalSubmissions = submissions.length;
        const acceptedSubmissions = submissions.filter(s => s.status === 'accepted');
        const acceptedCount = acceptedSubmissions.length;
        const solvedProblems = new Map();
        acceptedSubmissions.forEach(sub => {
            if (!solvedProblems.has(sub.problem_name)) {
                solvedProblems.set(sub.problem_name, sub.problem_difficulty?.toLowerCase() || 'easy');
            }
        });
        return {
            totalSubmissions,
            acceptedCount,
            acceptanceRate: totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0,
            easySolved: [...solvedProblems.values()].filter(d => d === 'easy').length,
            mediumSolved: [...solvedProblems.values()].filter(d => d === 'medium').length,
            hardSolved: [...solvedProblems.values()].filter(d => d === 'hard').length,
        };
    }, [submissions]);

    const filteredSubmissions = useMemo(() => {
        return submissions
            .filter(s => {
                if (statusFilter === 'accepted') return s.status === 'accepted';
                if (statusFilter === 'rejected') return s.status !== 'accepted';
                return true;
            })
            .filter(s => {
                if (difficultyFilter === 'all') return true;
                return s.problem_difficulty?.toLowerCase() === difficultyFilter;
            });
    }, [submissions, statusFilter, difficultyFilter]);

    if (loading) {
        return (
            <div className="p-8 font-sans bg-base-200 min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                <div className="lg:col-span-3 space-y-6"><div className="skeleton h-96 w-full"></div><div className="skeleton h-64 w-full"></div></div>
                <div className="lg:col-span-9 space-y-6"><div className="skeleton h-32 w-full"></div><div className="skeleton h-48 w-full"></div><div className="skeleton h-64 w-full"></div></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-error p-10 font-semibold">{error}</div>;
    }

    return (
        <div className="p-4  sm:p-6 lg:p-8 font-sans bg-base-200 min-h-screen">
             <div className="absolute inset-0 z-20 pointer-events-none">
                <Particles
                    particleColors={['#ffffff', '#ffffff']}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {}
                <aside className="lg:col-span-3 space-y-6">
                    <ProfileCard user={user} />
                    <DifficultyBreakdown stats={stats} activeFilter={difficultyFilter} onFilterChange={setDifficultyFilter} />
                </aside>

                {}
                <main className="lg:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={<FaTrophy />} title="Problems Solved" value={stats.easySolved + stats.mediumSolved + stats.hardSolved} />
                        <Card className="text-center items-center">
                            <div
                                className="radial-progress text-success transition-all"
                                style={{
                                    "--value": stats.acceptanceRate,
                                    "--size": "8rem",
                                    "--thickness": "0.8rem"
                                }}
                                role="progressbar"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold">
                                        <CountUp end={stats.acceptanceRate} duration={2} />%
                                    </span>
                                    <span className="text-xs text-base-content/60">Acceptance</span>
                                </div>
                            </div>
                            <div className="tooltip w-full mt-4" data-tip={`${stats.acceptedCount} accepted / ${stats.totalSubmissions} total`}>
                                <p className="text-sm text-base-content/70">{stats.acceptedCount} of {stats.totalSubmissions} subs accepted</p>
                            </div>
                        </Card>
                        <StatCard icon={<FaFire />} title="Max Streak" value={submissionData?.maxStreak} unit=" days" />
                    </div>

                    <CalendarHeatmap submissions={submissions} />

                    <Card>
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                            <h2 className="card-title">Submissions</h2>
                            <div className="tabs tabs-boxed">
                                <a className={`tab ${statusFilter === 'all' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('all')}>All</a>
                                <a className={`tab ${statusFilter === 'accepted' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('accepted')}>Accepted</a>
                                <a className={`tab ${statusFilter === 'rejected' ? 'tab-active' : ''}`} onClick={() => setStatusFilter('rejected')}>Rejected</a>
                            </div>
                        </div>

                        {filteredSubmissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[200px] text-base-content/40 text-center">
                                <FaCode className="text-5xl mb-4" />
                                <h3 className="font-bold">No Submissions Found</h3>
                                <p className='text-sm'>Try adjusting your filters or submitting a new solution!</p>
                            </div>
                        ) : (
                            <SubmissionsTable submissions={filteredSubmissions} />
                        )}
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;