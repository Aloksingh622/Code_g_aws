


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Trash2, ShieldAlert, Grid, List } from "lucide-react";
import axios_client from "@/utils/axiosconfig";
import { NavLink } from "react-router";
import Particles from "@/components/ui/particlebg";
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from "../components/ui/counting";

export default function AdminVideo() {
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

    useEffect(() => {
        AOS.init({ duration: 800, once: false });
    }, []);

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

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = problems.filter(problem =>
            problem.title.toLowerCase().includes(lowercasedQuery) ||
            String(problem.serial_number).includes(lowercasedQuery)
        );
        setFilteredProblems(filtered);
    }, [searchQuery, problems]);

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleConfirmDelete = async () => {
        if (!deleteCandidate || String(confirmInput) !== String(deleteCandidate.serial_number)) {
            setNotification({ message: 'Serial number does not match. Deletion cancelled.', type: 'error' });
            return;
        }
        try {
            await axios_client.delete(`/video/delete?by=problem&value=${deleteCandidate._id}`);
            setProblems(prev => prev.filter(p => p._id !== deleteCandidate._id));
            setNotification({ message: `Problem \"${deleteCandidate.title}\" deleted successfully.`, type: 'success' });
        } catch (error) {
            setNotification({
                message: error.response?.data?.message || "Deletion failed.",
                type: "error",
            });
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
        if (isLoading) return <div className="flex justify-center items-center min-h-[300px]"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
        if (error) return <div className="alert alert-error shadow-xl">{error}</div>;
        if (filteredProblems.length === 0) {
            return (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold text-base-content/70">{problems.length ? 'No matching problems.' : 'No problems available.'}</h2>
                </div>
            );
        }

        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProblems.map(problem => (
                        <div key={problem._id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-10 group-hover:opacity-30 transition-all duration-300"></div>
                            <div className="relative card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20">
                                <div className="card-body">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="badge badge-outline font-bold">#{problem.serial_number}</div>
                                        <div className={`badge ${getDifficultyColor(problem.difficulty)} font-semibold`}>{problem.difficulty}</div>
                                    </div>
                                    <h2 className="card-title line-clamp-2 text-lg mb-2">{problem.title}</h2>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {problem.tags.split(',').map((tag, i) => (
                                            <span key={i} className="badge badge-ghost badge-sm bg-base-200/50 border border-base-300/20">{tag.trim()}</span>
                                        ))}
                                    </div>
                                    <div className="card-actions justify-end gap-2">
                                        <NavLink to={`/admin/video/upload/${problem._id}`} className="btn btn-primary btn-sm text-white">Upload</NavLink>
                                        <button className="btn btn-error btn-sm text-white" onClick={() => setDeleteCandidate(problem)}>
                                            <Trash2 size={14} /> Delete
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
            <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems.map(problem => (
                            <tr key={problem._id} className="hover:bg-base-200/30">
                                <td className="font-bold text-primary">#{problem.serial_number}</td>
                                <td className="font-semibold max-w-sm truncate">{problem.title}</td>
                                <td><div className={`badge ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</div></td>
                                <td className="space-x-2 text-right">
                                    <NavLink to={`/admin/video/upload/${problem._id}`} className="btn btn-sm bg-primary text-white">Upload</NavLink>
                                    <button className="btn btn-error btn-sm text-white" onClick={() => setDeleteCandidate(problem)}>
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
        <div className="relative min-h-screen bg-base-100 p-4 sm:p-8 overflow-hidden">
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

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4 pt-10" data-aos="fade-down">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">🎬 Video Library</h1>
                    <p className="text-base-content/70">Upload and manage problem video solutions</p>
                    <div className="mt-4 inline-block bg-base-100/70 backdrop-blur-md px-6 py-4 rounded-xl border border-base-300/20 shadow">
                        <div className="text-sm text-base-content/60">Total Problems</div>
                        <div className="text-3xl font-bold text-primary">{
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

                <div data-aos="fade-up">
                    <div className="card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20">
                        <div className="card-body">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="form-control w-full max-w-md">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
                                        <input
                                            type="text"
                                            className="input input-bordered pl-10 bg-base-100/50 border-base-300/20 focus:border-primary/50"
                                            placeholder="Search by title or S.No..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="join">
                                    <button className={`btn join-item ${viewMode === 'grid' ? 'btn-primary text-white' : 'btn-outline'}`} onClick={() => setViewMode('grid')}><Grid size={16} /> Grid</button>
                                    <button className={`btn join-item ${viewMode === 'table' ? 'btn-primary text-white' : 'btn-outline'}`} onClick={() => setViewMode('table')}><List size={16} /> Table</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <main>{renderContent()}</main>
            </div>


            <input type="checkbox" id="delete-confirm-modal" className="modal-toggle" checked={!!deleteCandidate} readOnly />
            <div className="modal modal-bottom sm:modal-middle">
                <div className="modal-box border-purple-200/30 dark:border-purple-600/30">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-lg text-center text-purple-700 dark:text-purple-300">Confirm Deletion</h3>
                    <p className="py-2 text-center text-sm text-base-content/70">
                        This action is irreversible. To confirm, please type the serial number of the problem.
                    </p>
                    <p className="text-center font-mono text-lg p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-600/30">
                        {deleteCandidate?.serial_number}
                    </p>
                    <div className="form-control mt-4">
                        <input
                            type="text"
                            className="input input-bordered w-full text-center font-bold border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            placeholder="Type serial number here..."
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                        />
                    </div>
                    <div className="modal-action justify-center gap-4">
                        <button
                            className="btn btn-ghost border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            onClick={() => { setDeleteCandidate(null); setConfirmInput(""); }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                            onClick={handleConfirmDelete}
                            disabled={String(confirmInput) !== String(deleteCandidate?.serial_number)}
                        >
                            <Trash2 size={14} /> Yes, Delete It
                        </button>
                    </div>
                </div>
            </div>

            {}
            {notification.message && (
                <div className="toast toast-top toast-center min-w-max z-50">
                    <div className={`alert ${notification.type === 'success' ? 'alert-success bg-purple-100 border-purple-300 text-purple-700' : 'alert-error'}`}>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}
        </div>

    );
}
