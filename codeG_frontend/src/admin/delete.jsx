import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Trash2, ShieldAlert, Grid, List, Puzzle } from "lucide-react"; // Added Puzzle Icon
import axios_client from "@/utils/axiosconfig";
import Particles from "@/components/ui/particlebg";
import CountUp from "@/components/ui/counting";

export default function DeleteProblemPage() {
    const [problems, setProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("grid");

    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [confirmInput, setConfirmInput] = useState("");
    const [notification, setNotification] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    // Fetch problems
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const response = await axios_client.get("/problem/getAllProblem");
                setProblems(response.data.problem);
            } catch (err) {
                setError(err.message || 'Failed to fetch problems.');
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // Filter problems
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = problems.filter(problem =>
            problem.title.toLowerCase().includes(lowercasedQuery) ||
            String(problem.serial_number).includes(lowercasedQuery)
        );
        setFilteredProblems(filtered);
    }, [searchQuery, problems]);

    // Auto-hide notification
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Handle confirmed deletion
    const handleConfirmDelete = async () => {
        if (!deleteCandidate || String(confirmInput) !== String(deleteCandidate.serial_number)) {
            setNotification({ message: 'Serial number does not match. Deletion cancelled.', type: 'error' });
            return;
        }

        try {
            await axios_client.delete(`/problem/delete?by=id&value=${deleteCandidate._id}`);
            setProblems(prev => prev.filter(p => p._id !== deleteCandidate._id));
            setNotification({ message: `Problem "${deleteCandidate.title}" deleted successfully.`, type: 'success' });
        } catch (err) {
            setNotification({ message: err.response?.data?.message || 'Deletion failed.', type: 'error' });
        } finally {
            setDeleteCandidate(null);
            setConfirmInput("");
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case "easy": return "badge-success";
            case "medium": return "badge-warning";
            case "hard": return "badge-error";
            default: return "badge-neutral";
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center p-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
        if (error) return <div className="alert alert-error"><span>{error}</span></div>;
        if (problems.length > 0 && filteredProblems.length === 0) return <div className="text-center py-16"><div className="text-6xl mb-4">🔍</div><h3 className="text-xl font-semibold">No problems match your search.</h3></div>;
        if (filteredProblems.length === 0) return <div className="text-center py-16"><div className="text-6xl mb-4">🎉</div><h3 className="text-xl font-semibold">No problems to manage.</h3></div>;

        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProblems.map(problem => (
                        <div key={problem._id} className="card bg-base-200/50 shadow-lg transition-all duration-300 hover:shadow-error/20 hover:border-error border border-transparent group">
                            <div className="card-body">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="badge badge-outline font-bold">#{problem.serial_number}</div>
                                    <div className={`badge ${getDifficultyColor(problem.difficulty)} font-semibold`}>{problem.difficulty}</div>
                                </div>
                                <h2 className="card-title text-lg mb-1 line-clamp-2">{problem.title}</h2>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {problem.tags.split(',').map((tag, index) => (
                                        <span key={index} className="badge badge-ghost badge-sm">{tag.trim()}</span>
                                    ))}
                                </div>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-error btn-sm gap-2 text-white" onClick={() => setDeleteCandidate(problem)}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems.map((problem) => (
                            <tr key={problem._id} className="hover">
                                <td className="font-bold">#{problem.serial_number}</td>
                                <td className="font-semibold max-w-sm truncate">{problem.title}</td>
                                <td><div className={`badge ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</div></td>
                                <td className="text-right">
                                    <button className="btn btn-error btn-sm gap-2 text-white" onClick={() => setDeleteCandidate(problem)}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-base-200 w-full p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-0 z-0 pointer-events-none">
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

            <div className="relative z-10 max-w-7xl mx-auto">
                {}
                <div className="text-center mb-12">
                    <Puzzle size={48} className="mx-auto text-primary mb-4" />
                    <h1 className="text-4xl sm:text-5xl font-bold">Manage Problems</h1>
                    <p className="text-base-content/70 mt-2 text-lg">Search, view, and permanently delete problems.</p>
                    <div className="mt-6 inline-block">
                        <div className="text-sm text-base-content/70 font-medium">Total Problems</div>
                        <div className="text-3xl font-bold text-primary mt-1">{
                            <CountUp
                                from={0}
                                to={problems.length}
                                separator=","
                                direction="up"
                                duration={2}
                                className="count-up-text"
                            />}</div>
                    </div>
                </div>

                {}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        {}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 pb-6 border-b border-base-300">
                            <div className="form-control w-full md:max-w-md">
                                <div className="relative w-full">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" />
                                    <input type="text" placeholder="Search by title or S.No..." className="input input-bordered w-full pl-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                            </div>
                            <div className="join">
                                <button className={`btn join-item gap-2 ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => setViewMode('grid')}><Grid size={16} />Grid</button>
                                <button className={`btn join-item gap-2 ${viewMode === 'table' ? 'btn-primary' : ''}`} onClick={() => setViewMode('table')}><List size={16} />Table</button>
                            </div>
                        </div>

                        {}
                        {renderContent()}
                    </div>
                </div>
            </div>

            {}
            <input type="checkbox" id="delete-confirm-modal" className="modal-toggle" checked={!!deleteCandidate} readOnly />
            <div className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <ShieldAlert className="w-16 h-16 text-error mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-center">Confirm Deletion</h3>
                    <p className="py-2 text-center text-sm">This action is irreversible. To confirm, type the problem's serial number.</p>
                    <p className="text-center font-mono text-lg p-2 bg-error/10 text-error rounded-md my-2">{deleteCandidate?.serial_number}</p>
                    <div className="form-control mt-4">
                        <input
                            type="text"
                            className="input input-bordered w-full text-center font-bold"
                            placeholder="Type serial number here..."
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                        />
                    </div>
                    <div className="modal-action justify-center gap-4 mt-4">
                        <button className="btn" onClick={() => { setDeleteCandidate(null); setConfirmInput(""); }}>Cancel</button>
                        <button
                            className="btn btn-error text-white"
                            onClick={handleConfirmDelete}
                            disabled={String(confirmInput) !== String(deleteCandidate?.serial_number)}>
                            <Trash2 size={14} /> Yes, Delete It
                        </button>
                    </div>
                </div>
            </div>

            {}
            {notification.message && (
                <div className="toast toast-top toast-center min-w-max z-50">
                    <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}