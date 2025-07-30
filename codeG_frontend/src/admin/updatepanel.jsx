import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Edit2, Filter, Grid, List } from "lucide-react";
import axios_client from "@/utils/axiosconfig";
import RotatingText from "../animations/rotatingtext";
import Particles from "@/components/ui/particlebg";
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from "@/components/ui/counting";

const ProblemsListPage = () => {
    const [problems, setProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
        });
    }, []);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const response = await axios_client.get("/problem/getAllProblem");
                const problemsData = response.data.problem;
                setProblems(problemsData);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch problems.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = problems.filter(problem => {
            const titleMatch = problem.title.toLowerCase().includes(lowercasedQuery);
            const serialMatch = String(problem.serial_number).includes(lowercasedQuery);
            return titleMatch || serialMatch;
        });
        setFilteredProblems(filtered);
    }, [searchQuery, problems]);

    const handleEditClick = (problemId) => {
        navigate(`/edit-problem/${problemId}`);
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
        if (isLoading) {
            return (
                <div className="flex justify-center items-center min-h-[400px]" data-aos="fade-in">
                    <div className="text-center space-y-4">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-base-content/70">Loading problems...</p>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (problems.length > 0 && filteredProblems.length === 0) {
            return (
                <div className="text-center py-16" data-aos="fade-up">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No problems match your search</h3>
                    <p className="text-base-content/60">Try adjusting your search terms</p>
                </div>
            );
        }

        if (filteredProblems.length === 0) {
            return (
                <div className="text-center py-16" data-aos="fade-up">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No problems found</h3>
                    <p className="text-base-content/60">Start by adding your first problem</p>
                </div>
            );
        }

        if (viewMode === "grid") {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProblems.map((problem, index) => (
                        <div 
                            key={problem._id} 
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
                                        <div className="badge badge-outline badge-lg font-bold bg-primary/10 text-primary border-primary/20">
                                            #{problem.serial_number}
                                        </div>
                                        <div className={`badge ${getDifficultyColor(problem.difficulty)} badge-lg font-semibold shadow-sm`}>
                                            {problem.difficulty}
                                        </div>
                                    </div>
                                    <h2 className="card-title text-lg mb-3 line-clamp-2 bg-gradient-to-r from-base-content to-base-content/80 bg-clip-text">
                                        {problem.title}
                                    </h2>
                                    <div className="mb-4">
                                        <div className="text-sm text-base-content/70 mb-2 font-medium">Tags:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {problem.tags.split(',').map((tag, tagIndex) => (
                                                <span key={tagIndex} className="badge badge-ghost badge-sm bg-base-200/50 backdrop-blur-sm border border-base-300/20">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card-actions justify-end">
                                        <button
                                            className="btn btn-primary btn-sm gap-2 bg-gradient-to-r from-primary to-secondary border-none text-white"
                                            onClick={() => handleEditClick(problem._id)}
                                        >
                                            <Edit2 size={14} />
                                            Edit
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
                                    <th className="font-bold text-base-content">S.No.</th>
                                    <th className="font-bold text-base-content">Title</th>
                                    <th className="font-bold text-base-content">Difficulty</th>
                                    <th className="font-bold text-base-content">Tags</th>
                                    <th className="font-bold text-base-content">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.map((problem, index) => (
                                    <tr key={problem._id} className="hover:bg-base-200/30 transition-colors duration-200">
                                        <td className="font-bold text-primary">#{problem.serial_number}</td>
                                        <td className="font-semibold max-w-md">
                                            <div className="truncate">{problem.title}</div>
                                        </td>
                                        <td>
                                            <div className={`badge ${getDifficultyColor(problem.difficulty)} font-semibold shadow-sm`}>
                                                {problem.difficulty}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {problem.tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                                                    <span key={tagIndex} className="badge badge-ghost badge-sm bg-base-200/50 backdrop-blur-sm border border-base-300/20">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                                {problem.tags.split(',').length > 3 && (
                                                    <span className="badge badge-ghost badge-sm bg-accent/10 text-accent">
                                                        +{problem.tags.split(',').length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm gap-2 bg-gradient-to-r from-primary to-secondary border-none text-white"
                                                onClick={() => handleEditClick(problem._id)}
                                            >
                                                <Edit2 size={14} />
                                                Edit
                                            </button>
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
            <div className="fixed inset-0 z-0 pointer-events-none from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors">
            </div>
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
                />
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--color-primary),0.1),transparent)]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--color-accent),0.1),transparent)]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                {}
                <div className="text-center space-y-4 pt-10" data-aos="fade-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        📚 Problems Hub
                    </h1>
                    <RotatingText
                        texts={['Manage your problem collection', 'Organize coding challenges', 'Edit and update problems', 'Build your coding library']}
                        mainClassName="text-base-content/70 font-medium text-base sm:text-lg flex justify-center"
                        staggerDuration={0.03}
                        rotationInterval={4000}
                    />
                    
                    <div className="mt-6 inline-block" data-aos="fade-up" data-aos-delay="200">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                            <div className="relative bg-base-100/70 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-base-300/20">
                                <div className="text-sm text-base-content/70 font-medium">Total Problems</div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-1">
                                    {  <CountUp
                                                                from={0}
                                                                to={problems.length}
                                                                separator=","
                                                                direction="up"
                                                                duration={2}
                                                                className="count-up-text"
                                                            />}
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
                                <div className="form-control w-full max-w-md">
                                    <div className="relative w-full">
                                        <Search
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search by title or number..."
                                            className="input input-bordered w-full pl-10 bg-base-100/50 backdrop-blur-sm border-base-300/20 focus:border-primary/50"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="join">
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
                                    </div>
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
        </div>
    );
};

export default ProblemsListPage;