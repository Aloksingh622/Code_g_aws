import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import axios_client from '../utils/axiosconfig';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
    Play, Check, Code, ChevronDown, Sun, Moon, Settings,
    RotateCcw, Loader2, AlertCircle, CheckCircle2, XCircle, X,
    List, ChevronLeft, ChevronRight, Shuffle, BookText, FileText, History, FlaskConical,
    ThumbsUp, ThumbsDown, Star, Share2, Lightbulb, Clock, HardDrive, MemoryStick, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import logo from "../assets/logo.png";

import SubmissionItem from './submission';
import ChatAi from "../component/aichat"
import Editorial from "../component/video"

import { useDispatch, useSelector } from "react-redux";
import { user_logout, check_auth } from "../redux/auth_slice";

import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import LoginAccessCard from '@/component/loginmessage';
import User_icon from '@/component/usericon';
import PairSessionParticipants from '../component/PairSessionParticipants'

import AOS from 'aos';
import 'aos/dist/aos.css';

import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/utils/firebase';

import PairSessionHeader from '../component/pairSessionHeader';




const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
    const Icon = { success: CheckCircle2, error: XCircle, info: AlertCircle }[type];
    return (
        <div className={`flex items-center gap-4 text-white p-4 rounded-lg shadow-lg animate-fade-in-down ${colors[type]}`}>
            <Icon className="h-5 w-5" /><p>{message}</p>
            <button onClick={onClose} className="ml-auto"><X className="h-5 w-5" /></button>
        </div>
    );
};
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-20 right-5 z-50 space-y-2">
        {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />)}
    </div>
);


const languageConfig = {
    javascript: { name: 'JavaScript', monacoLang: 'javascript' },
    python: { name: 'Python', monacoLang: 'python' },
    java: { name: 'Java', monacoLang: 'java' },
    "c++": { name: 'C++', monacoLang: 'c++' },
};

const LanguageSelector = ({ language, setLanguage, availableLanguages = [] }) => {
    const currentLangName = languageConfig[language]?.name || 'Select Language';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="font-medium text-sm text-foreground bg-muted hover:bg-muted/80 px-3">
                    {currentLangName}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-[#282828] border-gray-700 rounded-lg shadow-2xl">
                {availableLanguages.map((langInfo) => {
                    const langDetails = languageConfig[langInfo.language];
                    if (!langDetails) return null;

                    return (
                        <DropdownMenuItem
                            key={langInfo.language}
                            onSelect={() => setLanguage(langInfo.language)}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-[#3E3E3E] focus:bg-[#3E3E3E] text-gray-200 cursor-pointer"
                        >
                            <span>{langDetails.name}</span>
                            {language === langInfo.language && <Check className="h-4 w-4 text-sky-400" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const ProblemDescription = ({ problem }) => {

    const { problemId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState('');
    const [submissionsFetched, setSubmissionsFetched] = useState(false);
    const [activeTab, setActiveTab] = useState('description');



    const fetchSubmissions = useCallback(async () => {
        setSubmissionsLoading(true);
        setSubmissionsError('');
        try {
            const response = await axios_client.get(`/problem/submissionOfProblem/${problemId}`);
            setSubmissions(response.data.submissions);
            setSubmissionsFetched(true);
        } catch (err) {
            setSubmissions(null);
            setSubmissionsError(err.message || 'Failed to fetch submissions.');
        } finally {
            setSubmissionsLoading(false);
        }
    }, [problemId]);


    useEffect(() => {
        if (activeTab === 'submissions' && !submissionsFetched) {
            fetchSubmissions();
        }
    }, [activeTab, submissionsFetched, fetchSubmissions, problemId]);
    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-400';
            case 'hard': return 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-400';
            default: return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300';
        }

    };

    const [selectedSolutionLang, setSelectedSolutionLang] = useState(
        problem.problem_solution?.[0]?.language || null
    );

    const currentSolution = problem.problem_solution?.find(
        (sol) => sol.language === selectedSolutionLang
    );

    const renderDescription = (text) => {
        const processedText = text.replace(/`([^`]+)`/g, '<code class="bg-neutral-700/80 text-neutral-200 font-mono px-1.5 py-0.5 rounded-md mx-0.5">\$1</code>');
        return <div dangerouslySetInnerHTML={{ __html: processedText }} />;
    };

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-[#282828] text-neutral-800 dark:text-neutral-300">
            <div className="h-full flex flex-col">
                <Tabs defaultValue="description" className="h-full flex flex-col" onValueChange={setActiveTab}>
                    <div className="px-5 py-2 flex-shrink-0" data-aos="fade-in">
                        <TabsList className="bg-transparent p-0 h-auto">
                            <TabsTrigger value="description" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg h-auto dark:data-[state=active]:bg-neutral-700/50  dark:data-[state=active]:text-white data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200">
                                <BookText className="h-4 w-4" /> Description
                            </TabsTrigger>
                            <TabsTrigger value="editorial" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg h-auto dark:data-[state=active]:bg-neutral-700/50  dark:data-[state=active]:text-white data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200">
                                <FileText className="h-4 w-4" /> Editorial
                            </TabsTrigger>
                            <TabsTrigger value="submissions" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg h-auto dark:data-[state=active]:bg-neutral-700/50  dark:data-[state=active]:text-white data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200">
                                <History className="h-4 w-4" /> Submissions
                            </TabsTrigger>
                            <TabsTrigger value="solutions" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg h-auto dark:data-[state=active]:bg-neutral-700/50  dark:data-[state=active]:text-white data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200">
                                <FlaskConical className="h-4 w-4" /> Solutions
                            </TabsTrigger>
                            <TabsTrigger value="aichat" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg h-auto dark:data-[state=active]:bg-neutral-700/50  dark:data-[state=active]:text-white data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200">
                                <Bot className="h-4 w-4" /> Virtual Assistant
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 pb-5">
                        <TabsContent value="description" className="mt-0">
                            <div className="space-y-5">
                                <h1 data-aos="fade-down" className="text-xl font-medium text-black dark:text-white ">{problem.serial_number}. {problem.title}</h1>
                                <div data-aos="fade-down" data-aos-delay="100" className="flex items-center gap-2">
                                    <Badge className={`font-medium rounded-full px-3 py-1 text-xs border-none ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</Badge>
                                    {problem.tags.split(',').map(tag => (
                                        <Badge key={tag.trim()} variant="secondary" className="font-normal rounded-full px-3 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300  dark:bg-neutral-700/80 dark:text-neutral-300 dark:hover:bg-neutral-700 border-none cursor-pointer">
                                            {tag.trim()}
                                        </Badge>
                                    ))}
                                </div>

                                <div data-aos="fade-up" className="text-sm leading-relaxed space-y-4">
                                    {renderDescription(problem.description)}
                                </div>

                                <div className="space-y-6">
                                    {problem.visible_testcase.map((example, index) => (
                                        <div key={index} data-aos="fade-up" data-aos-delay={index * 150}>
                                            <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-2">
                                                Example {index + 1}:
                                            </p>
                                            <div className="bg-neutral-100 dark:bg-neutral-800/60 p-4 rounded-lg font-mono text-sm space-y-2 border border-neutral-200 dark:border-neutral-700/80">
                                                <div>
                                                    <strong className="font-medium text-neutral-500 dark:text-neutral-400 mr-2">Input:</strong>
                                                    <span className="text-neutral-900 dark:text-neutral-100">{example.input}</span>
                                                </div>
                                                <div>
                                                    <strong className="font-medium text-neutral-500 dark:text-neutral-400 mr-2">Output:</strong>
                                                    <span className="text-neutral-900 dark:text-neutral-100">{example.output}</span>
                                                </div>
                                                {example.explanation && (
                                                    <div>
                                                        <strong className="font-medium text-neutral-500 dark:text-neutral-400 mr-2">Explanation:</strong>
                                                        <span className="text-neutral-600 dark:text-neutral-300">{example.explanation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="solutions" className="mt-4">
                            <div className="space-y-6">
                                <div data-aos="fade-in" className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"><svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></div>
                                        <div><h1 className="text-xl font-semibold text-black dark:text-white">Solution</h1><p className="text-sm text-neutral-500 dark:text-neutral-400">Official solution with multiple language implementations</p></div>
                                    </div>
                                    <div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200" onClick={() => navigator.clipboard.writeText(currentSolution?.complete_code || '')}><svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</Button></div>
                                </div>
                                {(!problem.problem_solution || problem.problem_solution.length === 0) ? (
                                    <div data-aos="zoom-in" className="text-center py-16">
                                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-full flex items-center justify-center mb-4"><svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></div>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-2">No Solution Available</p><p className="text-neutral-400 dark:text-neutral-500 text-sm">The official solution for this problem hasn't been published yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4" data-aos="fade-up">
                                        <div className="flex flex-wrap gap-2">{problem.problem_solution.map((sol) => (<Button key={sol.language} onClick={() => setSelectedSolutionLang(sol.language)} variant={selectedSolutionLang === sol.language ? 'default' : 'outline'} className={`flex items-center gap-2 h-9 px-4 text-sm font-medium transition-all duration-200 ${selectedSolutionLang === sol.language ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border-0' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                                            <span className="text-base">{sol.language === 'javascript' && '🟨'}{sol.language === 'python' && '🐍'}{sol.language === 'java' && '☕'}{sol.language === 'cpp' && '⚡'}</span>
                                            {languageConfig[sol.language]?.name || sol.language}
                                        </Button>))}</div>
                                        <div className="flex items-center justify-between cursor-pointer"><div className={` bg-fuchsia-300 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${selectedSolutionLang === 'javascript' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : ''} ${selectedSolutionLang === 'python' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : ''} ${selectedSolutionLang === 'java' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : ''} ${selectedSolutionLang === 'cpp' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' : ''}`}><span>{selectedSolutionLang === 'javascript' && '🟨'}{selectedSolutionLang === 'python' && '🐍'}{selectedSolutionLang === 'java' && '☕'}{selectedSolutionLang === 'cpp' && '⚡'}</span>{languageConfig[selectedSolutionLang]?.name || selectedSolutionLang}</div></div>
                                        <div className="h-[600px] border border-neutral-200 dark:border-neutral-700/80 rounded-xl overflow-hidden bg-gradient-to-r from-neutral-50/50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/50 shadow-sm">
                                            <Editor height="100%" language={languageConfig[selectedSolutionLang]?.monacoLang || 'plaintext'} value={currentSolution?.complete_code || ''} theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'} options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', automaticLayout: true, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 }, renderLineHighlight: 'none', overviewRulerBorder: false, hideCursorInOverviewRuler: true, folding: true, selectOnLineNumbers: true, matchBrackets: 'always', contextmenu: true, smoothScrolling: true, }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="submissions" className="mt-0 text-neutral-500 pt-10">
                            {submissionsLoading ? <div className="flex justify-center items-center py-10"><Loader2 className="h-6 w-6 animate-spin" /><span className="ml-2">Loading submissions...</span></div> : submissionsError ? <div className="text-red-500 text-center py-10">{submissionsError}</div> : submissions.length === 0 ? <div className="text-center text-neutral-400 py-10">No Submissions Yet</div> : <div className="space-y-6 max-w-2xl mx-auto">{submissions.map((sub) => (<SubmissionItem key={sub.id} sub={sub} />))}</div>}
                        </TabsContent>
                        <TabsContent value="editorial" className="mt-0">
                            <div className="space-y-6">
                                <div data-aos="fade-in" className="flex items-center gap-3"><div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"><FileText className="h-5 w-5 text-white" /></div><div><h1 className="text-xl font-semibold text-black dark:text-white">Editorial</h1><p className="text-sm text-neutral-500 dark:text-neutral-400">A video explanation of the solution approach.</p></div></div>
                                <div data-aos="fade-up" className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                    {problem.secureUrl ? <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} /> : <div className="text-center py-16"><p className="text-neutral-500 dark:text-neutral-400">No editorial video available for this problem yet.</p></div>}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="aichat" className="mt-0 h-full">
                            <ChatAi problem={problem} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

const CodeEditorPanel = ({ language, isDark, onMount, code, onCodeChange, readOnly }) => {
    return (
        <Editor
            height="100%"
            language={languageConfig[language]?.monacoLang || 'javascript'}
            theme={isDark ? 'vs-dark' : 'light'}
            onMount={onMount}
         
            value={code}
       
            onChange={onCodeChange}
            options={{
                readOnly: readOnly, 
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 }
            }}
        />
    );
};
const TestcasePanel = ({ testcases, isRunning, testResults }) => {
    const [activeCase, setActiveCase] = useState(0);

    const getStatusDetails = (statusId) => {
        if (statusId === 3) return { text: "Accepted", color: "text-green-500", icon: <CheckCircle2 className="h-4 w-4" /> };
        if (statusId === 4) return { text: "Wrong Answer", color: "text-red-500", icon: <XCircle className="h-4 w-4" /> };
        if (statusId === 5) return { text: "Time Limit Exceeded", color: "text-yellow-500", icon: <Clock className="h-4 w-4" /> };
        if (statusId === 6) return { text: "Compilation Error", color: "text-red-500", icon: <AlertCircle className="h-4 w-4" /> };
        return { text: "Error", color: "text-red-500", icon: <AlertCircle className="h-4 w-4" /> };
    };

    const OverallResultHeader = () => {
        if (!testResults) return null;

        if (testResults.errorMessage && testResults.testCases.length === 0) {
            return (
                <div data-aos="fade-in" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2"><AlertCircle className="h-5 w-5" /><h2 className="text-lg font-semibold">Execution Failed</h2></div>
                    <pre className="text-xs whitespace-pre-wrap font-mono bg-red-100 dark:bg-red-900/40 p-3 rounded-md text-red-800 dark:text-red-300">{testResults.errorMessage}</pre>
                </div>
            );
        }

        const title = testResults.success ? "Accepted" : "Wrong Answer";
        const titleColor = testResults.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
        const bgColor = testResults.success ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";

        return (
            <div data-aos="fade-in" className={`p-4 ${bgColor} border rounded-lg mb-4`}>
                <div className="flex items-center gap-2 mb-2">{testResults.success ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}<h2 className={`text-lg font-semibold ${titleColor}`}>{title}</h2></div>
                <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400"><div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>Runtime: <span className="font-medium">{testResults.runtime.toFixed(2)} ms</span></span></div><div className="flex items-center gap-2"><HardDrive className="h-4 w-4" /><span>Memory: <span className="font-medium">{(testResults.memory / 1024).toFixed(2)} MB</span></span></div></div>
            </div>
        );
    };

    return (
        <div className="h-full bg-white dark:bg-neutral-900 flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Tabs defaultValue="testcase" className="h-full flex flex-col">
                <div className="px-4 py-3 flex-shrink-0 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50" data-aos="fade-in">
                    <TabsList className="bg-transparent p-0 gap-1">
                        <TabsTrigger value="testcase" className="text-sm data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:border-blue-800/50 rounded-lg px-4 py-2 border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700">Test Cases</TabsTrigger>
                        <TabsTrigger value="result" className="text-sm data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200 dark:data-[state=active]:text-blue-400 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:border-blue-800/50 rounded-lg px-4 py-2 border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700">Result</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="testcase" className="flex-1 p-4 overflow-y-auto" data-aos="fade-up">
                    <div className="flex gap-2 mb-4 flex-wrap">{testcases.map((_, index) => (<Button key={index} variant={activeCase === index ? "default" : "outline"} size="sm" onClick={() => setActiveCase(index)} className={`h-8 rounded-lg ${activeCase === index ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>Case {index + 1}</Button>))}</div>
                    {testcases[activeCase] && (
                        <div className="space-y-4">
                            <div><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Input</label><div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg font-mono text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">{testcases[activeCase].input}</div></div>
                            <div><label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Expected Output</label><div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg font-mono text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">{testcases[activeCase].output}</div></div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="result" className="flex-1 p-4 overflow-y-auto">
                    {isRunning ? (<div className="flex items-center justify-center h-full text-neutral-600 dark:text-neutral-400 gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Evaluating...</span></div>) : testResults ? (<div><OverallResultHeader /><div className="flex gap-2 mb-4 flex-wrap" data-aos="fade-up">{testResults.testCases.map((result, index) => (<Button key={index} variant={activeCase === index ? "default" : "outline"} size="sm" onClick={() => setActiveCase(index)} className={`h-8 rounded-lg ${activeCase === index ? (result.status_id === 3 ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' : 'bg-red-500 border-red-500 text-white hover:bg-red-600') : (result.status_id === 3 ? 'border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20')}`}>Case {index + 1}</Button>))}</div>{testResults.testCases[activeCase] && (() => { const result = testResults.testCases[activeCase]; const originalCase = testcases[activeCase]; const status = getStatusDetails(result.status_id); return (<div className="space-y-4" data-aos="fade-up" data-aos-delay="100"><div className={`flex items-center gap-2 font-medium ${status.color} p-3 rounded-lg ${result.status_id === 3 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>{status.icon} {status.text}</div><div><label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">Input:</label><div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg font-mono text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">{originalCase.input}</div></div><div><label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">Your Output:</label><div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg font-mono text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">{result.stdout || '(no output)'}</div></div><div><label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">Expected Output:</label><div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg font-mono text-sm text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">{originalCase.output}</div></div></div>); })()}</div>) : (<div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400"><div className="text-center" data-aos="zoom-in"><div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center"><Clock className="h-8 w-8 text-neutral-400" /></div><p>Click 'Run' to see test results</p></div></div>)}
                </TabsContent>
            </Tabs>
        </div>
    );
};

const SubmissionResultModal = ({ result, onClose }) => {
    if (!result) return null;

    const isSuccess = result.success;
    const title = isSuccess ? "Accepted" : "Wrong Answer";
    const titleColor = isSuccess ? "text-green-500" : "text-red-500";

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#282828] w-full max-w-xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 transform transition-all duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="relative p-6 text-center"><button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" aria-label="Close modal"><X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" /></button><div className={`mx-auto h-20 w-20 flex items-center justify-center rounded-full ${isSuccess ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800'} mb-6`}>{isSuccess ? (<CheckCircle2 className="h-12 w-12 text-green-500" />) : (<XCircle className="h-12 w-12 text-red-500" />)}</div><h2 className={`text-3xl font-bold ${titleColor} mb-2`}>{result.status?.replace(/_/g, ' ') || title}</h2>{result.errorMessage ? (<div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700"><p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono text-left">{result.errorMessage}</p></div>) : (<p className="text-neutral-600 dark:text-neutral-400 text-lg">Your solution passed all hidden test cases.</p>)}</div>
                {!result.errorMessage && (<div className="mx-6 mb-6 grid grid-cols-2 gap-4"><div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700"><div className="flex items-center justify-center mb-2"><Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2" /><p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Runtime</p></div><p className="text-xl font-bold text-neutral-900 dark:text-white text-center">{result.runtime?.toFixed(2) || '0.00'} ms</p></div><div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700"><div className="flex items-center justify-center mb-2"><MemoryStick className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2" /><p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Memory</p></div><p className="text-xl font-bold text-neutral-900 dark:text-white text-center">{((result.memory || 0) / 1024).toFixed(2)} MB</p></div></div>)}
                <div className="p-6 pt-0 flex justify-end"><button onClick={onClose} className="px-6 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors font-medium">Close</button></div>
            </div>
        </div>
    );
}

// --- Main Page Component ---
const DSAProblemPage = () => {
    let { problemId, sessionId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    let [problemData, setProblemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [isDark, setIsDark] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState();
    const [toasts, setToasts] = useState([]);
    const [submissionResult, setSubmissionResult] = useState(null);
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [isPairSession, setIsPairSession] = useState(!!sessionId);
    const [sessionData, setSessionData] = useState(null);
    const [participantDetails, setParticipantDetails] = useState({});
    const [editorCode, setEditorCode] = useState('');
    const isDriver = isPairSession && sessionData?.current_driver === user?._id;

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    let [peerConnection, setPeerConnection] = useState(null); 
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const remoteAudioRef = useRef();

    







    const processedCandidates = useRef(new Set());



    const cleanupConnections = () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }

        if (remoteAudioRef?.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-10">
                <LoginAccessCard message="You need to be logged in to view  challenge!" />
            </div>
        )
    }
    useEffect(() => {
        if (!sessionData || !user) return;

        // This helper function now calls our new API endpoint
        const fetchUserDetails = async (userId) => {
            if (!userId || participantDetails[userId]) return; // Avoids re-fetching

            try {
                // Calls the backend endpoint we just created
                const response = await axios_client.get(`/user/profile/${userId}`);
                return response.data;
            } catch (error) {
                console.error(`Failed to fetch details for user ${userId}`, error);
                return { _id: userId, first_name: 'Unknown' }; // Provides a fallback
            }
        };

        const { user1_id, user2_id } = sessionData;
        const promises = [];

        // This efficient logic remains the same:
        // Use Redux for yourself, call the API for your partner.
        if (user1_id === user._id) {
            promises.push(Promise.resolve(user));
        } else if (user1_id) {
            promises.push(fetchUserDetails(user1_id));
        }

        if (user2_id === user._id) {
            promises.push(Promise.resolve(user));
        } else if (user2_id) {
            promises.push(fetchUserDetails(user2_id));
        }

        Promise.all(promises).then(results => {
            const newDetails = {};
            results.forEach(detail => {
                if (detail) newDetails[detail._id] = detail;
            });
            setParticipantDetails(prevDetails => ({ ...prevDetails, ...newDetails }));
        });

    }, [sessionData?.user1_id, sessionData?.user2_id, user]);


    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true, // Only animate elements once
            easing: 'ease-out-cubic',
        });
    }, []);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    };
    const removeToast = (id) => setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));

    const handleEditorMount = (editor) => editorRef.current = editor;
    useEffect(() => {
        const fetchProblemLogic = async () => {
            setLoading(true);
            try {
                const path = location.pathname === "/problem/potd"
                    ? `/problem/potd`
                    : `/problem/getParticularProblem?by=id&value=${problemId}`;

                const response = await axios_client.get(path);
                setProblemData(response.data.problem);

                // When problem data first arrives, initialize our master code state.
                const starterCode = response.data.problem?.start_code.find(c => c.language === language)?.initial_code || '';
                setEditorCode(starterCode);

            } catch (err) {
                // ... your error handling
            } finally {
                setLoading(false);
            }
        };

        if (problemId || location.pathname === "/problem/potd") {
            fetchProblemLogic();
        } else {
            setError("No problem ID found in URL.");
            setLoading(false);
        }
    }, [problemId, location.pathname, language]);


    const handleSwitchRoles = async () => {
        if (!sessionData || !sessionData.user2_id) {
            addToast("Your partner has not joined yet.", "info");
            return;
        }
        const nextDriver = sessionData.user1_id === sessionData.current_driver
            ? sessionData.user2_id
            : sessionData.user1_id;
        const sessionRef = doc(db, 'pair_sessions', sessionId);
        await updateDoc(sessionRef, { current_driver: nextDriver });
        addToast("Roles switched!", "success");
    };

    const handleSyncCode = async () => {
        if (!editorRef.current) return;

        const currentCode = editorRef.current.getValue();
        const sessionRef = doc(db, 'pair_sessions', sessionId);

        try {
            await updateDoc(sessionRef, { code_content: currentCode });
            addToast("Code synced!", "success");
        } catch (error) {
            console.error("Error syncing code:", error);
            addToast("Failed to sync code", "error");
        }
    };


    const handleRunCode = async () => {
        if (!editorRef.current) { addToast("Editor is not ready.", "error"); return; }
        const userCode = editorRef.current.getValue();
        if (!userCode.trim()) { addToast("Cannot run empty code.", "info"); return; }

        setIsRunning(true);
        setTestResults(null);
        addToast("Running your code...", "info");
          problemId=problemData._id

        try {
            const response = await axios_client.post(`/code/run/${problemId}`, { code: userCode, language: language });
            setTestResults(response.data);
            if (response.data.success) { addToast("Accepted!", "success"); }
            else { addToast("Some test cases failed.", "error"); }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || "An unexpected server error occurred.";
            setTestResults({ success: false, testCases: [], errorMessage: errorMessage });
            addToast("Failed to run code.", "error");
        } finally {
            setIsRunning(false);
        }
    };


    const handleSubmit = async () => {
        // 1. Basic editor checks (no changes here)
        if (!editorRef.current) { addToast("Editor is not ready.", "error"); return; }
        const userCode = editorRef.current.getValue();
        if (!userCode.trim()) { addToast("Cannot submit empty code.", "info"); return; }

        setIsRunning(true);
        setSubmissionResult(null);
        addToast("Submitting for final evaluation...", "info");

        // 2. Get contestId from URL (no changes here)
        const queryParams = new URLSearchParams(location.search);
        const contestId = queryParams.get('contestId');
        console.log(problemData)
        problemId=problemData._id

        try {
            // --- THIS IS THE KEY FLOW ---

            // 3. First API Call: Submit the code for judging
            const submissionResponse = await axios_client.post(`/code/submit/${problemId}`, {
                code: userCode,
                language: language,
                contestId: contestId, // Send contestId here
            });
            const result = submissionResponse.data;

            // 4. Check if this was a SUCCESSFUL contest submission
            if (result.success && result.contestId) {

                // This was a successful solve inside a contest.
                addToast("Code Accepted! Now updating contest progress...", "success");

                try {
                    // 5. Second API Call: Explicitly tell the contest endpoint to track the solve.
                    await axios_client.post(`/contest/${result.contestId}/track-solve/${result.problemId}`);

                    // 6. Set the sessionStorage item for the redirect
                    sessionStorage.setItem(`solvedProblem_${result.contestId}`, result.problemId);

                    // 7. Redirect back to the arena
                    setTimeout(() => {
                        navigate(`/contest/${result.contestId}/arena`);
                    }, 1500); // Give user time to see toast

                } catch (trackingError) {
                    // Handle cases where judging works but contest tracking fails
                    console.error("CRITICAL: Code was accepted but failed to track contest progress.", trackingError);
                    addToast("Error updating contest progress. Please contact support.", "error");
                    setSubmissionResult(result); // Show the success modal anyway
                }

            } else {
                // This was a regular submission, or a failed contest one.
                // Just show the result modal as usual.
                setSubmissionResult(result);
            }

        } catch (error) {
            console.error("Submission failed:", error);
            const errorMessage = error.response?.data?.message || "An unexpected server error occurred.";
            setSubmissionResult({ success: false, status: 'server_error', errorMessage: errorMessage });
            addToast("Submission failed.", "error");
        } finally {
            setIsRunning(false);
        }
    }
    const isProcessingSignaling = useRef(false);
    const hasProcessedOffer = useRef(false);
    const hasProcessedAnswer = useRef(false);
    const lastProcessedOfferTimestamp = useRef(0);
    const lastProcessedAnswerTimestamp = useRef(0);
    const webrtcInitialized = useRef(false);

    const clearWebRTCData = async () => {
        if (!sessionId) return;

        const sessionRef = doc(db, 'pair_sessions', sessionId);
        try {
            await updateDoc(sessionRef, {
                webrtc_offer: null,
                webrtc_answer: null,
                webrtc_ice_candidates_user1: [],
                webrtc_ice_candidates_user2: []
            });

            // Reset all local flags
            hasProcessedOffer.current = false;
            hasProcessedAnswer.current = false;
            isProcessingSignaling.current = false;
            webrtcInitialized.current = false;
            lastProcessedOfferTimestamp.current = 0;
            lastProcessedAnswerTimestamp.current = 0;
            processedCandidates.current.clear();


            // Add a small delay to ensure Firestore updates propagate
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (err) {
            console.error("Error clearing WebRTC data:", err);
        }
    };

    useEffect(() => {
        if (!isPairSession || !user?._id) return;

        const sessionRef = doc(db, 'pair_sessions', sessionId);
        const unsubscribe = onSnapshot(sessionRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSessionData(data);

                // Code synchronization logic
                const amIDriver = data.current_driver === user._id;
                if (!amIDriver && editorRef.current && data.code_content !== editorRef.current.getValue()) {
                    setEditorCode(data.code_content);
                }

                // Auto-join logic
                if (data.user1_id !== user._id && !data.user2_id) {
                    updateDoc(sessionRef, { user2_id: user._id, user2_mic_on: true });
                    return;
                }

                // Only proceed if both users are present
                if (!data.user1_id || !data.user2_id) return;

                const isCaller = data.user1_id === user._id;

                // Initialize WebRTC if not already done
                if (!peerConnection && !webrtcInitialized.current) {

                    webrtcInitialized.current = true;

                    // Clear any old signaling data first
                    await clearWebRTCData();

                    const servers = {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ],
                        sdpSemantics: 'unified-plan'
                    };

                    const pc = new RTCPeerConnection(servers);

                    // Set up event handlers
                    pc.ontrack = (event) => {
                        setRemoteStream(event.streams[0]);
                    };

                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            const field = isCaller ? 'webrtc_ice_candidates_user1' : 'webrtc_ice_candidates_user2';
                            updateDoc(sessionRef, {
                                [field]: arrayUnion(event.candidate.toJSON())
                            }).catch(console.error);
                        }
                    };

                    pc.onconnectionstatechange = () => {
                        if (pc.connectionState === 'failed') {
                            // Clear signaling data and restart
                            clearWebRTCData().then(() => {
                                window.location.reload(); // Simple restart for now
                            });
                        }
                    };

                    // CRITICAL FIX: Get media and add tracks in CONSISTENT order
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: true,
                                noiseSuppression: true,
                                autoGainControl: true
                            },
                            video: false
                        });

                        setLocalStream(stream);

                        // IMPORTANT: Sort tracks to ensure consistent ordering
                        const audioTracks = stream.getAudioTracks();
                        const videoTracks = stream.getVideoTracks();

                        // Add audio tracks first, then video (consistent order)
                        [...audioTracks, ...videoTracks].forEach(track => {
                            pc.addTrack(track, stream);
                        });

                    } catch (err) {
                        console.error("🚫 Media access error:", err);
                        addToast("Microphone access denied. Voice chat disabled.", "error");
                    }

                    setPeerConnection(pc);

                    // If caller, create offer after a delay to ensure everything is set up
                    if (isCaller) {
                        setTimeout(async () => {
                            try {
                                if (pc.signalingState === 'stable') {

                                    // Use consistent offer options
                                    const offer = await pc.createOffer({
                                        offerToReceiveAudio: true,
                                        offerToReceiveVideo: false,
                                        voiceActivityDetection: false // Helps with consistency
                                    });

                                    await pc.setLocalDescription(offer);

                                    await updateDoc(sessionRef, {
                                        webrtc_offer: {
                                            type: offer.type,
                                            sdp: offer.sdp,
                                            timestamp: Date.now()
                                        }
                                    });
                                }
                            } catch (err) {
                                console.error("❌ Error creating offer:", err);
                                addToast("Failed to create voice call offer", "error");
                            }
                        }, 2000); // Increased delay for stability
                    }

                    return;
                }

                // Handle signaling with proper error handling
                if (peerConnection && !isProcessingSignaling.current) {
                    isProcessingSignaling.current = true;

                    try {
                        // CALLER: Handle incoming answer
                        if (isCaller && data.webrtc_answer && !hasProcessedAnswer.current) {
                            const answerTimestamp = data.webrtc_answer.timestamp || 0;
                            if (answerTimestamp <= lastProcessedAnswerTimestamp.current) {
                                return;
                            }


                            if (peerConnection.signalingState === 'have-local-offer') {
                                try {
                                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.webrtc_answer));
                                    hasProcessedAnswer.current = true;
                                    lastProcessedAnswerTimestamp.current = answerTimestamp;
                                } catch (sdpError) {
                                    console.error("❌ SDP Error:", sdpError);
                                    addToast("Voice connection failed. Please refresh.", "error");
                                    // Clear and restart
                                    await clearWebRTCData();
                                }
                            }
                        }

                        // CALLEE: Handle incoming offer and create answer
                        else if (!isCaller && data.webrtc_offer && !hasProcessedOffer.current) {
                            const offerTimestamp = data.webrtc_offer.timestamp || 0;
                            if (offerTimestamp <= lastProcessedOfferTimestamp.current) {
                                return;
                            }


                            if (peerConnection.signalingState === 'stable') {
                                try {
                                    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.webrtc_offer));
                                    hasProcessedOffer.current = true;
                                    lastProcessedOfferTimestamp.current = offerTimestamp;


                                    // Use consistent answer options
                                    const answer = await peerConnection.createAnswer({
                                        voiceActivityDetection: false // Match the offer options
                                    });

                                    await peerConnection.setLocalDescription(answer);

                                    await updateDoc(sessionRef, {
                                        webrtc_answer: {
                                            type: answer.type,
                                            sdp: answer.sdp,
                                            timestamp: Date.now()
                                        }
                                    });
                                } catch (sdpError) {
                                    console.error("❌ SDP Error:", sdpError);
                                    addToast("Voice connection failed. Please refresh.", "error");
                                    await clearWebRTCData();
                                }
                            }
                        }

                        // Handle ICE candidates (unchanged but with better error handling)
                        if (peerConnection.remoteDescription) {
                            const partnerCandidatesField = isCaller ? 'webrtc_ice_candidates_user2' : 'webrtc_ice_candidates_user1';

                            if (data[partnerCandidatesField] && Array.isArray(data[partnerCandidatesField])) {
                                for (const candidateJSON of data[partnerCandidatesField]) {
                                    const candidateKey = JSON.stringify(candidateJSON);
                                    if (!processedCandidates.current.has(candidateKey)) {
                                        try {
                                            await peerConnection.addIceCandidate(new RTCIceCandidate(candidateJSON));
                                            processedCandidates.current.add(candidateKey);
                                        } catch (err) {
                                            // ICE candidate errors are often harmless
                                            console.warn("⚠️ ICE candidate error (safe to ignore):", err.message);
                                        }
                                    }
                                }
                            }
                        }

                    } catch (err) {
                        console.error("❌ Signaling error:", err);
                        // Reset flags on error
                        hasProcessedOffer.current = false;
                        hasProcessedAnswer.current = false;
                    } finally {
                        isProcessingSignaling.current = false;
                    }
                }

            } else {
                addToast("Pair session not found or has ended.", "error");
                navigate(`/problems/${problemId || '1'}`);
            }
        });

        return () => {
            unsubscribe();
            isProcessingSignaling.current = false;
        };

    }, [isPairSession, sessionId, user, navigate, problemId, peerConnection]);

    useEffect(() => {
        // Main guard clause: Do nothing if this isn't a valid pair session.
        if (!isPairSession || !user?._id) return;

        const sessionRef = doc(db, 'pair_sessions', sessionId);
        
        const clearWebRTCData = async () => {
            if (!sessionId) return;
            try {
                await updateDoc(sessionRef, {
                    webrtc_offer: null, webrtc_answer: null,
                    webrtc_ice_candidates_user1: [], webrtc_ice_candidates_user2: []
                });
                processedCandidates.current.clear();
            } catch (err) { console.error("Error clearing WebRTC data:", err); }
        };

        const unsubscribe = onSnapshot(sessionRef, async (docSnap) => {
            if (!docSnap.exists()) {
                addToast("Pair session not found or has ended.", "error");
                navigate(`/problems/${problemId || '1'}`);
                return;
            }

            const data = docSnap.data();
            setSessionData(data); // Update session state for UI

            // Handle code sync (already correct)
            const amIDriver = data.current_driver === user._id;
            if (!amIDriver && editorRef.current && data.code_content !== editorRef.current.getValue()) {
                setEditorCode(data.code_content);
            }

            // Auto-join logic (already correct)
            if (data.user1_id !== user._id && !data.user2_id) {
                updateDoc(sessionRef, { user2_id: user._id, user2_mic_on: true });
                return; 
            }
            
            // Only proceed with WebRTC if both users are present.
            if (!data.user1_id || !data.user2_id) return;
            
            // ============ WebRTC State Machine Starts Here ============

            // --- STAGE 1: INITIALIZATION ---
            if (!peerConnection && !webrtcInitialized.current) {
                webrtcInitialized.current = true; // Prevent this block from running again

                await clearWebRTCData(); // Start with a clean slate

                const servers = { 
                    iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
                    sdpSemantics: 'unified-plan' // *** FIX #1: Force modern, consistent SDP format ***
                };

                const pc = new RTCPeerConnection(servers);
                setPeerConnection(pc); // Set the connection object in state

                pc.ontrack = (event) => {  setRemoteStream(event.streams[0]); };
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        const field = (data.user1_id === user._id) ? 'webrtc_ice_candidates_user1' : 'webrtc_ice_candidates_user2';
                        updateDoc(sessionRef, { [field]: arrayUnion(event.candidate.toJSON()) });
                    }
                };

                // Get local audio and add tracks
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    setLocalStream(stream);
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));
                } catch (err) {
                    addToast("Microphone access denied. Voice chat disabled.", "error");
                }

                return; // IMPORTANT: Exit here to let state update before continuing to signal
            }
            
            // --- STAGE 2: SIGNALING EXCHANGE ---
            if (peerConnection && !isProcessingSignaling.current) {
                isProcessingSignaling.current = true;
                const isCaller = data.user1_id === user._id;

                try {
                    // --- CALLER LOGIC ---
                    if (isCaller) {
                        if (peerConnection.signalingState === 'stable' && !data.webrtc_offer) {
                            const offer = await peerConnection.createOffer();
                            await peerConnection.setLocalDescription(offer);
                            await updateDoc(sessionRef, { webrtc_offer: { type: offer.type, sdp: offer.sdp } });
                        }
                        if (data.webrtc_answer && peerConnection.signalingState === 'have-local-offer') {
                            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.webrtc_answer));
                        }
                    } 
                    // --- CALLEE LOGIC ---
                    else {
                        if (data.webrtc_offer && peerConnection.signalingState === 'stable') {
                            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.webrtc_offer));

                            const answer = await peerConnection.createAnswer();
                            await peerConnection.setLocalDescription(answer);
                            await updateDoc(sessionRef, { webrtc_answer: { type: answer.type, sdp: answer.sdp } });
                        }
                    }

                    // --- ICE Candidate Handling (for both) ---
                    const partnerCandidatesField = isCaller ? 'webrtc_ice_candidates_user2' : 'webrtc_ice_candidates_user1';
                    if (peerConnection.remoteDescription && data[partnerCandidatesField]) {
                        for (const candidateJSON of data[partnerCandidatesField]) {
                            const candidateKey = JSON.stringify(candidateJSON);
                            if (!processedCandidates.current.has(candidateKey)) {
                                await peerConnection.addIceCandidate(new RTCIceCandidate(candidateJSON));
                                processedCandidates.current.add(candidateKey);
                            }
                        }
                    }
                } catch (err) {
                    console.error("❌ Signaling Error:", err);
                } finally {
                    isProcessingSignaling.current = false;
                }
            }
        });

        // Main cleanup for when the component unmounts
        return () => {
            unsubscribe();
            if (peerConnection) {
                peerConnection.close();
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };

    // This consolidated hook runs whenever a key dependency changes.
    }, [isPairSession, sessionId, user, peerConnection]); 


    useEffect(() => {
        return () => {
            if (peerConnection) {
                peerConnection.close();
            }
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            // Reset all refs
            isProcessingSignaling.current = false;
            hasProcessedOffer.current = false;
            hasProcessedAnswer.current = false;
            webrtcInitialized.current = false;
            lastProcessedOfferTimestamp.current = 0;
            lastProcessedAnswerTimestamp.current = 0;
        };
    }, []);

   useEffect(() => {
    // Only proceed if we have a stream and a reference to our audio element.
    if (remoteStream && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;

        const playAudio = () => {
            const audioEl = remoteAudioRef.current;
            if (audioEl) {
                // Ensure the audio element's muted state respects our speaker toggle
                audioEl.muted = !isSpeakerOn;
                
                // Attempt to play the audio
                const promise = audioEl.play();

                if (promise !== undefined) {
                    promise.catch(error => {
                        // This block runs if autoplay is blocked.
                        console.warn("⚠️ Playback blocked. Waiting for user gesture...");
                        addToast("Click anywhere to enable audio", "info");

                        // Define a function that will be called on the first click.
                        const enableAudioOnClick = () => {
                            audioEl.play().then(() => {
                                // IMPORTANT: Clean up the listener after it has succeeded.
                                document.removeEventListener('click', enableAudioOnClick);
                            });
                        };
                        
                        // Add the one-time click listener to the entire document.
                        document.addEventListener('click', enableAudioOnClick);
                    });
                }
            }
        };

        playAudio();
    }
}, [remoteStream]);


useEffect(() => {
    if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = !isSpeakerOn;
    }
}, [isSpeakerOn])
    const handleToggleMute = async () => {
        if (!localStream) {
            addToast("Microphone not available", "error");
            return;
        }

        const newMutedState = !isMuted;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !newMutedState;
        });
        setIsMuted(newMutedState);

        // Update status in Firestore
        if (sessionData && sessionId) {
            try {
                const sessionRef = doc(db, 'pair_sessions', sessionId);
                const micStatusField = sessionData.user1_id === user._id ? 'user1_mic_on' : 'user2_mic_on';
                await updateDoc(sessionRef, { [micStatusField]: !newMutedState });
            } catch (error) {
                console.error("Error updating mic status:", error);
            }
        }
    };

    useEffect(() => {
        // Called when new session starts
        cleanupConnections(); // ✅ Prevent old audio bugs

    }, [sessionId]);       

    useEffect(() => {
        // This is the main guard clause. It now correctly waits for a full session.
        if (!isPairSession || !sessionData?.user1_id || !sessionData?.user2_id || !user?._id) {
            return;
        }

        let pc = peerConnection; // Use a local variable for clarity

        // --- Part A: Initialization (Only if the connection doesn't exist yet) ---
        if (!pc) {
            const servers = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };
            pc = new RTCPeerConnection(servers);
            setPeerConnection(pc); // Set it in state so this block doesn't re-run

            // Add local media tracks
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(stream => {
                    setLocalStream(stream);
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));
                })
                .catch(err => addToast("Microphone access denied. Voice chat disabled.", "error"));

            // Add event listeners for the new connection
            pc.ontrack = (event) => setRemoteStream(event.streams[0]);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const sessionRef = doc(db, 'pair_sessions', sessionId);
                    const field = sessionData.user1_id === user._id ? 'webrtc_ice_candidates_user1' : 'webrtc_ice_candidates_user2';
                    updateDoc(sessionRef, { [field]: arrayUnion(event.candidate.toJSON()) });
                }
            };

            return; // Exit after initialization to let state update
        }

        // --- Part B: Asynchronous Signaling Logic ---
        const handleSignaling = async () => {
            const isCaller = sessionData.user1_id === user._id;

            // --- THE CALLER'S LOGIC ---
            if (isCaller) {
                // STATE CHECK: Only create offer if connection is stable and has no local description
                if (pc.signalingState === 'stable' && !pc.localDescription) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    const sessionRef = doc(db, 'pair_sessions', sessionId);
                    await updateDoc(sessionRef, { webrtc_offer: { type: offer.type, sdp: offer.sdp } });
                }

                // STATE CHECK: Set the answer only if we have a local offer and receive an answer
                if (sessionData.webrtc_answer && pc.signalingState === 'have-local-offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(sessionData.webrtc_answer));
                }
            }
            // --- THE CALLEE'S LOGIC ---
            else {
                // STATE CHECK: Set the offer only if we've received one and have no local description
                if (sessionData.webrtc_offer && !pc.localDescription) {
                    await pc.setRemoteDescription(new RTCSessionDescription(sessionData.webrtc_offer));

                    // After setting the remote offer, create and set the answer
                    if (pc.signalingState === 'have-remote-offer') {
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        const sessionRef = doc(db, 'pair_sessions', sessionId);
                        await updateDoc(sessionRef, { webrtc_answer: { type: answer.type, sdp: answer.sdp } });
                    }
                }
            }

            // --- ICE Candidate Handling for BOTH users ---
            // This part remains the same, but it's now safer because it runs after the state checks above.
            const partnerCandidatesField = isCaller ? 'webrtc_ice_candidates_user2' : 'webrtc_ice_candidates_user1';
            if (sessionData[partnerCandidatesField]) {
                sessionData[partnerCandidatesField].forEach(candidateJSON => {
                    const candidateKey = JSON.stringify(candidateJSON);
                    if (!processedCandidates.current.has(candidateKey)) {
                        pc.addIceCandidate(new RTCIceCandidate(candidateJSON));
                        processedCandidates.current.add(candidateKey);
                    }
                });
            }
        };

        handleSignaling().catch(err => console.error("Signaling Error:", err));

        // The cleanup is handled when the component unmounts entirely by another hook or logic

    }, [sessionData, user, isPairSession, peerConnection, sessionId, addToast]);
   

    useEffect(() => {
        const enableAudio = () => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.play()
                    .then(() => console.log(" Playback allowed after user interaction"))
                    .catch(err => console.warn("⚠️ Still failed:", err));
            }

            // Clean up: remove event after success
            window.removeEventListener("click", enableAudio);
        };

        window.addEventListener("click", enableAudio);

        return () => window.removeEventListener("click", enableAudio);
    }, []);


    const handleToggleSpeaker = () => {
        setIsSpeakerOn(prevState => !prevState);
    };



    const handleResetCode = () => {
        if (editorRef.current && problemData) {
            const starterCode = problemData.start_code.find(c => c.language === language)?.initial_code || '';
            editorRef.current.setValue(starterCode);
            addToast("Code has been reset to default.", "info");
        }
    };

    const handlePrevProblem = () => {
        let serial_number = problemData.serial_number;
        if (serial_number === 1) { serial_number = 20 }
        if (!problemId) { setError("No problem ID found in URL."); setLoading(false); return; }
        const fetchProblem = async () => {
            setLoading(true); setError('');
            try {
                const response = await axios_client.get(`/problem/getParticularProblem?by=serial&value=${serial_number - 1}`);
                setProblemData(response.data.problem);
            } catch (err) {
                setProblemData(null);
                setError(err.message || 'Failed to fetch problem. It may not exist.');
            } finally {
                setLoading(false);
            }
        };
        fetchProblem()
    };

    const handleNextProblem = () => {
        let serial_number = problemData.serial_number;
        if (serial_number === 20) { serial_number = 1 }
        if (!problemId) { setError("No problem ID found in URL."); setLoading(false); return; }
        const fetchProblem = async () => {
            setLoading(true); setError('');
            try {
                const response = await axios_client.get(`/problem/getParticularProblem?by=serial&value=${serial_number + 1}`);
                setProblemData(response.data.problem);
            } catch (err) {
                setProblemData(null);
                setError(err.message || 'Failed to fetch problem. It may not exist.');
            } finally { setLoading(false); }
        };
        fetchProblem()
    };

    const handleRandomProblem = () => {
        const serial_number = Math.floor(Math.random() * 20) + 1;
        if (!problemId) { setError("No problem ID found in URL."); setLoading(false); return; }
        const fetchProblem = async () => {
            setLoading(true); setError('');
            try {
                const response = await axios_client.get(`/problem/getParticularProblem?by=serial&value=${serial_number + 1}`);
                setProblemData(response.data.problem);
            } catch (err) {
                setProblemData(null);
                setError(err.message || 'Failed to fetch problem. It may not exist.');
            } finally { setLoading(false); }
        };
        fetchProblem()
    };

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) { root.classList.add('dark'); }
        else { root.classList.remove('dark'); }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);


    if (loading) return <div className="flex justify-center items-center h-screen bg-[#1E1E1E] text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-[#1E1E1E] text-white"><Card className="p-6 text-center bg-[#282828] border-gray-700"><AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" /><h3 className="font-semibold text-xl">Error</h3><p className="text-muted-foreground">{error}</p><Link to="/problems"><Button variant="outline" className="mt-4">
        Back to List

    </Button></Link></Card></div>;
    if (!problemData) return null;



    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            {submissionResult && <SubmissionResultModal result={submissionResult} onClose={() => setSubmissionResult(null)} />}
            <div className="h-screen bg-white dark:bg-[#1E1E1E] text-neutral-800 dark:text-white flex flex-col">
                <header className="h-14 border-b-2 border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-800 px-4 flex items-center justify-between" data-aos="fade-down">
                    <div className="flex items-center gap-4">
                        <div className="flex"><Link to="/" className="btn btn-ghost text-2xl font-bold text-neutral-800 dark:text-neutral-200 gap-2"><img src={logo} className="w-10 h-10" alt="CodeG Logo" /></Link></div>
                        <Link to="/problems" className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"><List className="h-5 w-5" />Problem List</Link>
                        <div className="hidden sm:flex items-center text-neutral-500 dark:text-neutral-400">
                            <Button variant="ghost" size="icon" onClick={handlePrevProblem} disabled={parseInt(problemId, 10) <= 1}><ChevronLeft className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleNextProblem}><ChevronRight className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleRandomProblem}><Shuffle className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    {/* <div className="flex-1 flex justify-center items-center gap-4">
                        <Button className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700" onClick={handleRunCode} disabled={isRunning}>{isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}Run</Button>
                        <Button onClick={handleSubmit} disabled={isRunning} className="bg-green-600 hover:bg-green-700 text-white"><Check className="h-4 w-4 mr-2" />Submit</Button>
                    </div> */}
                    <div className="flex-1 flex justify-center items-center gap-4 relative">
                        {}
                        <div className="relative group">
                            <Button
                                className={`
                px-4 py-2 font-medium rounded-md
                transition-all duration-200 ease-in-out
                ${isRunning
                                        ? 'bg-neutral-300 dark:bg-neutral-500 text-neutral-600 dark:text-neutral-300 cursor-wait'
                                        : isPairSession && !isDriver
                                            ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-200 cursor-not-allowed opacity-50'
                                            : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700'
                                    }
            `}
                                onClick={handleRunCode}
                                disabled={isRunning || (isPairSession && !isDriver)}
                            >
                                <div className="flex items-center gap-2">
                                    {isRunning ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="h-4 w-4" />
                                    )}
                                    <span>Run</span>
                                </div>
                            </Button>

                            {}
                            {isPairSession && !isDriver && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black dark:bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                    Only driver can run code
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-gray-800"></div>
                                </div>
                            )}
                        </div>

                        {}
                        <div className="relative group">
                            <Button
                                onClick={handleSubmit}
                                disabled={isRunning || (isPairSession && !isDriver)}
                                className={`
                px-4 py-2 font-medium rounded-md
                transition-all duration-200 ease-in-out
                ${isRunning || (isPairSession && !isDriver)
                                        ? 'bg-green-600 text-white cursor-not-allowed opacity-50'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                    }
            `}
                            >
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    <span>Submit</span>
                                </div>
                            </Button>

                            {}
                            {isPairSession && !isDriver && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black dark:bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                    Only driver can submit code
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black dark:border-t-gray-800"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mr-8 flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700">{isDark ? <Sun className="h-8 w-8" /> : <Moon className="h-8 w-8" />}</Button>
                        <User_icon user={user}></User_icon>
                    </div>
                </header>

                <main className="flex-1 flex min-h-0" data-aos="fade-in" data-aos-delay="200">
                    <PanelGroup direction="horizontal">
                        <Panel defaultSize={50} minSize={30}>

                            <div className="flex flex-col h-full">

                                <div className="flex-grow overflow-auto">
                                    <ProblemDescription problem={problemData} key={problemData._id} />
                                </div>
                                {isPairSession && sessionData && (
                                    <div className="flex-shrink-0  border-t border-neutral-200 dark:border-neutral-700/80">
                                        <PairSessionParticipants
                                            sessionData={sessionData}
                                            participantDetails={participantDetails}
                                        />
                                    </div>
                                )}

                            </div>
                        </Panel> <PanelResizeHandle className="w-1.5 bg-neutral-200 dark:bg-gray-700/60 hover:bg-neutral-400 dark:hover:bg-sky-800 transition-colors" />
                        <Panel defaultSize={50} minSize={30}>
                            <PanelGroup direction="vertical">
                                <Panel defaultSize={65} minSize={20} className="flex flex-col bg-[#1E1E1E]">
                                    {isPairSession && sessionData && (
                                        <>
                                            <PairSessionHeader
                                                sessionData={sessionData}
                                                isDriver={isDriver}
                                                handleSwitchRoles={handleSwitchRoles}
                                                handleSyncCode={handleSyncCode}
                                                addToast={addToast}
                                                sessionId={sessionId}
                                                participantDetails={participantDetails}
                                                isMuted={isMuted}
                                                isSpeakerOn={isSpeakerOn}
                                                handleToggleMute={handleToggleMute}
                                                handleToggleSpeaker={handleToggleSpeaker}
                                                currentUser={user}
                                            />
                                            <audio ref={remoteAudioRef} autoPlay playsInline muted={!isSpeakerOn} />

                                        </>
                                    )}
                                    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 flex items-center justify-between flex-shrink-0">
                                        <div className="flex items-center gap-4">
                                            <Tabs defaultValue="code"><TabsList className="bg-transparent p-0"><TabsTrigger value="code" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors text-neutral-600 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm dark:text-neutral-400 dark:hover:text-white dark:data-[state=active]:bg-neutral-800 dark:data-[state=active]:text-white"><Code className="h-4 w-4" /> Code</TabsTrigger></TabsList></Tabs>
                                        </div>
                                        <div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={handleResetCode} className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"><RotateCcw className="h-4 w-4" /></Button><LanguageSelector language={language} setLanguage={setLanguage} availableLanguages={problemData.start_code} /></div>
                                    </header>
                                    {}
                                    <div className="flex-1 min-h-0">
                                        <CodeEditorPanel
                                            language={language}
                                            isDark={isDark}
                                            onMount={handleEditorMount}

                                            code={editorCode}

                                            onCodeChange={setEditorCode}

                                            readOnly={isPairSession && !isDriver}
                                        />
                                    </div>
                                </Panel>
                                <PanelResizeHandle className="h-1.5 bg-neutral-200 dark:bg-gray-700/60 hover:bg-neutral-400 dark:hover:bg-sky-800 transition-colors" />
                                <Panel defaultSize={35} minSize={20}><TestcasePanel testcases={problemData.visible_testcase} isRunning={isRunning} testResults={testResults} /></Panel>

                            </PanelGroup>
                        </Panel>
                    </PanelGroup>
                </main>
            </div>
        </>
    );
};

export default DSAProblemPage;