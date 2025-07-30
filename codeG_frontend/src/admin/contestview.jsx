import React, { useState, useEffect } from 'react';
import axios_client from '../../utils/axiosconfig'; // Adjust path if needed
import { Link } from 'react-router-dom';
import { Trophy, Plus, Eye, Edit, Trash2, Users, FileText, Calendar, Clock, AlertTriangle } from 'lucide-react';

// --- Custom Imports for Themed Style & Animation ---
import AOS from 'aos';
import 'aos/dist/aos.css';
import Particles from '../../components/ui/particlebg'; // Adjust path if needed


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
        return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes/60)}h ${minutes % 60}m`;
    };
    
    return (
        <div className={`modal ${contest ? 'modal-open' : ''}`}>
            <div className="modal-box w-11/12 max-w-2xl bg-base-200 border border-gray-700 shadow-2xl">
                <div className="absolute right-4 top-4">
                     <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-white">✕</button>
                </div>
                
                <h3 className="font-bold text-2xl text-white mb-2">{contest.title}</h3>
                <p className='text-gray-400 mb-6'>{contest.description}</p>
                
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6 text-gray-300">
                    <div className="flex items-center gap-2"><Calendar size={14} /> <strong>Starts:</strong> {formatDateTime(contest.startTime)}</div>
                    <div className="flex items-center gap-2"><Clock size={14} /> <strong>Duration:</strong> {calculateDuration(contest.startTime, contest.endTime)}</div>
                </div>

                <div className="tabs tabs-boxed mb-4">
                    <a className={`tab ${activeModalTab === 'Participants' ? 'tab-active' : ''}`} onClick={() => setActiveModalTab('Participants')}>
                        <Users size={16} className="mr-2"/> Participants ({contest.participants.length})
                    </a> 
                    <a className={`tab ${activeModalTab === 'Problems' ? 'tab-active' : ''}`} onClick={() => setActiveModalTab('Problems')}>
                         <FileText size={16} className="mr-2"/> Problems ({contest.problems.length})
                    </a>
                </div>
                
                <div className="max-h-60 overflow-y-auto bg-base-100/10 p-4 rounded-lg">
                    {activeModalTab === 'Participants' && (
                         contest.participants.length > 0 ? (
                            <ul className="space-y-3">
                                {contest.participants.map(user => (
                                    <li key={user._id} className="flex items-center gap-3">
                                        <div className="avatar"><div className="w-8 rounded-full"><img src={user.profile_pic_url || `https://ui-avatars.com/api/?name=${user.first_name}&background=random`} alt={user.first_name} /></div></div>
                                        <span className="font-semibold text-white">{user.first_name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (<p className='text-center text-gray-500 py-4'>No participants have registered yet.</p>)
                    )}

                    {activeModalTab === 'Problems' && (
                        <ul className="space-y-2">
                             {contest.problems.map(problem => (
                                <li key={problem._id} className='bg-base-100/10 p-2 rounded-md font-mono text-sm text-white'>
                                    #{problem.serial_number} - {problem.title}
                                </li>
                             ))}
                        </ul>
                    )}
                </div>
            </div>
             <div className="modal-backdrop"><button onClick={onClose}>close</button></div>
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
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [viewingContest, setViewingContest] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            // This endpoint fetches all contests, including registration status
            const response = await axios_client.get("/contests");
            setContests(response.data);
        } catch (err) {
            setError("Failed to fetch contests.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (contest) => {
        setDeleteCandidate(contest);
    };
    
    const handleViewClick = async (contestId) => {
        setModalLoading(true);
        try {
            // Fetches the populated details for a single contest
            const response = await axios_client.get(`/contests/${contestId}`);
            setViewingContest(response.data);
        } catch (err) {
            alert("Could not fetch contest details.");
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteCandidate) return;
        try {
            await axios_client.delete(`/contests/${deleteCandidate._id}`);
            setContests(contests.filter(c => c._id !== deleteCandidate._id));
            setDeleteCandidate(null);
        } catch (err) {
            alert("Failed to delete contest.");
            console.error("Delete error:", err);
            setDeleteCandidate(null);
        }
    };

    const formatDateTime = (iso) => new Date(iso).toLocaleString();
    const calculateDuration = (start, end) => {
        const minutes = Math.round((new Date(end) - new Date(start)) / 60000);
        return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };
    const getStatusBadge = (start, end) => {
        const now = new Date();
        if (now < new Date(start)) return <div className="badge badge-info text-white">Upcoming</div>;
        if (now >= new Date(start) && now <= new Date(end)) return <div className="badge badge-success text-white animate-pulse">Ongoing</div>;
        return <div className="badge badge-neutral">Past</div>;
    };

    return (
        <div className="relative min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-[#1E1E1E]">
            <Particles particleColors={['#ffffff']} className="absolute inset-0 z-0"/>
            <div className="relative z-10 max-w-7xl mx-auto">
                <header data-aos="fade-down" className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-700">
                    <div>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3"><Trophy className="text-primary"/> Manage Contests</h1>
                        <p className="text-gray-400 mt-2">View, create, edit, and delete all competitive events.</p>
                    </div>
                    <Link to="/admin/contests/create" className="btn btn-primary btn-md"><Plus size={20} /> Add New Contest</Link>
                </header>

                {loading ? <div className="text-center py-10"><span className="loading loading-spinner loading-lg"></span></div> : 
                 error ? <div className="alert alert-error"><span>{error}</span></div> :
                (
                    <div data-aos="fade-up" className="overflow-x-auto bg-base-100/5 border border-gray-700 rounded-lg shadow-lg">
                        <table className="table w-full">
                            <thead className="text-sm text-white bg-base-100/10"><tr><th>Title</th><th>Status</th><th>Start Time</th><th>Duration</th><th>Participants</th><th className="text-right">Actions</th></tr></thead>
                            <tbody>
                                {contests.map((contest, index) => (
                                    <tr key={contest._id} data-aos-delay={index * 50} className="hover:bg-base-100/10">
                                        <td className="font-bold text-white">{contest.title}</td>
                                        <td>{getStatusBadge(contest.startTime, contest.endTime)}</td>
                                        <td className='text-gray-300'>{formatDateTime(contest.startTime)}</td>
                                        <td className='text-gray-300'>{calculateDuration(contest.startTime, contest.endTime)}</td>
                                        <td><span className='font-mono bg-base-300/40 px-2 py-1 rounded-md text-primary'>{contest.participants.length} / {contest.maxParticipants}</span></td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleViewClick(contest._id)} className={`btn btn-ghost btn-xs ${(modalLoading && viewingContest?._id === contest._id) ? 'loading' : ''}`} title="View"><Eye size={16}/></button>
                                                <Link to={`/admin/contests/edit/${contest._id}`} className="btn btn-ghost btn-xs text-info" title="Edit"><Edit size={16} /></Link>
                                                <button onClick={() => handleDeleteClick(contest)} className="btn btn-ghost btn-xs text-error" title="Delete"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {contests.length === 0 && <p className="text-center p-8 text-gray-500">No contests found. Get started by adding a new one!</p>}
                    </div>
                )}
            </div>

            <ContestDetailsModal contest={viewingContest} onClose={() => setViewingContest(null)} />

            <div className={`modal ${deleteCandidate ? 'modal-open' : ''}`}>
                <div className="modal-box bg-base-200 border border-gray-700">
                    <h3 className="font-bold text-xl text-error flex items-center gap-2"><AlertTriangle/>Confirm Deletion</h3>
                    <p className="py-4 text-white">Are you sure you want to delete the contest "{deleteCandidate?.title}"? This action cannot be undone.</p>
                    <div className="modal-action">
                        <button onClick={() => setDeleteCandidate(null)} className="btn">Cancel</button>
                        <button onClick={confirmDelete} className="btn btn-error">Delete</button>
                    </div>
                </div>
                 <div className="modal-backdrop"><button onClick={() => setDeleteCandidate(null)}>close</button></div>
            </div>
        </div>
    );
};

export default AdminContestListPage;