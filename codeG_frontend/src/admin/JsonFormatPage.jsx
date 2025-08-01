import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, FileJson, Code2, Sparkles } from 'lucide-react';

const aosStyles = `
    [data-aos] {
        transition-duration: 0.6s;
        transition-timing-function: ease-out-cubic;
    }
    
    [data-aos="fade-up"] {
        transform: translate3d(0, 40px, 0);
        opacity: 0;
    }
    
    [data-aos="fade-down"] {
        transform: translate3d(0, -40px, 0);
        opacity: 0;
    }
    
    [data-aos="fade-left"] {
        transform: translate3d(40px, 0, 0);
        opacity: 0;
    }
    
    [data-aos="fade-right"] {
        transform: translate3d(-40px, 0, 0);
        opacity: 0;
    }
    
    [data-aos="zoom-in"] {
        transform: scale(0.8);
        opacity: 0;
    }
    
    [data-aos="flip-up"] {
        transform: perspective(400px) rotateX(80deg);
        opacity: 0;
    }
    
    [data-aos].aos-animate {
        transform: translate3d(0, 0, 0) scale(1) perspective(400px) rotateX(0deg);
        opacity: 1;
    }
`;

export default function JsonFormatPage() {
    const [copyStatus, setCopyStatus] = useState('Copy');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Simple AOS implementation
    useEffect(() => {
        // Add AOS styles
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = aosStyles;
        document.head.appendChild(styleSheet);

        // Initialize AOS
        const initAOS = () => {
            const aosElements = document.querySelectorAll('[data-aos]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.getAttribute('data-aos-delay') || 0;
                        setTimeout(() => {
                            entry.target.classList.add('aos-animate');
                        }, parseInt(delay));
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            aosElements.forEach(el => observer.observe(el));
        };

        // Delay initialization slightly for smooth loading
        setTimeout(initAOS, 100);

        return () => {
            // Cleanup
            if (styleSheet.parentNode) {
                styleSheet.parentNode.removeChild(styleSheet);
            }
        };
    }, []);

    // Check for theme changes
    useEffect(() => {
        const checkTheme = () => {
            // Check multiple possible theme indicators
            const htmlClassList = document.documentElement.classList;
            const bodyClassList = document.body.classList;
            const htmlDataTheme = document.documentElement.getAttribute('data-theme');
            const bodyDataTheme = document.body.getAttribute('data-theme');
            
            const isDark = 
                htmlClassList.contains('dark') ||
                bodyClassList.contains('dark') ||
                htmlDataTheme === 'dark' ||
                bodyDataTheme === 'dark' ||
                htmlDataTheme === 'business' ||
                bodyDataTheme === 'business' ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
                
            setIsDarkMode(isDark);
        };

        // Initial check
        checkTheme();

        // Watch for changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });

        // Also listen for media query changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(checkTheme);

        return () => {
            observer.disconnect();
            mediaQuery.removeListener(checkTheme);
        };
    }, []);

    const jsonFormatExample = `{
  "serial_number": 31,
  "title": "Count Pairs with Given Sum",
  "difficulty": "Easy",
  "description": "Given an array of integers and a target sum, return the number of pairs of elements that add up to the target sum. Each pair should be counted only once.",
  "tags": "Array, Hashmap, Two Pointers",
  "visible_testcase": [
    {
      "input": "[1, 5, 7, -1, 5]\\n6",
      "output": "3",
      "explanation": "Pairs are: (1,5), (7,-1), and another (1,5) considering repeated 5."
    },
    {
      "input": "[1, 1, 1, 1]\\n2",
      "output": "6",
      "explanation": "All 1s form 6 unique pairs with sum 2."
    },
    {
      "input": "[1, 2, 3, 4, 5]\\n9",
      "output": "1",
      "explanation": "Only one pair: (4,5)."
    }
  ],
  "hidden_testcase": [
    {
      "input": "[3, 3, 3, 3]\\n6",
      "output": "6"
    },
    {
      "input": "[0, -1, 2, -3, 1]\\n-2",
      "output": "1"
    },
    {
      "input": "[10, 12, 10, 15, -1, 7, 6, 5]\\n16",
      "output": "3"
    },
    {
      "input": "[]\\n5",
      "output": "0"
    },
    {
      "input": "[1]\\n2",
      "output": "0"
    }
  ],
  "start_code": [
    {
      "language": "python",
      "initial_code": "from typing import List\\nimport json\\n\\ndef count_pairs_with_sum(arr: List[int], target: int) -> int:\\n    # Your code here\\n    return 0\\n\\ntry:\\n    arr = json.loads(input().strip())\\n    target = int(input().strip())\\n    result = count_pairs_with_sum(arr, target)\\n    print(result)\\nexcept Exception as e:\\n    print(0)"
    },
    {
      "language": "c++",
      "initial_code": "#include <iostream>\\n#include <vector>\\n#include <unordered_map>\\n#include <sstream>\\n#include <string>\\nusing namespace std;\\n\\nint countPairsWithSum(vector<int>& arr, int target) {\\n    // Your code here\\n    return 0;\\n}\\n\\nvector<int> parseArray(string s) {\\n    vector<int> arr;\\n    s.erase(0, 1); // remove '['\\n    s.erase(s.size() - 1); // remove ']'\\n    if (s.empty()) return arr;\\n    \\n    stringstream ss(s);\\n    string item;\\n    while (getline(ss, item, ',')) {\\n        arr.push_back(stoi(item));\\n    }\\n    return arr;\\n}\\n\\nint main() {\\n    string line;\\n    getline(cin, line);\\n    vector<int> arr = parseArray(line);\\n    \\n    int target;\\n    cin >> target;\\n    \\n    cout << countPairsWithSum(arr, target) << endl;\\n    return 0;\\n}"
    },
    {
      "language": "java",
      "initial_code": "import java.util.*;\\n\\npublic class Main {\\n    public static int countPairsWithSum(int[] arr, int target) {\\n        // Your code here\\n        return 0;\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String line = sc.nextLine().trim();\\n        \\n        // Parse array\\n        int[] arr;\\n        if (line.equals(\\"[]\\")) {\\n            arr = new int[0];\\n        } else {\\n            line = line.substring(1, line.length() - 1); // remove brackets\\n            String[] parts = line.split(\\",\\");\\n            arr = new int[parts.length];\\n            for (int i = 0; i < parts.length; i++) {\\n                arr[i] = Integer.parseInt(parts[i].trim());\\n            }\\n        }\\n        \\n        int target = sc.nextInt();\\n        System.out.println(countPairsWithSum(arr, target));\\n    }\\n}"
    },
    {
      "language": "javascript",
      "initial_code": "function countPairsWithSum(arr, target) {\\n    // Your code here\\n    return 0;\\n}\\n\\nconst readline = require(\\"readline\\");\\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\\n\\nlet input = [];\\nrl.on(\\"line\\", function (line) { input.push(line.trim()); });\\nrl.on(\\"close\\", function () {\\n    try {\\n        const arr = JSON.parse(input[0]);\\n        const target = parseInt(input[1]);\\n        console.log(countPairsWithSum(arr, target));\\n    } catch (e) {\\n        console.log(0);\\n    }\\n});"
    }
  ],
  "problem_solution": [
    {
      "language": "python",
      "complete_code": "from typing import List\\nimport json\\n\\ndef count_pairs_with_sum(arr: List[int], target: int) -> int:\\n    if len(arr) < 2:\\n        return 0\\n    \\n    freq = {}\\n    count = 0\\n    \\n    for num in arr:\\n        complement = target - num\\n        if complement in freq:\\n            count += freq[complement]\\n        freq[num] = freq.get(num, 0) + 1\\n    \\n    return count\\n\\ntry:\\n    arr = json.loads(input().strip())\\n    target = int(input().strip())\\n    result = count_pairs_with_sum(arr, target)\\n    print(result)\\nexcept Exception as e:\\n    print(0)"
    },
    {
      "language": "c++",
      "complete_code": "#include <iostream>\\n#include <vector>\\n#include <unordered_map>\\n#include <sstream>\\n#include <string>\\nusing namespace std;\\n\\nint countPairsWithSum(vector<int>& arr, int target) {\\n    if (arr.size() < 2) return 0;\\n    \\n    unordered_map<int, int> freq;\\n    int count = 0;\\n    \\n    for (int num : arr) {\\n        int complement = target - num;\\n        if (freq.find(complement) != freq.end()) {\\n            count += freq[complement];\\n        }\\n        freq[num]++;\\n    }\\n    \\n    return count;\\n}\\n\\nvector<int> parseArray(string s) {\\n    vector<int> arr;\\n    s.erase(0, 1); // remove '['\\n    s.erase(s.size() - 1); // remove ']'\\n    if (s.empty()) return arr;\\n    \\n    stringstream ss(s);\\n    string item;\\n    while (getline(ss, item, ',')) {\\n        arr.push_back(stoi(item));\\n    }\\n    return arr;\\n}\\n\\nint main() {\\n    string line;\\n    getline(cin, line);\\n    vector<int> arr = parseArray(line);\\n    \\n    int target;\\n    cin >> target;\\n    \\n    cout << countPairsWithSum(arr, target) << endl;\\n    return 0;\\n}"
    },
    {
      "language": "java",
      "complete_code": "import java.util.*;\\n\\npublic class Main {\\n    public static int countPairsWithSum(int[] arr, int target) {\\n        if (arr.length < 2) return 0;\\n        \\n        Map<Integer, Integer> freq = new HashMap<>();\\n        int count = 0;\\n        \\n        for (int num : arr) {\\n            int complement = target - num;\\n            count += freq.getOrDefault(complement, 0);\\n            freq.put(num, freq.getOrDefault(num, 0) + 1);\\n        }\\n        \\n        return count;\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String line = sc.nextLine().trim();\\n        \\n        // Parse array\\n        int[] arr;\\n        if (line.equals(\\"[]\\")) {\\n            arr = new int[0];\\n        } else {\\n            line = line.substring(1, line.length() - 1); // remove brackets\\n            String[] parts = line.split(\\",\\");\\n            arr = new int[parts.length];\\n            for (int i = 0; i < parts.length; i++) {\\n                arr[i] = Integer.parseInt(parts[i].trim());\\n            }\\n        }\\n        \\n        int target = sc.nextInt();\\n        System.out.println(countPairsWithSum(arr, target));\\n    }\\n}"
    },
    {
      "language": "javascript",
      "complete_code": "function countPairsWithSum(arr, target) {\\n    if (arr.length < 2) return 0;\\n    \\n    const freq = {};\\n    let count = 0;\\n    \\n    for (let num of arr) {\\n        const complement = target - num;\\n        count += freq[complement] || 0;\\n        freq[num] = (freq[num] || 0) + 1;\\n    }\\n    \\n    return count;\\n}\\n\\nconst readline = require(\\"readline\\");\\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\\n\\nlet input = [];\\nrl.on(\\"line\\", function (line) { input.push(line.trim()); });\\nrl.on(\\"close\\", function () {\\n    try {\\n        const arr = JSON.parse(input[0]);\\n        const target = parseInt(input[1]);\\n        console.log(countPairsWithSum(arr, target));\\n    } catch (e) {\\n        console.log(0);\\n    }\\n});"
    }
  ]
}`;

    const handleDownload = () => {
        const blob = new Blob([jsonFormatExample], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'problem_format_example.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonFormatExample).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyStatus('Failed!');
            setTimeout(() => setCopyStatus('Copy'), 3000);
        });
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${
            isDarkMode 
                ? 'bg-gray-900 text-white' 
                : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
        }`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${
                    isDarkMode 
                        ? 'bg-gray-900'
                        : 'bg-gray-900'
                }`}></div>
                <div className={`absolute inset-0 ${
                    isDarkMode 
                        ? 'bg-gray-900'
                        : 'bg-gray-900'
                }`}></div>
                
                {/* Floating Elements */}
                <div className={`absolute top-20 left-20 w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-purple-400' : 'bg-blue-400'
                } animate-pulse`}></div>
                <div className={`absolute top-40 right-32 w-1 h-1 rounded-full ${
                    isDarkMode ? 'bg-blue-400' : 'bg-purple-400'
                } animate-bounce`}></div>
                <div className={`absolute bottom-32 left-40 w-3 h-3 rounded-full ${
                    isDarkMode ? 'bg-pink-400' : 'bg-indigo-400'
                } animate-pulse`}></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 lg:px-8">
                {/* Header */}
                <header className="text-center mb-16 pt-8">
                    <div 
                        className="flex justify-center items-center gap-3 mb-6"
                        data-aos="fade-down"
                        data-aos-delay="100"
                    >
                        <div className={`p-3 rounded-2xl ${
                            isDarkMode 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}>
                            <FileJson className="w-8 h-8 text-white" />
                        </div>
                        <Sparkles className={`w-6 h-6 ${
                            isDarkMode ? 'text-purple-400' : 'text-blue-500'
                        } animate-pulse`} />
                    </div>
                    
                    <h1 
                        className={`text-5xl md:text-7xl font-black mb-6 leading-tight ${
                            isDarkMode 
                                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'
                                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'
                        }`}
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        Problem JSON Format
                    </h1>
                    
                    <p 
                        className={`text-xl md:text-2xl font-medium max-w-2xl mx-auto ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        data-aos="fade-up"
                        data-aos-delay="300"
                    >
                        Perfect structure for your <span className={`font-bold ${
                            isDarkMode ? 'text-purple-400' : 'text-blue-600'
                        }`}>Quick Upload</span> feature
                    </p>
                    
                    {/* Feature badges */}
                    <div 
                        className="flex flex-wrap justify-center gap-3 mt-8"
                        data-aos="fade-up"
                        data-aos-delay="400"
                    >
                        {['Valid JSON', 'Copy Ready', 'Download Ready'].map((badge, index) => (
                            <span 
                                key={badge} 
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    isDarkMode 
                                        ? 'bg-gray-800 text-purple-300 border border-purple-400/30'
                                        : 'bg-white text-blue-600 shadow-md border border-blue-200'
                                }`}
                                data-aos="zoom-in"
                                data-aos-delay={500 + (index * 100)}
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    <div 
                        className={`rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 ${
                            isDarkMode 
                                ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700/50' 
                                : 'bg-white/80 backdrop-blur-xl border-gray-200/50'
                        }`}
                        data-aos="fade-up"
                        data-aos-delay="600"
                    >
                        {/* Card Header */}
                        <div 
                            className={`px-8 py-6 border-b ${
                                isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                            }`}
                            data-aos="fade-right"
                            data-aos-delay="700"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Code2 className={`w-6 h-6 ${
                                        isDarkMode ? 'text-purple-400' : 'text-blue-500'
                                    }`} />
                                    <h2 className={`text-2xl font-bold ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        JSON Structure
                                    </h2>
                                </div>
                                <div 
                                    className="flex items-center gap-3"
                                    data-aos="fade-left"
                                    data-aos-delay="800"
                                >
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                                            copyStatus === 'Copied!' 
                                                ? (isDarkMode 
                                                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                  )
                                                : (isDarkMode 
                                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                  )
                                        }`}
                                    >
                                        {copyStatus === 'Copied!' ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                        {copyStatus}
                                    </button>
                                    
                                    <button
                                        onClick={handleDownload}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                                            isDarkMode 
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        } shadow-lg`}
                                    >
                                        <Download className="w-4 h-4" />
                                        Download JSON
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Code Block */}
                        <div 
                            className={`p-8 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}
                            data-aos="flip-up"
                            data-aos-delay="900"
                        >
                            <div className={`rounded-2xl overflow-hidden border ${
                                isDarkMode ? 'border-gray-700' : 'border-gray-300'
                            }`}>
                                <div className={`flex items-center justify-between px-6 py-4 ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <span className={`text-sm font-medium ml-4 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            problem_format_example.json
                                        </span>
                                    </div>
                                    <div className={`text-xs px-3 py-1 rounded-full ${
                                        isDarkMode ? 'bg-purple-600 text-white' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        JSON
                                    </div>
                                </div>
                                
                                <div className={`overflow-auto ${
                                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                                }`} style={{ maxHeight: '70vh' }}>
                                    <pre className={`p-6 text-sm leading-relaxed whitespace-pre font-mono ${
                                        isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                    }`} style={{ 
                                        whiteSpace: 'pre',
                                        wordWrap: 'normal',
                                        overflowWrap: 'normal'
                                    }}>
                                        {jsonFormatExample}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div 
                            className={`px-8 py-6 border-t ${
                                isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                            }`}
                            data-aos="fade-up"
                            data-aos-delay="1000"
                        >
                            <div className="flex flex-wrap gap-6 text-sm">
                                {[
                                    { text: 'Valid JSON Format', color: 'green' },
                                    { text: 'Ready for Quick Upload', color: 'blue' },
                                    { text: 'Complete Example Included', color: 'purple' }
                                ].map((item, index) => (
                                    <div 
                                        key={item.text}
                                        className="flex items-center gap-2"
                                        data-aos="zoom-in"
                                        data-aos-delay={1100 + (index * 100)}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${
                                            item.color === 'green' 
                                                ? (isDarkMode ? 'bg-green-400' : 'bg-green-500')
                                                : item.color === 'blue'
                                                ? (isDarkMode ? 'bg-blue-400' : 'bg-blue-500')
                                                : (isDarkMode ? 'bg-purple-400' : 'bg-purple-500')
                                        }`}></div>
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}