// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router";
// import {
//     ArrowLeft, Plus, Trash2, Save, FileCode, Eye, Shield, CheckCircle, AlertCircle, Code, TestTube, Sparkles, BookOpen
// } from "lucide-react";
// import axios_client from "@/utils/axiosconfig";
// import MonacoEditor from '@monaco-editor/react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";

// // --- Custom Hook to detect application theme ---
// const useThemeDetector = () => {
//     // Function to get the current theme based on the 'dark' class on the html element
//     const getCurrentTheme = () =>
//         typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

//     const [theme, setTheme] = useState(getCurrentTheme());

//     useEffect(() => {
//         // Use a MutationObserver to watch for class changes on the root element
//         const observer = new MutationObserver(() => {
//             setTheme(getCurrentTheme());
//         });

//         // Start observing the document's root element for attribute changes
//         observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

//         // Cleanup the observer when the component unmounts
//         return () => observer.disconnect();
//     }, []);

//     return theme;
// };


// // --- Enhanced Reusable Components ---

// const CodeEditor = ({ code, setCode, language, theme }) => ( // Accept theme prop
//     <div className="relative group">
//         <div className="absolute top-3 right-3 z-10"><Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{language}</Badge></div>
//         <div className="rounded-lg overflow-hidden border shadow-inner dark:shadow-black/20 bg-card">
//             <MonacoEditor
//                 height="400px"
//                 language={language?.toLowerCase() || 'javascript'}
//                 // Dynamically set the theme based on the prop
//                 theme={theme === 'dark' ? 'vs-dark' : 'light'}
//                 value={code}
//                 onChange={(newValue) => setCode(newValue || "")}
//                 options={{
//                     fontSize: 14,
//                     wordWrap: 'on',
//                     scrollBeyondLastLine: false,
//                     minimap: { enabled: true },
//                     automaticLayout: true,
//                     tabSize: 2,
//                     insertSpaces: true,
//                     lineNumbers: 'on',
//                     renderLineHighlight: 'all',
//                     selectionHighlight: false,
//                     contextmenu: false,
//                     roundedSelection: false,
//                     scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
//                     semanticHighlighting: true
//                 }}
//             />
//         </div>
//     </div>
// );


// const VisibleTestCaseForm = ({ item, onChange }) => (
//     <Card className="border-info/20 bg-gradient-to-br from-info/5 to-transparent dark:from-info/10 dark:to-transparent">
//         <CardHeader className="pb-4"><CardTitle className="text-lg text-info flex items-center gap-2"><Eye className="w-5 h-5" />Test Case Details</CardTitle><CardDescription>This test case will be visible to users as an example</CardDescription></CardHeader>
//         <CardContent className="space-y-6">
//             <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><BookOpen className="w-4 h-4" />Explanation</Label><Textarea value={item.explanation} onChange={e => onChange({ ...item, explanation: e.target.value })} className="min-h-[100px] resize-y focus:ring-info/20" placeholder="Explain the logic and expected outcome..." /></div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><Code className="w-4 h-4" />Input</Label><Textarea value={item.input} onChange={e => onChange({ ...item, input: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-info/20" placeholder={`e.g.,\n[1, 2, 3]\n"hello"`} /></div>
//                 <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><TestTube className="w-4 h-4" />Expected Output</Label><Textarea value={item.output} onChange={e => onChange({ ...item, output: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-info/20" placeholder={`e.g.,\n6\n"olleh"`} /></div>
//             </div>
//         </CardContent>
//     </Card>
// );

// const HiddenTestCaseForm = ({ item, onChange }) => (
//     <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent dark:from-warning/10 dark:to-transparent">
//         <CardHeader className="pb-4"><CardTitle className="text-lg text-warning flex items-center gap-2"><Shield className="w-5 h-5" />Hidden Test Case</CardTitle><CardDescription>This test case will be used for validation but not shown to users</CardDescription></CardHeader>
//         <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><Code className="w-4 h-4" />Hidden Input</Label><Textarea value={item.input} onChange={e => onChange({ ...item, input: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-warning/20" placeholder={`e.g.,\n[10, 20, 30]\n"edge case"`} /></div>
//                 <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><TestTube className="w-4 h-4" />Expected Output</Label><Textarea value={item.output} onChange={e => onChange({ ...item, output: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-warning/20" placeholder={`e.g.,\n60\n"esac egde"`} /></div>
//             </div>
//         </CardContent>
//     </Card>
// );

// const CodeForm = ({ item, onChange, theme }) => { // Accept theme prop
//     const isSolution = 'complete_code' in item;
//     const codeFieldName = isSolution ? 'complete_code' : 'initial_code';
//     const codeLabel = isSolution ? 'Complete Solution Code' : 'Initial Starter Code';
//     const setCode = (newCode) => onChange({ ...item, [codeFieldName]: newCode });

//     return (
//         <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
//             <CardHeader className="pb-4"><CardTitle className="text-lg text-primary flex items-center gap-2"><FileCode className="w-5 h-5" />{codeLabel}</CardTitle><CardDescription>{isSolution ? 'The complete solution for this problem' : 'Starter code template for users'}</CardDescription></CardHeader>
//             <CardContent className="space-y-6">
//                 <div className="space-y-2"><Label className="text-base font-medium">Language</Label><Input type="text" value={item.language} onChange={e => onChange({ ...item, language: e.target.value })} placeholder="e.g., javascript" className="max-w-xs" /></div>
//                 <div className="space-y-2"><Label className="text-base font-medium">{codeLabel}</Label><CodeEditor code={item[codeFieldName]} setCode={setCode} language={item.language} theme={theme} /></div>
//             </CardContent>
//         </Card>
//     );
// };

// const SectionManager = ({ title, field, data, setData, Component, icon: Icon, description }) => {
//     const handleUpdate = (index, updatedItem) => {
//         const newData = [...data];
//         newData[index] = updatedItem;
//         setData(field, newData);
//     };

//     const handleAdd = () => {
//         const defaultItem = field.includes('code')
//             ? { language: 'javascript', [field === 'start_code' ? 'initial_code' : 'complete_code']: `` }
//             : field.includes('hidden')
//                 ? { input: '', output: '' }
//                 : { input: '', output: '', explanation: '' };
//         setData(field, [...data, defaultItem]);
//     };

//     const handleRemove = (index) => setData(field, data.filter((_, i) => i !== index));

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between"><div className="space-y-1"><h3 className="text-2xl font-bold flex items-center gap-2"><Icon className="w-6 h-6 text-primary" />{title}</h3><p className="text-muted-foreground">{description}</p></div><Button type="button" onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-soft"><Plus className="w-4 h-4 mr-2" />Add New</Button></div>
//             <div className="space-y-4">
//                 {data?.map((item, index) => (
//                     <div key={index} className="relative group">
//                         <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="destructive" size="sm" onClick={() => handleRemove(index)} className="h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button></div>
//                         <Component item={item} index={index} onChange={(updatedItem) => handleUpdate(index, updatedItem)} />
//                     </div>
//                 ))}
//                 {data?.length === 0 && <Card className="border-dashed border-2 border-muted-foreground/20"><CardContent className="py-12 text-center"><Icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" /><h4 className="text-lg font-semibold text-muted-foreground">No {title.toLowerCase()} yet</h4><p className="text-sm text-muted-foreground mt-2">Click "Add New" to create your first one</p></CardContent></Card>}
//             </div>
//         </div>
//     );
// };


// // --- Main Component ---
// const EditProblemPage = () => {
//     const { problemId } = useParams();
//     const navigate = useNavigate();
//     const [problemData, setProblemData] = useState(null);
//     const [isLoading, setLoading] = useState(true);
//     const [isSubmitting, setSubmitting] = useState(false);
//     const [error, setError] = useState(null);
//     const [activeTab, setActiveTab] = useState('visible_testcase');
//     const [isDirty, setIsDirty] = useState(false);
//     const [saveStatus, setSaveStatus] = useState('idle');
//     const [notification, setNotification] = useState({ message: '', type: 'idle' });
    
//     // Get the current theme ('light' or 'dark') from our custom hook
//     const editorTheme = useThemeDetector();

//     // Fetch data effect
//     useEffect(() => {
//         if (!problemId) { setError("No problem ID provided."); setLoading(false); return; }
//         const fetchProblem = async () => {
//             try {
//                 const response = await axios_client.get(`/problem/getParticularProblem?by=id&value=${problemId}`);
//                 setProblemData(response.data.problem);
//             } catch (err) { setError(err.message || 'Failed to fetch problem details.'); }
//             finally { setLoading(false); }
//         };
//         fetchProblem();
//     }, [problemId]);

//     // Effect to auto-hide the notification
//     useEffect(() => {
//         if (notification.message) {
//             const timer = setTimeout(() => {
//                 setNotification({ message: '', type: 'idle' });
//             }, 4000);
//             return () => clearTimeout(timer);
//         }
//     }, [notification]);

//     const handleStateChange = (field, value) => {
//         setProblemData((prev) => ({ ...prev, [field]: value }));
//         if (!isDirty) setIsDirty(true);
//         setSaveStatus('idle');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSubmitting(true);
//         setSaveStatus('saving');
//         setError(null);
//         try {
//             await axios_client.put(`/problem/update?by=id&value=${problemId}`, problemData);
//             setSaveStatus('saved');
//             setIsDirty(false);
//             setNotification({ message: "Problem updated successfully!", type: 'success' });
//             setTimeout(() => setSaveStatus('idle'), 3000);
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || "An error occurred while saving.";
//             setError(errorMessage);
//             setSaveStatus('error');
//             setNotification({ message: errorMessage, type: 'error' });
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-background flex items-center justify-center">
//                 <div className="text-center space-y-4">
//                     <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
//                     <p className="text-muted-foreground">Loading problem details...</p>
//                 </div>
//             </div>
//         );
//     }
//     if (error && !problemData) {
//         return (
//             <div className="min-h-screen bg-background flex items-center justify-center p-4">
//                 <Card className="max-w-md w-full border-destructive/20 bg-card">
//                     <CardContent className="pt-6 text-center">
//                         <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
//                         <h3 className="text-lg font-semibold mb-2">Error Loading Problem</h3>
//                         <p className="text-muted-foreground mb-4">{error}</p>
//                         <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
//                     </CardContent>
//                 </Card>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-background transition-colors">
//             <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
//                 <form onSubmit={handleSubmit} className="space-y-8">
//                     {}
//                     <Card className="bg-card border shadow-sm">
//                         <CardHeader className="p-6">
//                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                                 <div className="flex items-start gap-4">
//                                     <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md">
//                                         <Sparkles className="w-6 h-6 text-primary-foreground" />
//                                     </div>
//                                     <div>
//                                         <h1 className="text-2xl font-bold text-card-foreground">Edit Problem</h1>
//                                         <p className="text-sm text-muted-foreground mt-1">#{problemData?.serial_number} – {problemData?.title}</p>
//                                     </div>
//                                 </div>
//                                 <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
//                             </div>
//                             {error && saveStatus === "error" && (
//                                 <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
//                                     <p className="text-sm text-destructive">{error}</p>
//                                 </div>
//                             )}
//                         </CardHeader>
//                     </Card>

//                     {}
//                     <Card className="bg-card border shadow-sm">
//                         <CardHeader><CardTitle className="flex items-center gap-3"><BookOpen className="w-6 h-6 text-primary" />Core Information</CardTitle><CardDescription>Basic details and description of the problem</CardDescription></CardHeader>
//                         <CardContent className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Title</Label><Input value={problemData?.title || ''} onChange={(e) => handleStateChange('title', e.target.value)} placeholder="Enter problem title" required /></div><div className="space-y-2"><Label>Tags</Label><Input value={problemData?.tags || ''} onChange={(e) => handleStateChange('tags', e.target.value)} placeholder="array, sorting, dynamic-programming" required /></div></div>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Serial Number</Label><Input type="number" value={problemData?.serial_number || ''} onChange={(e) => handleStateChange('serial_number', parseInt(e.target.value || '0'))} placeholder="1001" required /></div><div className="space-y-2"><Label>Difficulty</Label><Select value={problemData?.difficulty || ''} onValueChange={(value) => handleStateChange('difficulty', value)}><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select></div></div>
//                             <div className="space-y-2"><Label>Description</Label><Textarea value={problemData?.description || ''} onChange={(e) => handleStateChange('description', e.target.value)} placeholder="Describe the problem in detail..." className="min-h-[180px] resize-y" required /></div>
//                         </CardContent>
//                     </Card>

//                     {}
//                     <Card className="bg-card border shadow-sm overflow-hidden">
//                         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                             <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto rounded-none">
//                                 <TabsTrigger value="visible_testcase" className="py-3 gap-2 data-[state=active]:bg-muted"><Eye className="w-4 h-4" />Visible Tests</TabsTrigger>
//                                 <TabsTrigger value="hidden_testcase" className="py-3 gap-2 data-[state=active]:bg-muted"><Shield className="w-4 h-4" />Hidden Tests</TabsTrigger>
//                                 <TabsTrigger value="start_code" className="py-3 gap-2 data-[state=active]:bg-muted"><FileCode className="w-4 h-4" />Starter Code</TabsTrigger>
//                                 <TabsTrigger value="problem_solution" className="py-3 gap-2 data-[state=active]:bg-muted"><CheckCircle className="w-4 h-4" />Solutions</TabsTrigger>
//                             </TabsList>
//                             <div className="p-6">
//                                 <TabsContent value="visible_testcase" className="mt-0"><SectionManager title="Visible Test Cases" field="visible_testcase" data={problemData?.visible_testcase || []} setData={handleStateChange} Component={VisibleTestCaseForm} icon={Eye} description="Test cases that users can see as examples" /></TabsContent>
//                                 <TabsContent value="hidden_testcase" className="mt-0"><SectionManager title="Hidden Test Cases" field="hidden_testcase" data={problemData?.hidden_testcase || []} setData={handleStateChange} Component={HiddenTestCaseForm} icon={Shield} description="Test cases used for validation but not shown to users" /></TabsContent>
//                                 <TabsContent value="start_code" className="mt-0">
//                                     <SectionManager
//                                         title="Starter Code"
//                                         field="start_code"
//                                         data={problemData?.start_code || []}
//                                         setData={handleStateChange}
//                                         // Use a render prop to pass the theme to the CodeForm component
//                                         Component={(props) => <CodeForm {...props} theme={editorTheme} />}
//                                         icon={FileCode}
//                                         description="Initial code templates for different programming languages"
//                                     />
//                                 </TabsContent>
//                                 <TabsContent value="problem_solution" className="mt-0">
//                                      <SectionManager
//                                         title="Solution Code"
//                                         field="problem_solution"
//                                         data={problemData?.problem_solution || []}
//                                         setData={handleStateChange}
//                                         // Also pass the theme here
//                                         Component={(props) => <CodeForm {...props} theme={editorTheme} />}
//                                         icon={CheckCircle}
//                                         description="Complete solutions for the problem in different languages"
//                                     />
//                                 </TabsContent>
//                             </div>
//                         </Tabs>
//                     </Card>

//                     {}
//                     <div className={`fixed bottom-8 right-8 transition-all duration-500 z-50 ${isDirty ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
//                         <Button type="submit" size="lg" disabled={isSubmitting} className={`shadow-lg transition-all duration-300 ${saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : saveStatus === 'error' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}>
//                             {isSubmitting && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />}
//                             {saveStatus === 'saved' && <CheckCircle className="w-4 h-4 mr-2" />}
//                             {saveStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
//                             {saveStatus === 'idle' && <Save className="w-4 h-4 mr-2" />}
//                             {isSubmitting ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Try Again' : 'Save Changes'}
//                         </Button>
//                     </div>
//                 </form>

//                 {}
//                 <div className="toast toast-center bottom-24 right-8 z-50">
//                     <div className={`transition-all duration-300 ${notification.message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
//                         {notification.message && (
//                              <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg flex items-center`}>
//                                 {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
//                                 <span>{notification.message}</span>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditProblemPage;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
    ArrowLeft, Plus, Trash2, Save, FileCode, Eye, Shield, CheckCircle, AlertCircle, Code, TestTube, Sparkles, BookOpen
} from "lucide-react";
import axios_client from "@/utils/axiosconfig";
import MonacoEditor from '@monaco-editor/react';

// --- AOS (Animate On Scroll) Imports ---
import AOS from 'aos';
import 'aos/dist/aos.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Custom Hook to detect application theme
const useThemeDetector = () => {
    const getCurrentTheme = () =>
        typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    const [theme, setTheme] = useState(getCurrentTheme());

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(getCurrentTheme());
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return theme;
};


// --- Enhanced Reusable Components with AOS ---

const CodeEditor = ({ code, setCode, language, theme }) => (
    <div className="relative group">
        <div className="absolute top-3 right-3 z-10"><Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{language}</Badge></div>
        <div className="rounded-lg overflow-hidden border shadow-inner dark:shadow-black/20 bg-card">
            <MonacoEditor
                height="400px"
                language={language?.toLowerCase() || 'javascript'}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(newValue) => setCode(newValue || "")}
                options={{ fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false, minimap: { enabled: true }, automaticLayout: true, tabSize: 2, insertSpaces: true, lineNumbers: 'on', renderLineHighlight: 'all', selectionHighlight: false, contextmenu: false, roundedSelection: false, scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 }, semanticHighlighting: true }}
            />
        </div>
    </div>
);


const VisibleTestCaseForm = ({ item, onChange }) => (
    <Card className="border-info/20 bg-gradient-to-br from-info/5 to-transparent dark:from-info/10 dark:to-transparent">
        <CardHeader className="pb-4"><CardTitle className="text-lg text-info flex items-center gap-2"><Eye className="w-5 h-5" />Test Case Details</CardTitle><CardDescription>This test case will be visible to users as an example</CardDescription></CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><BookOpen className="w-4 h-4" />Explanation</Label><Textarea value={item.explanation} onChange={e => onChange({ ...item, explanation: e.target.value })} className="min-h-[100px] resize-y focus:ring-info/20" placeholder="Explain the logic and expected outcome..." /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><Code className="w-4 h-4" />Input</Label><Textarea value={item.input} onChange={e => onChange({ ...item, input: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-info/20" placeholder={`e.g.,\n[1, 2, 3]\n"hello"`} /></div>
                <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><TestTube className="w-4 h-4" />Expected Output</Label><Textarea value={item.output} onChange={e => onChange({ ...item, output: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-info/20" placeholder={`e.g.,\n6\n"olleh"`} /></div>
            </div>
        </CardContent>
    </Card>
);

const HiddenTestCaseForm = ({ item, onChange }) => (
    <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent dark:from-warning/10 dark:to-transparent">
        <CardHeader className="pb-4"><CardTitle className="text-lg text-warning flex items-center gap-2"><Shield className="w-5 h-5" />Hidden Test Case</CardTitle><CardDescription>This test case will be used for validation but not shown to users</CardDescription></CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><Code className="w-4 h-4" />Hidden Input</Label><Textarea value={item.input} onChange={e => onChange({ ...item, input: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-warning/20" placeholder={`e.g.,\n[10, 20, 30]\n"edge case"`} /></div>
                <div className="space-y-2"><Label className="text-base font-medium flex items-center gap-2"><TestTube className="w-4 h-4" />Expected Output</Label><Textarea value={item.output} onChange={e => onChange({ ...item, output: e.target.value })} className="font-mono text-sm min-h-[120px] resize-y focus:ring-warning/20" placeholder={`e.g.,\n60\n"esac egde"`} /></div>
            </div>
        </CardContent>
    </Card>
);

const CodeForm = ({ item, onChange, theme }) => {
    const isSolution = 'complete_code' in item;
    const codeFieldName = isSolution ? 'complete_code' : 'initial_code';
    const codeLabel = isSolution ? 'Complete Solution Code' : 'Initial Starter Code';
    const setCode = (newCode) => onChange({ ...item, [codeFieldName]: newCode });

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
            <CardHeader className="pb-4"><CardTitle className="text-lg text-primary flex items-center gap-2"><FileCode className="w-5 h-5" />{codeLabel}</CardTitle><CardDescription>{isSolution ? 'The complete solution for this problem' : 'Starter code template for users'}</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2"><Label className="text-base font-medium">Language</Label><Input type="text" value={item.language} onChange={e => onChange({ ...item, language: e.target.value })} placeholder="e.g., javascript" className="max-w-xs" /></div>
                <div className="space-y-2"><Label className="text-base font-medium">{codeLabel}</Label><CodeEditor code={item[codeFieldName]} setCode={setCode} language={item.language} theme={theme} /></div>
            </CardContent>
        </Card>
    );
};

const SectionManager = ({ title, field, data, setData, Component, icon: Icon, description, theme }) => {
    const handleUpdate = (index, updatedItem) => {
        const newData = [...data];
        newData[index] = updatedItem;
        setData(field, newData);
    };

    const handleAdd = () => {
        const defaultItem = field.includes('code')
            ? { language: 'javascript', [field === 'start_code' ? 'initial_code' : 'complete_code']: `` }
            : field.includes('hidden')
                ? { input: '', output: '' }
                : { input: '', output: '', explanation: '' };
        setData(field, [...data, defaultItem]);
    };

    const handleRemove = (index) => setData(field, data.filter((_, i) => i !== index));

    // Custom Component renderer for passing the theme prop if needed
    const renderComponent = (props) => {
        // Check if the component is CodeForm to pass the theme
        if (Component === CodeForm) {
            return <CodeForm {...props} theme={theme} />;
        }
        return <Component {...props} />;
    };

    return (
        <div className="space-y-6">
            <div data-aos="fade-in" className="flex items-center justify-between"><div className="space-y-1"><h3 className="text-2xl font-bold flex items-center gap-2"><Icon className="w-6 h-6 text-primary" />{title}</h3><p className="text-muted-foreground">{description}</p></div><Button type="button" onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-soft"><Plus className="w-4 h-4 mr-2" />Add New</Button></div>
            <div className="space-y-4">
                {data?.map((item, index) => (
                    <div key={index} data-aos="zoom-in-up" data-aos-delay={index * 100} className="relative group">
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="destructive" size="sm" onClick={() => handleRemove(index)} className="h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button></div>
                        {renderComponent({ item, index, onChange: (updatedItem) => handleUpdate(index, updatedItem) })}
                    </div>
                ))}
                {data?.length === 0 && <Card data-aos="fade-in" className="border-dashed border-2 border-muted-foreground/20"><CardContent className="py-12 text-center"><Icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" /><h4 className="text-lg font-semibold text-muted-foreground">No {title.toLowerCase()} yet</h4><p className="text-sm text-muted-foreground mt-2">Click "Add New" to create your first one</p></CardContent></Card>}
            </div>
        </div>
    );
};


// --- Main Component ---
const EditProblemPage = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [problemData, setProblemData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('visible_testcase');
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [notification, setNotification] = useState({ message: '', type: 'idle' });
    
    const editorTheme = useThemeDetector();

    // --- Initialize AOS on component mount ---
    useEffect(() => {
        AOS.init({
            duration: 800,      // Animation duration in ms
            once: false,         // Animate elements only once
            easing: 'ease-out-cubic', // Smooth easing function
        });
    }, []);

    // Fetch data effect
    useEffect(() => {
        if (!problemId) { setError("No problem ID provided."); setLoading(false); return; }
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const response = await axios_client.get(`/problem/getParticularProblem?by=id&value=${problemId}`);
                setProblemData(response.data.problem);
            } catch (err) { setError(err.message || 'Failed to fetch problem details.'); }
            finally { setLoading(false); }
        };
        fetchProblem();
    }, [problemId]);

    // ... (rest of the hooks and handlers remain the same) ...
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: 'idle' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleStateChange = (field, value) => {
        setProblemData((prev) => ({ ...prev, [field]: value }));
        if (!isDirty) setIsDirty(true);
        setSaveStatus('idle');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSaveStatus('saving');
        setError(null);
        try {
            await axios_client.put(`/problem/update?by=id&value=${problemId}`, problemData);
            setSaveStatus('saved');
            setIsDirty(false);
            setNotification({ message: "Problem updated successfully!", type: 'success' });
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An error occurred while saving.";
            setError(errorMessage);
            setSaveStatus('error');
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };


    if (isLoading) {  }
    if (error && !problemData) {  }
    
    // (Return JSX remains largely the same, but with `data-aos` attributes added)

    return (
        <div className="min-h-screen bg-background transition-colors">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {}
                    <Card data-aos="fade-down" className="bg-card border shadow-sm">
                        <CardHeader className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md"><Sparkles className="w-6 h-6 text-primary-foreground" /></div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-card-foreground">Edit Problem</h1>
                                        <p className="text-sm text-muted-foreground mt-1">#{problemData?.serial_number} – {problemData?.title}</p>
                                    </div>
                                </div>
                                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
                            </div>
                             {error && saveStatus === "error" && (<div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"><p className="text-sm text-destructive">{error}</p></div>)}
                        </CardHeader>
                    </Card>

                    {}
                    <Card data-aos="fade-up" className="bg-card border shadow-sm">
                        <CardHeader><CardTitle className="flex items-center gap-3"><BookOpen className="w-6 h-6 text-primary" />Core Information</CardTitle><CardDescription>Basic details and description of the problem</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Title</Label><Input value={problemData?.title || ''} onChange={(e) => handleStateChange('title', e.target.value)} placeholder="Enter problem title" required /></div><div className="space-y-2"><Label>Tags</Label><Input value={problemData?.tags || ''} onChange={(e) => handleStateChange('tags', e.target.value)} placeholder="array, sorting, dynamic-programming" required /></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-2"><Label>Serial Number</Label><Input type="number" value={problemData?.serial_number || ''} onChange={(e) => handleStateChange('serial_number', parseInt(e.target.value || '0'))} placeholder="1001" required /></div><div className="space-y-2"><Label>Difficulty</Label><Select value={problemData?.difficulty || ''} onValueChange={(value) => handleStateChange('difficulty', value)}><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select></div></div>
                            <div className="space-y-2"><Label>Description</Label><Textarea value={problemData?.description || ''} onChange={(e) => handleStateChange('description', e.target.value)} placeholder="Describe the problem in detail..." className="min-h-[180px] resize-y" required /></div>
                        </CardContent>
                    </Card>

                    {}
                    <Card data-aos="fade-up" data-aos-delay="200" className="bg-card border shadow-sm overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto rounded-none">
                                <TabsTrigger value="visible_testcase" className="py-3 gap-2 data-[state=active]:bg-muted"><Eye className="w-4 h-4" />Visible Tests</TabsTrigger>
                                <TabsTrigger value="hidden_testcase" className="py-3 gap-2 data-[state=active]:bg-muted"><Shield className="w-4 h-4" />Hidden Tests</TabsTrigger>
                                <TabsTrigger value="start_code" className="py-3 gap-2 data-[state=active]:bg-muted"><FileCode className="w-4 h-4" />Starter Code</TabsTrigger>
                                <TabsTrigger value="problem_solution" className="py-3 gap-2 data-[state=active]:bg-muted"><CheckCircle className="w-4 h-4" />Solutions</TabsTrigger>
                            </TabsList>
                             <div className="p-6">
                                <TabsContent value="visible_testcase" className="mt-0"><SectionManager title="Visible Test Cases" field="visible_testcase" data={problemData?.visible_testcase || []} setData={handleStateChange} Component={VisibleTestCaseForm} icon={Eye} description="Test cases that users can see as examples" /></TabsContent>
                                <TabsContent value="hidden_testcase" className="mt-0"><SectionManager title="Hidden Test Cases" field="hidden_testcase" data={problemData?.hidden_testcase || []} setData={handleStateChange} Component={HiddenTestCaseForm} icon={Shield} description="Test cases used for validation but not shown to users" /></TabsContent>
                                <TabsContent value="start_code" className="mt-0"><SectionManager title="Starter Code" field="start_code" data={problemData?.start_code || []} setData={handleStateChange} Component={CodeForm} icon={FileCode} description="Initial code templates for different programming languages" theme={editorTheme} /></TabsContent>
                                <TabsContent value="problem_solution" className="mt-0"><SectionManager title="Solution Code" field="problem_solution" data={problemData?.problem_solution || []} setData={handleStateChange} Component={CodeForm} icon={CheckCircle} description="Complete solutions for the problem in different languages" theme={editorTheme} /></TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                         <div className={`fixed bottom-8 right-8 transition-all duration-500 z-50 ${isDirty ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                         <Button type="submit" size="lg" disabled={isSubmitting} className={`shadow-lg transition-all duration-300 ${saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : saveStatus === 'error' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}>
                             {isSubmitting && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />}
                             {saveStatus === 'saved' && <CheckCircle className="w-4 h-4 mr-2" />}
                             {saveStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                             {saveStatus === 'idle' && <Save className="w-4 h-4 mr-2" />}
                             {isSubmitting ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Try Again' : 'Save Changes'}
                         </Button>
                    </div>
                </form>

                 {}
                 <div className="toast toast-center bottom-24 right-8 z-50">
                     <div className={`transition-all duration-300 ${notification.message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                        {notification.message && (
                             <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg flex items-center`}>
                                {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span>{notification.message}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
                
            </div>
        
    );
};

export default EditProblemPage;