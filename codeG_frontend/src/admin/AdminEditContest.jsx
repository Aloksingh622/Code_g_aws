import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, Link } from 'react-router';
import axios_client from '../utils/axiosconfig'; 
import { ArrowLeft, Trophy, CheckCircle, AlertCircle, Plus, X, Search } from 'lucide-react';

import AOS from 'aos';
import 'aos/dist/aos.css';


const contestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxParticipants: z.coerce.number().int().positive("Must be a positive number"),
  problems: z.array(z.string()).min(1, "Please add at least one problem."),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

const AdminEditContest = () => {
    const { contestId } = useParams();

    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, reset, trigger } = useForm({
        resolver: zodResolver(contestSchema),
        mode: "onTouched"
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [apiSuccess, setApiSuccess] = useState("");
    
    const [problemInput, setProblemInput] = useState("");
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [problemSearchLoading, setProblemSearchLoading] = useState(false);
    const [problemSearchError, setProblemSearchError] = useState("");
    
    
    useEffect(() => {
        const fetchContestData = async () => {
            try {
               
                const response = await axios_client.get(`/contest/get/${contestId}`);
                const contest = response.data;
                
              
                reset({
                    title: contest.title,
                    description: contest.description,
                    startTime: new Date(contest.startTime).toISOString().slice(0, 16),
                    endTime: new Date(contest.endTime).toISOString().slice(0, 16),
                    maxParticipants: contest.maxParticipants,
                    problems: contest.problems.map(p => p._id),
                });
               
                setSelectedProblems(contest.problems);

            } catch (err) {
                setApiError("Failed to load contest data.");
            } finally {
                setPageLoading(false);
            }
        };
        fetchContestData();
    }, [contestId, reset]);

   
    useEffect(() => {
        const problemIds = selectedProblems.map(p => p._id);
        setValue('problems', problemIds);
        if (problemIds.length > 0) trigger('problems');
    }, [selectedProblems, setValue, trigger]);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
    }, []);

    const handleAddProblem = async () => {
        if (!problemInput.trim()) return;
        setProblemSearchLoading(true);
        setProblemSearchError("");
        try {
            const response = await axios_client.get(`/contest/find?query=${problemInput.trim()}`);
            const foundProblem = response.data;
            if (!selectedProblems.some(p => p._id === foundProblem._id)) {
                setSelectedProblems(prev => [...prev, foundProblem]);
                setProblemInput("");
            } else {
                setProblemSearchError("This problem is already added.");
            }
        } catch (err) {
            setProblemSearchError(err.response?.data?.message || "Problem not found.");
        } finally {
            setProblemSearchLoading(false);
        }
    };

    const handleRemoveProblem = (problemId) => {
        setSelectedProblems(prev => prev.filter(p => p._id !== problemId));
    };
    
    // --- Main Submit Handler for UPDATING the contest ---
    const onSubmit = async (data) => {
        setLoading(true);
        setApiError("");
        setApiSuccess("");
        
        try {
            await axios_client.put(`/contest/edit/${contestId}`, data);
            setApiSuccess("Contest updated successfully! Redirecting...");
            setTimeout(() => navigate('/admin/contest'), 2000);
        } catch (err) {
            setApiError(err.response?.data?.message || "Failed to update contest.");
        } finally {
            setLoading(false);
        }
    };
    
    if (pageLoading) {
        return <div className="min-h-screen bg-[#1E1E1E] flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>
    }

    return (
        <div className="relative min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-[#1E1E1E]">
          
            <div className="relative z-10 max-w-4xl mx-auto">
                <header data-aos="fade-down" className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3"><Trophy className="text-primary"/> Edit Contest</h1>
                        <p className="text-gray-400 mt-2">Modify the details of the competitive event.</p>
                    </div>
                     <Link to="/admin/contest" className="btn btn-outline border-gray-600"><ArrowLeft size={16} /> Back to List</Link>
                </header>

                <div data-aos="fade-up" className="bg-base-100/10 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-2xl">
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {}
                        <div>
                            <label className="label"><span className="label-text text-white">Contest Title</span></label>
                            <input type="text" className={`input input-bordered w-full bg-base-300/20 ${errors.title ? 'input-error' : ''}`} {...register("title")} />
                            {errors.title && <p className="text-error text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        {}
                        <div>
                            <label className="label"><span className="label-text text-white">Description</span></label>
                            <textarea  className={`textarea textarea-bordered w-full h-24 bg-base-300/20 ${errors.description ? 'textarea-error' : ''}`} {...register("description")}></textarea>
                            {errors.description && <p className="text-error text-sm mt-1">{errors.description.message}</p>}
                        </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label"><span className="label-text text-white">Start Time</span></label>
                                <input type="datetime-local" className={`input input-bordered w-full bg-base-300/20 ${errors.startTime ? 'input-error' : ''}`} {...register("startTime")} />
                                {errors.startTime && <p className="text-error text-sm mt-1">{errors.startTime.message}</p>}
                            </div>
                             <div>
                                <label className="label"><span className="label-text text-white">End Time</span></label>
                                <input type="datetime-local" className={`input input-bordered w-full bg-base-300/20 ${errors.endTime ? 'input-error' : ''}`} {...register("endTime")} />
                                {errors.endTime && <p className="text-error text-sm mt-1">{errors.endTime.message}</p>}
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="label"><span className="label-text text-white">Max Participants</span></label>
                                <input type="number" className={`input input-bordered w-full bg-base-300/20 ${errors.maxParticipants ? 'input-error' : ''}`} {...register("maxParticipants")} />
                                {errors.maxParticipants && <p className="text-error text-sm mt-1">{errors.maxParticipants.message}</p>}
                            </div>
                        </div>

                        {}
                        <div>
                            <label className="label"><span className="label-text text-white">Manage Problems</span></label>
                            <div className="flex items-start gap-2">
                               <div className='relative flex-grow'><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input type="text" placeholder="Find by Serial Number or exact Title" className="input input-bordered w-full bg-base-300/20 pl-10" value={problemInput} onChange={(e) => setProblemInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProblem(); }}}/></div>
                                <button type="button" onClick={handleAddProblem} disabled={problemSearchLoading} className={`btn btn-secondary btn-sm h-10 flex-shrink-0 ${problemSearchLoading ? 'loading' : ''}`}><Plus size={18} /> Add</button>
                            </div>
                             {problemSearchError && <p className="text-error text-sm mt-1">{problemSearchError}</p>}
                             {errors.problems && <p className="text-error text-sm mt-1">{errors.problems.message}</p>}
                        </div>
                        
                        {selectedProblems.length > 0 && (
                            <div className='space-y-2'>
                               <label className="label"><span className="label-text text-gray-400">Selected Problems:</span></label>
                               <ul className="p-4 bg-base-300/20 rounded-lg space-y-2 border border-gray-700">{selectedProblems.map(p => (<li key={p._id} className="flex items-center justify-between bg-base-100/10 p-2 rounded-md animate-fade-in"><span className="font-semibold text-white">#{p.serial_number} - {p.title}</span><button type="button" onClick={() => handleRemoveProblem(p._id)} className="btn btn-ghost btn-xs text-error"><X size={16}/></button></li>))}</ul>
                            </div>
                        )}
                         <input type="hidden" {...register("problems")} />

                        {apiSuccess && <div className="alert alert-success text-sm"><CheckCircle/><span>{apiSuccess}</span></div>}
                        {apiError && <div className="alert alert-error text-sm"><AlertCircle/><span>{apiError}</span></div>}
                        
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className={`btn btn-primary w-full sm:w-auto ${loading ? 'loading' : ''}`}>
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditContest;