import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import MonacoEditor from "@monaco-editor/react";
import { Plus, X, Code, TestTube, Eye, EyeOff, Film, UploadCloud, FileJson, BookOpen, Star } from "lucide-react";
import axios_client from "../utils/axiosconfig"; // Your configured axios instance
import Particles from "@/components/ui/particlebg";
import AOS from 'aos'; // Import AOS
import 'aos/dist/aos.css'; // Import AOS styles

// --- Helper component to handle Monaco Editor with React Hook Form ---
const MonacoFormField = ({ control, name, language, isDark }) => {
    return (
        <div className="border border-base-300/50 rounded-lg overflow-hidden h-64 bg-base-100/50 shadow-inner">
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <MonacoEditor
                        height="100%"
                        language={(language || "plaintext").toLowerCase()}
                        theme={isDark ? "vs-dark" : "light"}
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: "on",
                            scrollBeyondLastLine: false,
                            padding: { top: 16 },
                        }}
                    />
                )}
            />
        </div>
    );
};

export default function CreateProblemPanel() {
    const [created, setCreated] = useState("");
    const [isDark, setIsDark] = useState(true);

    // Form setup with React Hook Form
    const { register, control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            serial_number: "",
            title: "",
            difficulty: "Easy",
            description: "",
            tags: "",
            isprime: false,
            visible_testcase: [{ input: "", output: "", explanation: "" }],
            hidden_testcase: [{ input: "", output: "" }],
            start_code: [{ language: "javascript", initial_code: "\nvar twoSum = function(nums, target) {\n    \n};" }],
            problem_solution: [{ language: "javascript", complete_code: "" }],
        },
    });

    // Dynamic field arrays
    const visibleTestcases = useFieldArray({ control, name: "visible_testcase" });
    const hiddenTestcases = useFieldArray({ control, name: "hidden_testcase" });
    const startCodes = useFieldArray({ control, name: "start_code" });
    const solutions = useFieldArray({ control, name: "problem_solution" });

    // Watch certain fields to use their values elsewhere
    const watchedStartCodes = watch("start_code");
    const watchedSolutions = watch("problem_solution");

    // Detect system theme and initialize AOS
    useEffect(() => {
        AOS.init({ duration: 800, once: false });

        const checkDarkMode = () => setIsDark(document.documentElement.getAttribute('data-theme')?.includes('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Form submission handler
    const onSubmit = async (data) => {
        try {
            await axios_client.post("/problem/create", data);
            setCreated({ status: 'success', message: "Problem created successfully!" });
            reset();
        } catch (err) {
            console.error(err);
            setCreated({ status: 'error', message: err?.response?.data?.message || "Failed to create problem" });
        }
    };

    // Handle file upload for JSON
    const handleJsonUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            reset(jsonData);
            setCreated({ status: 'success', message: 'JSON loaded successfully. Review and submit.' });
        } catch (error) {
            setCreated({ status: 'error', message: 'Invalid or malformed JSON file.' });
        }
    };

    // Auto-hide feedback message
    useEffect(() => {
        if (created) {
            const timer = setTimeout(() => setCreated(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [created]);

    return (
        <div className="relative min-h-screen bg-base-100 p-4 sm:p-8 overflow-hidden bg-gradient-surface bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-600  transition-colors">
            {}
            <div className="absolute inset-0 z-0 pointer-events-none">
             
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--p)_/_0.1),transparent_40%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--s)_/_0.1),transparent_40%)]"></div>
            </div>

            {}
            <div className="relative z-10 max-w-6xl mx-auto">
                
                <header className="text-center mb-12" data-aos="fade-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Create New Problem
                    </h1>
                    <p className="text-lg text-base-content/70">
                        Design the next great challenge for our community.
                    </p>
                </header>

                <div className="card bg-base-100/70 backdrop-blur-md shadow-lg border border-base-300/20 mb-8" data-aos="fade-up">
                    <div className="card-body">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-xl"> <FileJson className="w-6 h-6" /> </div>
                                <div>
                                    <h2 className="card-title text-lg">Quick Upload</h2>
                                    <p className="text-base-content/60 text-sm">Have a problem in JSON format? Upload it here.</p>
                                </div>
                            </div>
                            <input type="file" id="json-upload" accept=".json" className="hidden" onChange={handleJsonUpload} />
                            <label htmlFor="json-upload" className="btn btn-secondary btn-outline gap-2 cursor-pointer">
                                <UploadCloud className="w-4 h-4" /> Upload JSON
                            </label>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    
                    <div className="card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20" data-aos="fade-up" data-aos-delay="100">
                        <div className="card-body space-y-4">
                             <div className="flex items-center gap-3"><div className="p-3 bg-primary/10 text-primary rounded-xl"><BookOpen className="w-6 h-6"/></div><h2 className="card-title text-2xl">Basic Information</h2></div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="label"><span className="label-text">Serial Number</span></label><input {...register("serial_number")} type="number" className="input input-bordered w-full" required /></div>
                                <div><label className="label"><span className="label-text">Problem Title</span></label><input {...register("title")} type="text" className="input input-bordered w-full" required /></div>
                                <div><label className="label"><span className="label-text">Difficulty</span></label><select {...register("difficulty")} className="select select-bordered w-full"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                <div><label className="label"><span className="label-text">Tags (comma-separated)</span></label><input {...register("tags")} type="text" className="input input-bordered w-full" /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-2">
                                <div className="form-control md:col-span-2 flex flex-col"><label className="label"><span className="label-text">Description</span></label><textarea {...register("description")} rows={6} className="textarea textarea-bordered min-h-[150px]" required /></div>
                                <div className="form-control md:self-center relative right-30"><label className="label cursor-pointer justify-between"><div className="flex items-center gap-3"><Star className="w-5 h-5 text-warning"/><span className="label-text font-semibold">Premium Problem</span></div><input {...register("isprime")} type="checkbox" className="toggle toggle-primary" /></label><p className="text-xs text-base-content/60 mt-1 pl-9">If enabled, this will be for Pro users only.</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20" data-aos="fade-up">
                        <div className="card-body"><div className="flex justify-between items-center mb-4"><h2 className="card-title text-xl flex items-center gap-2"><Eye className="w-5 h-5 text-success"/>Visible Testcases</h2><button type="button" className="btn btn-success btn-sm gap-2" onClick={() => visibleTestcases.append({ input: "", output: "", explanation: "" })}><Plus className="w-4 h-4"/>Add</button></div><div className="space-y-4">{visibleTestcases.fields.map((field, i) => (<div key={field.id} className="bg-base-200/50 p-4 rounded-lg"><div className="flex justify-between items-center mb-2"><span className="font-medium text-sm">Testcase #{i + 1}</span><button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => visibleTestcases.remove(i)}><X className="w-4 h-4"/></button></div><div className="grid md:grid-cols-3 gap-4"><input {...register(`visible_testcase.${i}.input`)} className="input input-bordered input-sm" placeholder="Input" required /><input {...register(`visible_testcase.${i}.output`)} className="input input-bordered input-sm" placeholder="Output" required /><input {...register(`visible_testcase.${i}.explanation`)} className="input input-bordered input-sm" placeholder="Explanation"/></div></div>))}</div></div>
                    </div>

                    <div className="card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20" data-aos="fade-up">
                         <div className="card-body"><div className="flex justify-between items-center mb-4"><h2 className="card-title text-xl flex items-center gap-2"><EyeOff className="w-5 h-5 text-warning"/>Hidden Testcases</h2><button type="button" className="btn btn-warning btn-sm gap-2" onClick={() => hiddenTestcases.append({ input: "", output: "" })}><Plus className="w-4 h-4"/>Add</button></div><div className="space-y-4">{hiddenTestcases.fields.map((field, i) => (<div key={field.id} className="bg-base-200/50 p-4 rounded-lg"><div className="flex justify-between items-center mb-2"><span className="font-medium text-sm">Hidden Testcase #{i + 1}</span><button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => hiddenTestcases.remove(i)}><X className="w-4 h-4"/></button></div><div className="grid md:grid-cols-2 gap-4"><input {...register(`hidden_testcase.${i}.input`)} className="input input-bordered input-sm" placeholder="Input" required /><input {...register(`hidden_testcase.${i}.output`)} className="input input-bordered input-sm" placeholder="Output" required /></div></div>))}</div></div>
                    </div>
                     
                    <div className="card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20" data-aos="fade-up">
                         <div className="card-body"><div className="flex justify-between items-center mb-4"><h2 className="card-title text-xl flex items-center gap-2"><Code className="w-5 h-5 text-info"/>Starter Code</h2><button type="button" className="btn btn-info btn-sm gap-2" onClick={() => startCodes.append({ language: "javascript", initial_code: "" })}><Plus className="w-4 h-4"/>Add Language</button></div><div className="space-y-6">{startCodes.fields.map((field, i) => (<div key={field.id} className="bg-base-200/50 p-4 rounded-lg"><div className="flex justify-between items-center mb-3"><div className="form-control w-full sm:w-1/3"><label className="label text-sm">Language</label><input {...register(`start_code.${i}.language`)} className="input input-sm input-bordered" placeholder="e.g., javascript" required /></div><button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => startCodes.remove(i)}><X className="w-4 h-4"/></button></div><MonacoFormField control={control} name={`start_code.${i}.initial_code`} language={watchedStartCodes[i]?.language} isDark={isDark} /></div>))}</div></div>
                    </div>
                      
                    <div className="card bg-base-100/70 backdrop-blur-md shadow-xl border border-base-300/20" data-aos="fade-up">
                         <div className="card-body"><div className="flex justify-between items-center mb-4"><h2 className="card-title text-xl flex items-center gap-2"><TestTube className="w-5 h-5 text-secondary"/>Reference Solutions</h2><button type="button" className="btn btn-secondary btn-sm gap-2" onClick={() => solutions.append({ language: "javascript", complete_code: "" })}><Plus className="w-4 h-4"/>Add Solution</button></div><div className="space-y-6">{solutions.fields.map((field, i) => (<div key={field.id} className="bg-base-200/50 p-4 rounded-lg"><div className="flex justify-between items-center mb-3"><div className="form-control w-full sm:w-1/3"><label className="label text-sm">Language</label><input {...register(`problem_solution.${i}.language`)} className="input input-sm input-bordered" placeholder="e.g., javascript" required /></div><button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => solutions.remove(i)}><X className="w-4 h-4"/></button></div><MonacoFormField control={control} name={`problem_solution.${i}.complete_code`} language={watchedSolutions[i]?.language} isDark={isDark} /></div>))}</div></div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4" data-aos="fade-up">
                        <button type="button" className="btn btn-ghost" onClick={() => reset()}>Reset Form</button>
                        <button type="submit" className="btn btn-primary btn-lg px-8 shadow-lg">Create Problem</button>
                    </div>

                </form>

                {created && (
                    <div className="toast toast-center toast-middle z-50">
                        <div className={`alert ${created.status === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
                            <span>{created.message}</span>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}