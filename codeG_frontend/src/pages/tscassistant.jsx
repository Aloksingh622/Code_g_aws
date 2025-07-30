// src/components/TscAssistant.js

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios_client from "../utils/axiosconfig"; // Your existing axios config
import { Zap, Bot, User, Code, Sparkles, Copy, Check, Crown, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSelector } from "react-redux";
import Editor from "@monaco-editor/react";
import { Link } from "react-router";
import Particles from "@/components/ui/particlebg";
import AOS from 'aos'; // <-- AOS Import
import 'aos/dist/aos.css'; // <-- AOS Styles Import
import LoginAccessCard from "@/component/loginmessage";

// A mock user object. In a real application, this would come from your auth context.


//================================================================//
// 1. AnalysisMessage Component: Renders a single analysis bubble
//================================================================//
const AnalysisMessage = ({ role, text, timestamp }) => {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async (codeToCopy) => {
        try {
            await navigator.clipboard.writeText(codeToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const bubbleClasses = isUser
        ? "bg-gray-100 dark:bg-slate-800"
        : "bg-white dark:bg-slate-700 shadow-sm";

    const avatarClasses = "w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0";
    const avatarColor = isUser ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white';

    const Avatar = () => (
        <div className={`${avatarClasses} ${avatarColor}`}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
    );

    if (isUser) {
        return (
            // Added AOS animation attribute
            <div className="flex items-start gap-4 group" data-aos="fade-up">
                <Avatar />
                <div className="flex flex-col w-full">
                    <div className={`relative rounded-lg border dark:border-slate-700 ${bubbleClasses}`}>
                        <div className="flex items-center justify-between bg-gray-200 dark:bg-slate-900/50 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-t-lg">
                            <span className="text-sm font-semibold">Your Code Submission</span>
                            <button
                                onClick={() => handleCopy(text)}
                                className="p-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                title="Copy code"
                            >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                        <pre className="text-gray-800 dark:text-gray-100 p-4 overflow-x-auto bg-gray-50 dark:bg-slate-800 rounded-b-lg">
                            <code className="font-mono text-sm ">{text}</code>
                        </pre>
                    </div>
                    {timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(timestamp).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        // Added AOS animation attribute
        <div className="flex items-start gap-4 group" data-aos="fade-up">
            <Avatar />
            <div className="flex flex-col w-full">
                <div className={`relative rounded-lg p-5 border dark:border-transparent ${bubbleClasses}`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 border-b dark:border-slate-600 pb-2 flex items-center gap-2">{children}</h2>,
                            p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-2 pl-4">{children}</ul>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                            code: ({ children }) => <code className="bg-gray-200 dark:bg-slate-600 px-1.5 py-1 rounded font-mono text-sm text-pink-500 dark:text-pink-400">{children}</code>
                        }}
                    >
                        {text}
                    </ReactMarkdown>
                </div>
                {timestamp && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(timestamp).toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
};

//================================================================//
// 2. AnalysisLog Component: Displays the list of messages
//================================================================//
const AnalysisLog = ({ messages, isLoading }) => {
    const logEndRef = useRef(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {messages.map((msg, index) => (
                <AnalysisMessage key={index} role={msg.role} text={msg.parts[0].text} timestamp={msg.timestamp} />
            ))}
            {isLoading && (
                // Added AOS animation attribute
                <div className="flex items-start gap-4" data-aos="fade-in">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shadow-md flex-shrink-0">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 w-full border dark:border-transparent">
                        <div className="flex items-center gap-3">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">AI is analyzing...</span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={logEndRef} />
        </div>
    );
};

//================================================================//
// 3. CodeInputForm Component: The form for submitting code
//================================================================//
const CodeInputForm = ({ onAnalyzeCode, isLoading }) => {
    const [code, setCode] = useState(
        `// Example: Fibonacci sequence\nfunction fibonacci(n) {\n  if (n <= 1) {\n    return n;\n  }\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`
    );
    const [theme, setTheme] = useState('light');

    // Effect to detect system theme changes for the editor
    useEffect(() => {
        const darkModeMatcher = window.matchMedia('(prefers-color-scheme: dark)');
        setTheme(darkModeMatcher.matches ? 'vs-dark' : 'light');
        const handler = (e) => setTheme(e.matches ? 'vs-dark' : 'light');
        darkModeMatcher.addEventListener('change', handler);
        return () => darkModeMatcher.removeEventListener('change', handler);
    }, []);

    const handleAnalyzeClick = () => {
        if (code.trim()) {
            onAnalyzeCode(code);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Code size={20} />
                    Code to Analyze
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paste your algorithm or function below.</p>
            </div>

            <div className="flex-1 p-4 flex flex-col min-h-0">
                <div className="border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden h-full">
                    <Editor
                        height="100%"
                        language="javascript"
                        theme={theme}
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
                <button
                    type="button"
                    onClick={handleAnalyzeClick}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
                    disabled={isLoading || !code.trim()}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Zap size={18} />
                            Analyze Complexity
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


//================================================================//
// 4. TscAssistant Component: The main component with subscription logic
//=============================
// ===================================//
function TscAssistant() {

    const { user } = useSelector((state) => state.auth); // Manages user state
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // <-- UseEffect to initialize AOS -->
    useEffect(() => {
        AOS.init({
            duration: 800, // Animation duration
            once: false, // Whether animation should happen only once - while scrolling down
        });
    }, []);

    // Set initial welcome message only for subscribed users
    useEffect(() => {
        if (user?.subscribed) {
            setMessages([
                {
                    role: 'model',
                    parts: [{
                        text: `## Welcome to the AI TSC Assistant! 🚀\n\nI'm ready to analyze the time and space complexity of your code. Just paste your code into the editor on the left and click **"Analyze Complexity"** to get started.`
                    }],
                    timestamp: new Date().toISOString()
                }
            ]);
        }
    }, [user]);

    // Handles sending the code to the backend for analysis
 const handleAnalyzeCode = async (codeText) => {
    const userMessage = {
        role: 'user',
        parts: [{ text: codeText }],
        timestamp: new Date().toISOString()
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
        const response = await axios_client.post("/ai/assist", {
            messages: [{
                role: "user",
                parts: [{ text: codeText }]
            }]
        });

        streamAIResponse(response.data.analysis);

    } catch (error) {
        console.error("API Error:", error);
        const errorMessage = error.response?.data?.message || "Sorry, an unexpected error occurred. Please try again later.";
        setMessages(prev => [...prev, {
            role: 'model',
            parts: [{ text: `❌ **Error:** ${errorMessage}` }],
            timestamp: new Date().toISOString()
        }]);
    } finally {
        setIsLoading(false);
    }
};

const streamAIResponse = (fullText) => {
    const lines = fullText.split('\n');
    let currentText = '';
    let i = 0;

    const interval = setInterval(() => {
        if (i >= lines.length) {
            clearInterval(interval);
            return;
        }

        currentText += lines[i] + '\n';
        setMessages(prev => {
            const newMessages = [...prev];
            const last = newMessages[newMessages.length - 1];

            if (last && last.role === 'model' && last.streaming) {
                last.parts[0].text = currentText;
                return [...newMessages.slice(0, -1), last];
            } else {
                return [
                    ...newMessages,
                    {
                        role: 'model',
                        parts: [{ text: currentText }],
                        timestamp: new Date().toISOString(),
                        streaming: true,
                    }
                ];
            }
        });

        i++;
    }, 120); // adjust speed as needed
};

 if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-10">
                <LoginAccessCard message="You need to be logged in for analyze the code complexity " />
            </div>
        )
    }



    // Render the subscription paywall if the user is not subscribed
    if (user?.subscribed === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-violet-100 to-pink-100 dark:from-slate-800 dark:via-neutral-900 dark:to-slate-800 p-4 transition-colors">
                <div
                    // Added AOS animation attribute
                    data-aos="zoom-in-up"
                    className="card w-full max-w-md bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-2xl transition-all hover:border-primary/40"
                >
                    <div className="card-body items-center text-center p-8">
                        <Crown className="w-16 h-16 text-amber-400 mb-4" />

                        <h2 className="card-title text-3xl font-bold mb-2 text-slate-800 dark:text-white">Unlock TSC Assistant</h2>

                        <p className="text-slate-600 dark:text-slate-300 mb-8">
                            Subscribe to get instant AI-powered time & space complexity analysis for your code.
                        </p>

                        <ul className="text-sm text-left space-y-3 mb-8 w-full">
                            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                <span>Accurate Big-O analysis in milliseconds</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                <span>Line-by-line space complexity breakdown</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                <span>Handles complex algorithms and data structures</span>
                            </li>
                        </ul>

                        <Link to="/payment"><button className="btn btn-primary w-full max-w-xs shadow-lg transform hover:scale-105 transition-transform">
                            Subscribe Now
                        </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render the main TSC Assistant if the user is subscribed
    return (
        <div className="grid grid-cols-1  md:grid-cols-2 h-screen w-screen bg-gray-100 dark:bg-slate-900">
          
            {}
            <div data-aos="fade-right" data-aos-duration="1000">
                <CodeInputForm onAnalyzeCode={handleAnalyzeCode} isLoading={isLoading} />
            </div>


            {}
            <div className="h-full flex flex-col" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-blue-500" />
                        AI Analysis
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Results of your code complexity analysis will appear here.</p>
                </div>
                <AnalysisLog messages={messages} isLoading={isLoading} />
            </div>
        </div>
    );
}

export default TscAssistant;