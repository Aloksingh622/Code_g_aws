import React, { useState, useEffect } from 'react';
import axios_client from '../utils/axiosconfig'; // Adjust path if needed
import { Link } from 'react-router';
import { Trophy, Plus, Eye, Edit, Trash2, Users, FileText, Calendar, Clock, AlertTriangle, Grid, List } from 'lucide-react';

// --- Custom Imports for Themed Style & Animation ---
import AOS from 'aos';
import 'aos/dist/aos.css';
import Particles from '../components/ui/particlebg'; // Adjust path if needed
import RotatingText from '../animations/rotatingtext';
import CountUp from '../components/ui/counting';

// ====================================================================
// --- Reusable Contest Details Modal Component ---
// ====================================================================
const ContestDetailsModal = ({ contest, onClose }) => {
    if (!contest) return null;

    // A simple tab state for the modal
    const [activeModalTab, setActiveModalTab] = useState('Participants');

    const formatDateTime = (isoString) => new Date(isoString).toLocaleString([], {
        dateStyle: 'medium', timeStyle: 'short'
    });

    const calculateDuration = (start, end) => {
        const minutes = (new Date(end) - new Date(start)) / 60000;
        return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    // Handle backdrop click properly
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={`modal ${contest ? 'modal-open' : ''}`} onClick={handleBackdropClick}>
            <div className="modal-box w-11/12 max-w-2xl bg-base-100/70 backdrop-blur-md border border-base-300/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {}
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
                
                <div className="relative">
                    <div className="absolute right-4 top-4">
                        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost bg-base-200/50 backdrop-blur-sm border border-base-300/20 hover:bg-error/20 hover:text-error transition-all duration-300">✕</button>
                    </div>

                    <h3 className="font-bold text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">{contest.title}</h3>
                    <p className='text-base-content/70 mb-6'>{contest.description}</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6 text-base-content/80">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary" /> 
                            <strong>Starts:</strong> {formatDateTime(contest.startTime)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-primary" /> 
                            <strong>Duration:</strong> {calculateDuration(contest.startTime, contest.endTime)}
                        </div>
                    </div>

                    <div className="relative p-1 bg-base-200/50 backdrop-blur-sm rounded-2xl border border-base-300/20 shadow-lg mb-4">
                        <div className="flex relative">
                            {}
                            <div
                                className={`absolute top-1 bottom-1 bg-gradient-to-r from-primary to-secondary rounded-xl transition-all duration-300 ease-in-out shadow-lg z-0 ${
                                    activeModalTab === 'Participants' ? 'left-1 right-[50%]' : 'left-[50%] right-1'
                                }`}
                            />
                            
                            <button
                                className={`relative z-10 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
                                    activeModalTab === 'Participants'
                                        ? 'text-white shadow-lg'
                                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200/10'
                                }`}
                                onClick={() => setActiveModalTab('Participants')}
                            >
                                <Users size={16} />
                                Participants ({contest.participants?.length || 0})
                            </button>
                            <button
                                className={`relative z-10 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
                                    activeModalTab === 'Problems'
                                        ? 'text-white shadow-lg'
                                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200/10'
                                }`}
                                onClick={() => setActiveModalTab('Problems')}
                            >
                                <FileText size={16} />
                                Problems ({contest.problems?.length || 0})
                            </button>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto bg-base-200/30 backdrop-blur-sm p-4 rounded-lg border border-base-300/20">
                        {activeModalTab === 'Participants' && (
                            contest.participants && contest.participants.length > 0 ? (
                                <ul className="space-y-3">
                                    {contest.participants.map(user => (
                                        <li key={user._id} className="flex items-center gap-3 p-2 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/20 hover:bg-base-100/50 transition-all duration-300">
                                            <div className="avatar">
                                                <div className="w-8 rounded-full ring-2 ring-primary/20">
                                                    <img src={user.profile_pic_url || `https://ui-avatars.com/api/?name=${user.first_name}&background=random`} alt={user.first_name} />
                                                </div>
                                            </div>
                                            <span className="font-semibold text-base-content">{user.first_name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">👥</div>
                                    <p className='text-base-content/60'>No participants have registered yet.</p>
                                </div>
                            )
                        )}

                        {activeModalTab === 'Problems' && (
                            contest.problems && contest.problems.length > 0 ? (
                                <ul className="space-y-2">
                                    {contest.problems.map(problem => (
                                        <li key={problem._id} className='bg-base-100/30 backdrop-blur-sm p-3 rounded-lg border border-base-300/20 font-mono text-sm text-base-content hover:bg-base-100/50 transition-all duration-300'>
                                            <span className="badge badge-outline badge-sm bg-primary/10 text-primary border-primary/20 mr-2">#{problem.serial_number}</span>
                                            {problem.title}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📝</div>
                                    <p className='text-base-content/60'>No problems added yet.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ====================================================================
// --- Main Admin Contest List Page ---
// ====================================================================
const AdminContestListPage = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewingContest, setViewingContest] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [viewMode, setViewMode] = useState("table");

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
        });
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            // This endpoint fetches all contests, including registration status
            const response = await axios_client.get("/contest/getcontest");
            setContests(response.data);
        } catch (err) {
            setError("Failed to fetch contests.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (contest) => {
        setDeleteTarget(contest);
    };

    const handleViewClick = async (contestId) => {
        try {
            setModalLoading(true);
            // Fetches the populated details for a single contest
            const response = await axios_client.get(`/contest/${contestId}`);
            setViewingContest(response.data);
        } catch (err) {
            alert("Could not fetch contest details.");
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios_client.delete(`/contest/delete/${deleteTarget._id}`);
            setContests(contests.filter(c => c._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            alert("Failed to delete contest.");
            console.error("Delete error:", err);
            setDeleteTarget(null);
        }
    };

    const formatDateTime = (iso) => new Date(iso).toLocaleString();
    const calculateDuration = (start, end) => {
        const minutes = Math.round((new Date(end) - new Date(start)) / 60000);
        return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };
    
    const getStatusBadge = (start, end) => {
        const now = new Date();
        if (now < new Date(start)) return <div className="badge badge-info font-semibold shadow-sm">Upcoming</div>;
        if (now >= new Date(start) && now <= new Date(end)) return <div className="badge badge-success font-semibold shadow-sm animate-pulse">Ongoing</div>;
        return <div className="badge badge-neutral font-semibold shadow-sm">Past</div>;
    };

    // Handle backdrop click for delete modal
    const handleDeleteBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setDeleteTarget(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-[400px]" data-aos="fade-in">
                    <div className="text-center space-y-4">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-base-content/70">Loading contests...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="group relative" data-aos="fade-up">
                    <div className="absolute inset-0 bg-gradient-to-r from-error to-warning rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                    <div className="relative alert alert-error shadow-xl bg-base-100/70 backdrop-blur-md border border-error/20">
                        <div>
                            <AlertTriangle className="stroke-current flex-shrink-0 h-6 w-6" />
                            <span>{error}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (contests.length === 0) {
            return (
                <div className="text-center py-16" data-aos="fade-up">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No contests found</h3>
                    <p className="text-base-content/60 mb-6">Get started by adding your first contest</p>
                    <Link to="/admin/contests/create" className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white gap-2">
                        <Plus size={16} />
                        Add New Contest
                    </Link>
                </div>
            );
        }

        if (viewMode === "grid") {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {contests.map((contest, index) => (
                        <div 
                            key={contest._id} 
                            className="group relative"
                            data-aos="fade-up"
                            data-aos-delay={index * 50}
                        >
                            {}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-10 group-hover:opacity-30 transition-all duration-300"></div>
                            
                            {}
                            <div className="relative card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                <div className="card-body">
                                    <div className="flex items-start justify-between mb-3">
                                        {getStatusBadge(contest.startTime, contest.endTime)}
                                        <div className="dropdown dropdown-end">
                                            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">⋮</div>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100/70 backdrop-blur-md rounded-box w-32 border border-base-300/20">
                                                <li>
                                                    <button
                                                        onClick={() => handleViewClick(contest._id)}
                                                        className={`text-sm ${modalLoading ? 'loading' : ''}`}
                                                        disabled={modalLoading}
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                </li>
                                                <li>
                                                    <Link to={`/admin/contests/edit/${contest._id}`} className="text-sm">
                                                        <Edit size={14} /> Edit
                                                    </Link>
                                                </li>
                                                <li>
                                                    <button onClick={() => handleDeleteClick(contest)} className="text-sm text-error">
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <h2 className="card-title text-lg mb-3 line-clamp-2 bg-gradient-to-r from-base-content to-base-content/80 bg-clip-text">
                                        {contest.title}
                                    </h2>
                                    <p className="text-base-content/70 text-sm mb-4 line-clamp-2">{contest.description}</p>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-base-content/80">
                                            <Calendar className="w-4 h-4 text-primary/70" />
                                            <span>{formatDateTime(contest.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-base-content/80">
                                            <Clock className="w-4 h-4 text-primary/70" />
                                            <span>{calculateDuration(contest.startTime, contest.endTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-base-content/80">
                                            <Users className="w-4 h-4 text-primary/70" />
                                            <span>{contest.participants?.length || 0} / {contest.maxParticipants} participants</span>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-end">
                                        <button
                                            onClick={() => handleViewClick(contest._id)}
                                            className="btn btn-primary btn-sm gap-2 bg-gradient-to-r from-primary to-secondary border-none text-white"
                                            disabled={modalLoading}
                                        >
                                            <Eye size={14} />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div 
                className="group relative"
                data-aos="fade-up"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-sm opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr className="bg-base-200/50 backdrop-blur-sm">
                                    <th className="font-bold text-base-content">Title</th>
                                    <th className="font-bold text-base-content">Status</th>
                                    <th className="font-bold text-base-content">Start Time</th>
                                    <th className="font-bold text-base-content">Duration</th>
                                    <th className="font-bold text-base-content">Participants</th>
                                    <th className="font-bold text-base-content text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contests.map((contest, index) => (
                                    <tr key={contest._id} className="hover:bg-base-200/30 transition-colors duration-200">
                                        <td className="font-semibold text-base-content max-w-md">
                                            <div className="truncate">{contest.title}</div>
                                        </td>
                                        <td>{getStatusBadge(contest.startTime, contest.endTime)}</td>
                                        <td className='text-base-content/80'>{formatDateTime(contest.startTime)}</td>
                                        <td className='text-base-content/80'>{calculateDuration(contest.startTime, contest.endTime)}</td>
                                        <td>
                                            <span className='font-mono bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20'>
                                                {contest.participants?.length || 0} / {contest.maxParticipants}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewClick(contest._id)}
                                                    className={`btn btn-ghost btn-xs hover:bg-info/20 hover:text-info ${modalLoading ? 'loading' : ''}`}
                                                    title="View"
                                                    disabled={modalLoading}
                                                >
                                                    {!modalLoading && <Eye size={16} />}
                                                </button>
                                                <Link to={`/admin/contests/edit/${contest._id}`} className="btn btn-ghost btn-xs hover:bg-warning/20 hover:text-warning" title="Edit">
                                                    <Edit size={16} />
                                                </Link>
                                                <button onClick={() => handleDeleteClick(contest)} className="btn btn-ghost btn-xs hover:bg-error/20 hover:text-error" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-base-100 p-4 sm:p-8 overflow-hidden">
            {}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Particles
                    particleColors={['#ffffff', '#ffffff']}
                    particleCount={180}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                />
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--color-primary),0.1),transparent)]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--color-accent),0.1),transparent)]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {}
                <div className="text-center space-y-4 pt-10" data-aos="fade-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        🏆 Contest Management Hub
                    </h1>
                    <RotatingText
                        texts={['Manage competitive events', 'Create coding challenges', 'Monitor contest progress', 'Build coding community']}
                        mainClassName="text-base-content/70 font-medium text-base sm:text-lg flex justify-center"
                        staggerDuration={0.03}
                        rotationInterval={4000}
                    />
                    
                    <div className="flex justify-center gap-8 mt-6">
                        <div className="text-center" data-aos="fade-up" data-aos-delay="100">
                            <div className="group relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                                <div className="relative bg-base-100/70 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-base-300/20">
                                    <div className="text-sm text-base-content/70 font-medium">Total Contests</div>
                                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-1">
                                        <CountUp
                                            from={0}
                                            to={contests.length}
                                            separator=","
                                            direction="up"
                                            duration={2}
                                            className="count-up-text"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                            <div className="group relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-success to-info rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                                <div className="relative bg-base-100/70 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-base-300/20">
                                    <div className="text-sm text-base-content/70 font-medium">Active Contests</div>
                                    <div className="text-3xl font-bold bg-gradient-to-r from-success to-info bg-clip-text text-transparent mt-1">
                                        <CountUp
                                            from={0}
                                            to={contests.filter(c => {
                                                const now = new Date();
                                                return now >= new Date(c.startTime) && now <= new Date(c.endTime);
                                            }).length}
                                            separator=","
                                            direction="up"
                                            duration={2}
                                            className="count-up-text"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div 
                    className="group relative"
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-info to-primary rounded-xl blur-sm opacity-10 group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20">
                        <div className="card-body">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Trophy className="text-primary w-6 h-6" />
                                    <div>
                                        <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Manage Contests</h2>
                                        <p className="text-base-content/60 text-sm">View, create, edit, and delete all competitive events</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="join">
                                        <button
                                            className={`btn join-item gap-2 ${
                                                viewMode === 'table' 
                                                    ? 'btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white' 
                                                    : 'btn-outline'
                                            }`}
                                            onClick={() => setViewMode('table')}
                                        >
                                            <List size={16} />
                                            Table
                                        </button>
                                        <button
                                            className={`btn join-item gap-2 ${
                                                viewMode === 'grid' 
                                                    ? 'btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white' 
                                                    : 'btn-outline'
                                            }`}
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid size={16} />
                                            Grid
                                        </button>
                                    </div>
                                    
                                    <Link to="/admin/contests/create" className="btn btn-primary bg-gradient-to-r from-primary to-secondary border-none text-white gap-2">
                                        <Plus size={16} />
                                        Add New Contest
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <main>
                    {renderContent()}
                </main>
            </div>

            {}
            <ContestDetailsModal contest={viewingContest} onClose={() => setViewingContest(null)} />

            {}
            <div className={`modal ${deleteTarget ? 'modal-open' : ''}`} onClick={handleDeleteBackdropClick}>
                <div className="modal-box bg-base-100/70 backdrop-blur-md border border-base-300/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    {}
                    <div className="absolute inset-0 bg-gradient-to-r from-error to-warning rounded-xl blur-sm opacity-20 transition-all duration-300"></div>
                    
                    <div className="relative">
                        <h3 className="font-bold text-xl text-error flex items-center gap-2 mb-4">
                            <AlertTriangle />
                            Confirm Deletion
                        </h3>
                        <p className="py-4 text-base-content">
                            Are you sure you want to delete the contest <span className="font-semibold text-primary">"{deleteTarget?.title}"</span>? This action cannot be undone.
                        </p>
                        <div className="modal-action">
                            <button onClick={() => setDeleteTarget(null)} className="btn btn-outline">Cancel</button>
                            <button onClick={confirmDelete} className="btn btn-error">Delete Contest</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContestListPage;