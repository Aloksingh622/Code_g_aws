import { useState, useRef, useEffect } from "react";
import axios_client from "../utils/axiosconfig"; // Using your configured axios instance
import { Send, Bot, User, Code, Sparkles, Copy, Check, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useForm } from "react-hook-form";

//================================================================//
// 1. Message Component: Now handles an "isLoading" state
//================================================================//
const Message = ({ role, text, timestamp, isError, isLoading }) => {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopyCode = (codeText) => {
        navigator.clipboard.writeText(codeText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const messageContainerClasses = isUser ? "justify-end" : "justify-start";
    const bubbleClasses = isUser
        ? "bg-blue-600 text-white"
        : isError
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : "bg-[#2D3748] text-gray-200";

    const Avatar = () => (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700">
            {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
    );

    // This is the "Typing..." indicator bubble
    if (isLoading) {
        return (
            <div className={`flex items-start gap-3 ${messageContainerClasses}`}>
                <Avatar />
                <div className="flex flex-col max-w-2xl w-full">
                    <div className="bg-[#2D3748] rounded-xl px-4 py-3 flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`flex items-start gap-3 ${messageContainerClasses} group`}>
            {!isUser && <Avatar />}
            <div className="flex flex-col max-w-2xl w-full">
                <div className={`relative rounded-xl px-4 py-3 ${bubbleClasses}`}>
                    {isError && <AlertTriangle className="absolute -top-2 -left-2 w-5 h-5 text-red-400" />}
                     <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline ? (
                                    <div className="relative my-2 bg-[#1A202C] rounded-md shadow-inner">
                                        <div className="flex items-center justify-between bg-black/30 text-gray-300 px-3 py-1.5 rounded-t-md"><span className="text-xs font-sans font-medium flex items-center gap-2"><Code size={14} />{match ? match[1] : 'code'}</span><button onClick={() => handleCopyCode(String(children))} className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white">{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}</button></div>
                                        <pre className="p-3 text-sm overflow-x-auto"><code className="font-mono" {...props}>{children}</code></pre>
                                    </div>
                                ) : (<code className="bg-black/20 text-blue-300 font-mono px-1.5 py-0.5 rounded" {...props}>{children}</code>);
                            },
                            p: ({ children }) => <p className="leading-relaxed whitespace-pre-wrap">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                        }}
                    >{text}</ReactMarkdown>
                </div>
                 <span className={`text-xs text-gray-500 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {isUser && <Avatar />}
        </div>
    );
};


//================================================================//
// 2. MessageList Component
//================================================================//
const MessageList = ({ messages }) => {
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {messages.map((msg, index) => <Message key={index} {...msg} />)}
            <div ref={messagesEndRef} />
        </div>
    );
};

//================================================================//
// 3. ChatInput Component
//================================================================//
const ChatInput = ({ onSendMessage, isLoading }) => {
    const { register, handleSubmit, reset, watch } = useForm();
    const messageValue = watch("message", "");
    const inputRef = useRef(null);

    const onSubmit = (data) => { if (data.message.trim()) { onSendMessage(data.message); reset(); }};
    
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [messageValue]);

    return (
        <div className="p-4 bg-[#1E1E1E] border-t border-gray-700">
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
                <textarea
                    ref={inputRef}
                    placeholder="Ask for a hint, explain your code, or get help with algorithms..."
                    className="w-full resize-none bg-[#2D3748] text-gray-200 border border-gray-600 rounded-lg px-4 py-3 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all max-h-40"
                    {...register("message")}
                    disabled={isLoading} rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(onSubmit)(); }}}
                />
                <div className="absolute right-20 bottom-7 text-xs text-gray-400 pointer-events-none">{messageValue.length}/500</div>
                <button
                    type="submit"
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={isLoading || !messageValue.trim()}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

//================================================================//
// 4. Main ChatAi Component - USING AXIOS_CLIENT
//================================================================//
function ChatAi({ problem }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (problem?.title) {
            setMessages([
                {
                    role: 'model',
                    text: `Hello! 👋 I'm here to help you with the **${problem.title}** problem. What would you like to know?`,
                    timestamp: new Date().toISOString()
                }
            ]);
        }
    }, [problem.title]);


   const handleSendMessage = async (messageText) => {
    const userMessage = { role: 'user', text: messageText, timestamp: new Date().toISOString() };
    
    // Add the user message and a "typing" placeholder
    setMessages(prev => [...prev, userMessage, { role: 'model', isLoading: true }]);
    setIsLoading(true);

    const payload = {
        messages: [...messages, userMessage].map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
        title: problem.title,
        description: problem.description,
        testCases: problem.testCases,
        startCode: problem.starterCode,
    };

    // Simulate typing animation
    const simulateTyping = async (fullText) => {
        let currentText = "";
        const typingSpeed = 30; // ms per character

        for (let i = 0; i < fullText.length; i++) {
            currentText += fullText[i];
            await new Promise((resolve) => setTimeout(resolve, typingSpeed));

            // Update the last message with new text
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'model',
                    text: currentText,
                    timestamp: new Date().toISOString()
                };
                return updated;
            });
        }
    };

    try {
        const response = await axios_client.post("/problem/aichat", payload);
        const fullText = response.data.message;

        // Start typing effect
        await simulateTyping(fullText);

    } catch (error) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "Sorry, an unexpected error occurred.";
        const errorResponse = {
            role: 'model',
            text: errorMessage,
            timestamp: new Date().toISOString(),
            isError: true,
        };
        setMessages(prev => [...prev.slice(0, -1), errorResponse]);
    } finally {
        setIsLoading(false);
    }
};


    return (
        <div className="flex flex-col h-full bg-[#1E1E1E] text-white rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-gray-700 flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><Sparkles size={20} /></div>
                <div><h2 className="font-semibold text-lg">AI Assistant</h2><p className="text-sm text-gray-400">Ready to help with "{problem?.title}"</p></div>
            </div>
            <MessageList messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
}

export default ChatAi;