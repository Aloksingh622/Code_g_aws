import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Code, Trophy, Clock, TrendingUp, CheckCircle2, Circle, Minus, Tag, Filter, XCircle, Plus, List, X, Play, Trash2 } from 'lucide-react';
import axios_client from '../utils/axiosconfig';
import { useSelector } from 'react-redux';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import Particles from '@/components/ui/particlebg';
import 'aos/dist/aos.css';
import CountUp from '../components/ui/counting'
import LoginAccessCard from '@/component/loginmessage';



// Helper function to get theme-aware styles for problem difficulty
const getDifficultyConfig = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'hard':
            return 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};


const ProblemsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // State management
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [availableTags, setAvailableTags] = useState([]);

    const [playIconAnimation, setPlayIconAnimation] = useState(false);

    // Todo state management
    const [todoProblems, setTodoProblems] = useState([]);
    const [showTodoPanel, setShowTodoPanel] = useState(false);
    const [todoLoading, setTodoLoading] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const response = await axios_client.get("/problem/getAllProblem");
                const problemsData = response.data.problem || [];
                setProblems(problemsData);

                const tags = new Set();
                problemsData.forEach(problem => {
                    if (typeof problem.tags === "string") {
                        problem.tags.split(",").map(tag => tag.trim()).forEach(tag => tags.add(tag));
                    }
                });
                setAvailableTags(Array.from(tags).sort());

            } catch (err) {
                setError(err.message || 'Failed to fetch problems.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // Fetch todo problems
    useEffect(() => {
        if (user) {
            fetchTodoProblems();
        }
    }, [user]);

    const handleClosePanel = () => {
        setShowTodoPanel(false);
        setPlayIconAnimation(true); // Trigger the icon animation
    }

    const fetchTodoProblems = async () => {
        try {
            setTodoLoading(true);
            const response = await axios_client.get("/user/todo/get");
            console.log(response.data);
            setTodoProblems(response.data.todo || []);
        } catch (err) {
            console.error('Failed to fetch todo problems:', err);
        } finally {
            setTodoLoading(false);
        }
    };

    // Add problem to todo
    const addToTodo = async (problemId) => {
        try {
            await axios_client.post("/user/todo/add", { problemId });
            fetchTodoProblems(); // Refresh todo list
        } catch (err) {
            console.error('Failed to add problem to todo:', err);
        }
    };

    // Remove problem from todo
    const removeFromTodo = async (problemId) => {
        try {
            await axios_client.delete("/user/todo/remove", { data: { problemId } });
            fetchTodoProblems(); // Refresh todo list
        } catch (err) {
            console.error('Failed to remove problem from todo:', err);
        }
    };

    // Check if problem is in todo
    const isProblemInTodo = (problemId) => {
        return todoProblems.some(todo => todo._id === problemId);
    };

    // Apply filters whenever dependencies change
    useEffect(() => {
        let filtered = problems;

        if (searchTerm) {
            filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(p => p.difficulty?.toLowerCase() === selectedDifficulty);
        }
        if (selectedTag !== 'all') {
            filtered = filtered.filter(p => p.tags && p.tags.split(',').map(t => t.trim()).includes(selectedTag));
        }
        if (selectedStatus !== 'all') {
            const solvedProblemIds = new Set(user?.problem_solved || []);
            filtered = filtered.filter(p => {
                const isSolved = solvedProblemIds.has(p._id);
                return selectedStatus === 'solved' ? isSolved : !isSolved;
            });
        }
        setFilteredProblems(filtered);
    }, [searchTerm, selectedDifficulty, selectedTag, selectedStatus, problems, user]);

    // Navigate to problem detail page
    const handleProblemClick = (problemId) => {
        navigate(`/problems/${problemId}`);
    };

    // Calculate statistics
    const getStats = () => ({
        total: problems.length,
        easy: problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length,
        medium: problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length,
        hard: problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length,
        solved: user?.problem_solved?.length || 0
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDifficulty('all');
        setSelectedTag('all');
        setSelectedStatus('all');
    };
    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 20,
            disable: 'mobile',
        });
    }, []);


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-10">
                <LoginAccessCard message="You need to be logged in to view  challenge!" />
            </div>
        )
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content font-medium">Loading problems...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
                <div className="card max-w-md w-full bg-base-100 shadow-xl border-error border-2">
                    <div className="card-body text-center">
                        <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-error" />
                        </div>
                        <h3 className="card-title text-error justify-center mb-2">Error Loading Problems</h3>
                        <p className="text-error mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="btn btn-outline btn-error">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = getStats();
    const solvedProblemIds = new Set(user?.problem_solved || []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors">
            {}
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
            <div
                data-aos="fade-down"
                data-aos-duration="500"
                className="bg-base-200/80 backdrop-blur-sm border-b border-base-300/80 bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600 p-4 transition-colors"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {}
                    <div className="text-center mb-8">
                        <div
                            className="flex items-center justify-center mb-4"
                            data-aos="zoom-in"
                            data-aos-delay="100"
                            data-aos-duration="400"
                        >
                            <div className="bg-primary/30 p-3 rounded-full mr-4 ring-2 ring-primary/20">
                                <Code className="w-8 h-8 text-primary dark:text-primary-content" />
                            </div>
                            <h1
                                className="text-4xl font-bold text-base-content dark:text-white"
                                data-aos="fade-left"
                                data-aos-delay="200"
                                data-aos-duration="400"
                            >
                                Problems
                            </h1>
                        </div>
                        <p
                            className="text-xl text-base-content/80 dark:text-gray-200 max-w-2xl mx-auto"
                            data-aos="fade-up"
                            data-aos-delay="300"
                            data-aos-duration="400"
                        >
                            Challenge yourself with coding problems and improve your algorithmic thinking.
                        </p>
                    </div>

                    {}
                    <div
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                        data-aos="fade-up"
                        data-aos-delay="400"
                        data-aos-duration="500"
                    >
                        <div
                            className="card bg-gradient-to-r from-primary to-primary-focus text-primary-content shadow-lg dark:shadow-primary/20"
                            data-aos="flip-left"
                            data-aos-delay="450"
                            data-aos-duration="400"
                        >
                            <div className="card-body p-4 text-center">
                                <Trophy className="w-6 h-6 mx-auto mb-2 text-white" />
                                <p className="text-2xl font-bold text-white">{
                                    <CountUp
                                        from={0}
                                        to={stats.total}
                                        separator=","
                                        direction="up"
                                        duration={2}
                                        className="count-up-text"
                                    />

                                }</p>
                                <p className="text-primary-content/90 dark:text-white/90 text-sm">Total Problems</p>
                            </div>
                        </div>

                        <div
                            className="card bg-gradient-to-r from-success to-success-focus text-success-content shadow-lg dark:shadow-success/20"
                            data-aos="flip-left"
                            data-aos-delay="500"
                            data-aos-duration="400"
                        >
                            <div className="card-body p-4 text-center">
                                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-white" />
                                <p className="text-2xl font-bold text-white">{
                                    <CountUp
                                        from={0}
                                        to={stats.easy}
                                        separator=","
                                        direction="up"
                                        duration={3}
                                        className="count-up-text"
                                    />}</p>
                                <p className="text-success-content/90 dark:text-white/90 text-sm">Easy</p>
                            </div>
                        </div>

                        <div
                            className="card bg-gradient-to-r from-warning to-warning-focus text-warning-content shadow-lg dark:shadow-warning/20"
                            data-aos="flip-left"
                            data-aos-delay="550"
                            data-aos-duration="400"
                        >
                            <div className="card-body p-4 text-center">
                                <Clock className="w-6 h-6 mx-auto mb-2 text-white" />
                                <p className="text-2xl font-bold text-white">{<CountUp
                                    from={0}
                                    to={stats.medium}
                                    separator=","
                                    direction="up"
                                    duration={3}
                                    className="count-up-text"
                                />}</p>
                                <p className="text-warning-content/90 dark:text-white/90 text-sm">Medium</p>
                            </div>
                        </div>

                        <div
                            className="card bg-gradient-to-r from-error to-error-focus text-error-content shadow-lg dark:shadow-error/20"
                            data-aos="flip-left"
                            data-aos-delay="600"
                            data-aos-duration="400"
                        >
                            <div className="card-body p-4 text-center">
                                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-white" />
                                <p className="text-2xl font-bold text-white">{<CountUp
                                    from={0}
                                    to={stats.hard}
                                    separator=","
                                    direction="up"
                                    duration={3}
                                    className="count-up-text"
                                />}</p>
                                <p className="text-error-content/90 dark:text-white/90 text-sm">
                                    Hard
                                </p>
                            </div>
                        </div>

                        <div
                            className="card bg-gradient-to-r from-info to-info-focus text-info-content shadow-lg dark:shadow-info/20"
                            data-aos="flip-left"
                            data-aos-delay="650"
                            data-aos-duration="400"
                        >
                            <div className="card-body p-4 text-center">
                                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-white" />
                                <p className="text-2xl font-bold text-white">{
                                    <CountUp
                                        from={0}
                                        to={stats.solved}
                                        separator=","
                                        direction="up"
                                        duration={3}
                                        className="count-up-text"
                                    />}</p>
                                <p className="text-info-content/90 dark:text-white/90 text-sm">Solved</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div
                        className="bg-base-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-base-300/50 dark:border-gray-700/50 shadow-lg"
                        data-aos="zoom-in-up"
                        data-aos-delay="700"
                        data-aos-duration="500"
                    >
                        {}
                        <motion.div
                            className="relative mb-6"
                            data-aos="fade-right"
                            data-aos-delay="800"
                            data-aos-duration="400"
                        >
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search coding problems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4 text-gray-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-500 hover:shadow-md"
                            />
                        </motion.div>

                        {}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {}
                            <div
                                className="space-y-3"
                                data-aos="fade-up"
                                data-aos-delay="850"
                                data-aos-duration="400"
                            >
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                                        <Filter className="w-4 h-4 text-primary dark:text-primary-content" />
                                    </div>
                                    <h3 className="font-semibold text-base-content dark:text-white">Difficulty</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        className={`btn btn-sm justify-start transition-all duration-200 hover:scale-105 ${selectedDifficulty === 'all' ? 'btn-primary text-white shadow-lg' : 'btn-ghost hover:bg-base-200 dark:hover:bg-gray-700 dark:text-gray-200'}`}
                                        onClick={() => setSelectedDifficulty('all')}
                                    >
                                        All Problems
                                    </button>
                                    <button
                                        className={`btn btn-sm justify-start transition-all duration-200 hover:scale-105 ${selectedDifficulty === 'easy' ? 'btn-success text-white shadow-lg' : 'btn-ghost hover:bg-success/10 dark:hover:bg-success/20 text-success dark:text-success'}`}
                                        onClick={() => setSelectedDifficulty('easy')}
                                    >
                                        Easy
                                    </button>
                                    <button
                                        className={`btn btn-sm justify-start transition-all duration-200 hover:scale-105 ${selectedDifficulty === 'medium' ? 'btn-warning text-white shadow-lg' : 'btn-ghost hover:bg-warning/10 dark:hover:bg-warning/20 text-warning dark:text-warning'}`}
                                        onClick={() => setSelectedDifficulty('medium')}
                                    >
                                        Medium
                                    </button>
                                    <button
                                        className={`btn btn-sm justify-start transition-all duration-200 hover:scale-105 ${selectedDifficulty === 'hard' ? 'btn-error text-white shadow-lg' : 'btn-ghost hover:bg-error/10 dark:hover:bg-error/20 text-error dark:text-error'}`}
                                        onClick={() => setSelectedDifficulty('hard')}
                                    >
                                        Hard
                                    </button>
                                </div>
                            </div>

                            {}
                            <div
                                className="space-y-3"
                                data-aos="fade-up"
                                data-aos-delay="900"
                                data-aos-duration="400"
                            >
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="p-2 bg-success/10 dark:bg-success/20 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-success dark:text-success-content" />
                                    </div>
                                    <h3 className="font-semibold text-base-content dark:text-white">Status</h3>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        className={`btn btn-sm w-full justify-start transition-all duration-200 hover:scale-105 ${selectedStatus === 'all' ? 'btn-primary text-white shadow-lg' : 'btn-ghost hover:bg-base-200 dark:hover:bg-gray-700 dark:text-gray-200'}`}
                                        onClick={() => setSelectedStatus('all')}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                                        All Problems
                                    </button>
                                    <button
                                        className={`btn btn-sm w-full justify-start transition-all duration-200 hover:scale-105 ${selectedStatus === 'solved' ? 'btn-success text-white shadow-lg' : 'btn-ghost hover:bg-success/10 dark:hover:bg-success/20 text-success dark:text-success'}`}
                                        onClick={() => setSelectedStatus('solved')}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Solved
                                    </button>
                                    <button
                                        className={`btn btn-sm w-full justify-start transition-all duration-200 hover:scale-105 ${selectedStatus === 'unsolved' ? 'btn-info text-white shadow-lg' : 'btn-ghost hover:bg-info/10 dark:hover:bg-info/20 text-info dark:text-info'}`}
                                        onClick={() => setSelectedStatus('unsolved')}
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Unsolved
                                    </button>
                                </div>
                            </div>

                            {}
                            <div
                                className="space-y-3"
                                data-aos="fade-up"
                                data-aos-delay="950"
                                data-aos-duration="400"
                            >
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="p-2 bg-info/10 dark:bg-info/20 rounded-lg">
                                        <Tag className="w-4 h-4 text-info dark:text-info-content" />
                                    </div>
                                    <h3 className="font-semibold text-base-content dark:text-white">Tags</h3>
                                </div>
                                {availableTags.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            className="select select-bordered w-full bg-base-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:shadow-sm"
                                            value={selectedTag}
                                            onChange={(e) => setSelectedTag(e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
                                            {availableTags.map(tag => (
                                                <option key={tag} value={tag} className="dark:bg-gray-800">{tag}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <p className="text-sm text-base-content/60 dark:text-gray-400 italic">No tags available</p>
                                )}
                            </div>
                        </div>

                        {}
                        <div
                            className="mt-6 pt-4 border-t border-base-300/50 dark:border-gray-700/50"
                            data-aos="fade-up"
                            data-aos-delay="1000"
                            data-aos-duration="400"
                        >
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button
                                    className="btn btn-sm btn-ghost hover:bg-base-200 dark:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                                    onClick={clearFilters}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </button>
                                <div className="badge badge-neutral dark:badge-ghost">
                                    <span className="text-xs">Showing filtered results</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="bg-base-100/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-base-300/50 dark:border-gray-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            {}
                            <thead className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
                                <tr className="border-b-2 border-primary/20 dark:border-primary/30">
                                    <th className="text-left py-6 px-6 font-bold text-base-content dark:text-white w-20 text-sm uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                                            <span>#</span>
                                        </div>
                                    </th>
                                    <th className="text-left py-6 px-6 font-bold text-base-content dark:text-white text-sm uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Code className="w-4 h-4 text-primary" />
                                            <span>Problem Title</span>
                                        </div>
                                    </th>
                                    <th className="text-left py-6 px-6 font-bold text-base-content dark:text-white w-36 text-sm uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="w-4 h-4 text-warning" />
                                            <span>Difficulty</span>
                                        </div>
                                    </th>
                                    <th className="text-left py-6 px-6 font-bold text-base-content dark:text-white text-sm uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                            <Tag className="w-4 h-4 text-info" />
                                            <span>Tags</span>
                                        </div>
                                    </th>
                                    <th className="text-center py-6 px-6 font-bold text-base-content dark:text-white w-28 text-sm uppercase tracking-wider">
                                        <div className="flex items-center justify-center space-x-2">
                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                            <span>Status</span>
                                        </div>
                                    </th>
                                    <th className="text-center py-6 px-6 font-bold text-base-content dark:text-white w-28 text-sm uppercase tracking-wider">
                                        <div className="flex items-center justify-center space-x-2">
                                            <List className="w-4 h-4 text-primary" />
                                            <span>Todo</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-300/30 dark:divide-gray-700/30">
                                <AnimatePresence>
                                    {filteredProblems.map((problem, index) => {
                                        const isSolved = solvedProblemIds.has(problem._id.toString());
                                        const isInTodo = isProblemInTodo(problem._id);
                                        // Only animate first 10 rows to prevent performance issues
                                        const shouldAnimate = index < 10;

                                        return (
                                            <tr
                                                key={problem._id}
                                                {...(shouldAnimate && {
                                                    'data-aos': 'fade-up',
                                                    'data-aos-delay': Math.min(index * 30, 300), // Cap delay at 300ms
                                                    'data-aos-duration': '300',
                                                })}
                                                className={`
            group transition-all duration-200 cursor-pointer
            hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent
            dark:hover:from-primary/10 dark:hover:to-transparent
            hover:shadow-md
            ${isSolved ? 'bg-success/5 dark:bg-success/10' : ''}
            ${index % 2 === 0 ? 'bg-base-50/50 dark:bg-gray-800/30' : 'bg-base-100/50 dark:bg-gray-800/50'}
          `}
                                            >
                                                {}
                                                <td className="py-5 px-6" onClick={() => handleProblemClick(problem._id)}>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-base-200 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-200">
                                                            <span className="font-mono text-sm font-bold text-base-content/80 dark:text-gray-200 group-hover:text-primary">
                                                                {problem.serial_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {}
                                                <td className="py-5 px-6" onClick={() => handleProblemClick(problem._id)}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-200">
                                                            <Code className="w-4 h-4 text-primary group-hover:text-primary-focus" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-base-content dark:text-white group-hover:text-primary transition-colors duration-200 leading-tight">
                                                                {problem.title}
                                                            </h3>
                                                            <p className="text-xs text-base-content/60 dark:text-gray-400 mt-1">
                                                                Click to solve
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {}
                                                <td className="py-5 px-6" onClick={() => handleProblemClick(problem._id)}>
                                                    <span className={`
              inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
              shadow-sm transition-shadow duration-200 group-hover:shadow-md
              ${getDifficultyConfig(problem.difficulty)}
            `}>
                                                        <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-80"></span>
                                                        {problem.difficulty}
                                                    </span>
                                                </td>

                                                {}
                                                <td className="py-5 px-6" onClick={() => handleProblemClick(problem._id)}>
                                                    <div className="flex flex-wrap gap-2">
                                                        {problem.tags && problem.tags.split(",").map(tag => tag.trim()).slice(0, 2).map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#9fa2a2] text-[white] dark:bg-[#5ad3c7be] dark:text-info-content border border-info/20 hover:bg-info/20 transition-colors duration-200"
                                                            >
                                                                <Tag className="w-3 h-3 mr-1" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {problem.tags && problem.tags.split(",").length > 2 && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-base-300/50 text-base-content/70 dark:bg-gray-600 dark:text-gray-300 border border-base-300 dark:border-gray-600">
                                                                +{problem.tags.split(",").length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {}
                                                <td className="py-5 px-6" onClick={() => handleProblemClick(problem._id)}>
                                                    <div className="flex justify-center">
                                                        {isSolved ? (
                                                            <div className="relative">
                                                                <div className="w-10 h-10 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center border-2 border-success/30">
                                                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 bg-base-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-base-300 dark:border-gray-600 group-hover:border-primary/50 transition-colors duration-200">
                                                                <Circle className="w-5 h-5 text-base-content/40 dark:text-gray-500 group-hover:text-primary/70" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {}
                                                <td className="py-5 px-6">
                                                    <div className="flex justify-center">
                                                        <div className="tooltip tooltip-top" data-tip={isInTodo ? "Remove from Todo" : "Add to Todo"}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (isInTodo) {
                                                                        removeFromTodo(problem._id);
                                                                    } else {
                                                                        addToTodo(problem._id);
                                                                    }
                                                                }}
                                                                className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 
                    transition-all duration-200 hover:scale-105 
                    ${isInTodo
                                                                        ? 'bg-error/10 dark:bg-error/20 border-error/30 text-error dark:hover:bg-red-300 hover:bg-red-300'
                                                                        : 'bg-base-200 dark:hover:bg-green-300 hover:bg-green-300  dark:bg-gray-700 border-base-300 dark:border-gray-600 text-base-content/40 dark:text-gray-500 hover:border-primary/50 hover:text-primary/70'
                                                                    }
                `}
                                                            >
                                                                {isInTodo ? (
                                                                    <Minus className="w-5 h-5 cursor-pointer" />
                                                                ) : (
                                                                    <Plus className="w-5 h-5 cursor-pointer " />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {}
                    {filteredProblems.length === 0 && (
                        <div className="text-center py-16 px-6">
                            <div className="relative mx-auto mb-8 w-24 h-24">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-pulse"></div>
                                <div className="relative w-24 h-24 bg-base-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-base-300 dark:border-gray-600">
                                    <Search className="w-10 h-10 text-base-content/50 dark:text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-base-content dark:text-white mb-3">
                                No Problems Found
                            </h3>
                            <p className="text-base-content/60 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
                                We couldn't find any problems matching your current filters. Try adjusting your search criteria.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button className="btn btn-primary btn-sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </button>
                                <button className="btn btn-ghost btn-sm">
                                    <Search className="w-4 h-4 mr-2" />
                                    Browse All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {}
                {filteredProblems.length > 0 && (
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center space-x-4 bg-base-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20 dark:border-primary/30 shadow-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-base-content/70 dark:text-gray-300">Showing</span>
                            </div>
                            <span className="font-bold text-lg text-primary">
                                {filteredProblems.length}
                            </span>
                            <span className="text-base-content/70 dark:text-gray-300">of</span>
                            <span className="font-bold text-lg text-base-content dark:text-white">
                                {problems.length}
                            </span>
                            <span className="text-base-content/70 dark:text-gray-300">problems</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <div className="tooltip tooltip-left" data-tip="Todo List">
                    <motion.button
                        onClick={() => setShowTodoPanel(true)}
                        className="btn btn-circle btn-lg bg-primary hover:bg-primary-focus text-white shadow-2xl border-2 border-primary-content/20"

                        // --- ANIMATION LOGIC ---
                        animate={todoProblems.length > 0 ? {
                            scale: [1, 1.1, 1], // Pulse effect
                            y: [0, -20, 0],      // Jump effect
                            boxShadow: [
                                "0 0 0 rgba(59, 130, 246, 0)",
                                "0 0 20px rgba(59, 130, 246, 0.7)",
                                "0 0 0 rgba(59, 130, 246, 0)"
                            ]
                        } : {}}

                        // --- TRANSITION LOGIC ---
                        transition={{
                            duration: 5,     // One cycle duration
                            repeat: Infinity,  // Loop forever
                            ease: "easeInOut"  // Smooth jump
                        }}
                    >
                        <div className="relative">
                            <List className="w-6 h-6" />
                            {todoProblems.length > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">{todoProblems.length}</span>
                                </div>
                            )}
                        </div>
                    </motion.button>

                </div>
            </div>

            {}
            <AnimatePresence>
                {showTodoPanel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        {}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClosePanel}></div>

                        {}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative bg-base-100 dark:bg-gray-800 rounded-2xl shadow-2xl border border-base-300/50 dark:border-gray-700/50 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                        >
                            {}
                            <div className="flex items-center justify-between p-6 border-b border-base-300/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                                        <List className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-base-content dark:text-white">Todo Problems</h2>
                                        <p className="text-sm text-base-content/60 dark:text-gray-400">
                                            {todoProblems.length} problem{todoProblems.length !== 1 ? 's' : ''} in your list
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClosePanel}
                                    className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 dark:hover:bg-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {}
                            <div className="overflow-y-auto max-h-[calc(80vh-140px)]"> {}
                                {todoLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="loading loading-spinner loading-md text-primary"></div>
                                    </div>
                                ) : todoProblems.length === 0 ? (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-16 h-16 bg-base-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <List className="w-8 h-8 text-base-content/40 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-base-content dark:text-white mb-2">No Problems in Todo</h3>
                                        <p className="text-base-content/60 dark:text-gray-400">
                                            Add problems to your todo list to keep track of what you want to solve.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-3">
                                        {todoProblems.map((problem) => {
                                            if (!problem) return null;
                                            const isSolved = solvedProblemIds.has(problem._id.toString());
                                            return (
                                                <div
                                                    key={problem._id}
                                                    className={`
                                                p-4 rounded-xl border transition-all duration-200 hover:shadow-lg
                                                ${isSolved ? 'bg-success/5 dark:bg-success/10 border-success/20' : 'bg-base-50 dark:bg-gray-700/50 border-base-300/50 dark:border-gray-600/50'}
                                            `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isSolved ? 'bg-success/10 border-success/30 text-success' : 'bg-base-200 dark:bg-gray-600 border-base-300 dark:border-gray-600 text-base-content/60 dark:text-gray-400'}`}>
                                                                {isSolved ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-base-content dark:text-white truncate">{problem.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyConfig(problem.difficulty)}`}>
                                                                        {problem.difficulty}
                                                                    </span>
                                                                    {isSolved && <span className="text-xs text-success font-medium">✓ Solved</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-3">
                                                            <div className="tooltip tooltip-top" data-tip="Solve Problem">
                                                                <button
                                                                    onClick={() => { handleClosePanel(); handleProblemClick(problem._id); }}
                                                                    className="btn btn-sm btn-primary text-white hover:btn-primary-focus"
                                                                >
                                                                    <Play className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="tooltip tooltip-top" data-tip="Remove from Todo">
                                                                <button
                                                                    onClick={() => removeFromTodo(problem._id)}
                                                                    className="btn btn-sm btn-error text-white hover:btn-error-focus"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {}
                            {todoProblems.length > 0 && (
                                <div className="p-4 border-t border-base-300/50 dark:border-gray-700/50 bg-base-50/50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between text-sm text-base-content/60 dark:text-gray-400">
                                        <span>
                                            {todoProblems.filter(todo => solvedProblemIds.has(todo._id.toString())).length} solved
                                        </span>
                                        <span>
                                            {todoProblems.length} total
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProblemsPage;