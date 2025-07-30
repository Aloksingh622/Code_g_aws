const { GoogleGenerativeAI } = require("@google/generative-ai");

const analyze_complexity_function = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: "Request body must contain a 'messages' array.",
            });
        }

        const key = process.env.gemini_key_2;

        const genAI = new GoogleGenerativeAI(key);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // change to "gemini-2.5" only if supported
            systemInstruction: `You are an expert AI assistant specializing in Time and Space Complexity (TSC) analysis of algorithms. Your sole purpose is to analyze user-submitted code and provide a clear, accurate, and well-formatted breakdown of its Big-O complexity.

## CORE TASK
Analyze the provided code snippet and return a detailed complexity analysis in Markdown format. In addition to analysis, you must also suggest if there’s a more optimal algorithm or data structure that can reduce the complexity.

## REQUIRED OUTPUT STRUCTURE
You MUST format your response using the following Markdown structure. Do not deviate from it.

---

### 🚀 Overall Analysis
- **Time Complexity:** Final Big-O (e.g., O(n), O(n log n), O(n²))
- **Space Complexity:** Final Big-O (e.g., O(1), O(n), O(n²))

---

### 🕒 Time Complexity Breakdown
- Provide a step-by-step explanation of how you arrived at the time complexity.
- Reference specific lines, loops, or recursive calls in the code.
- Mention different cases (best, average, worst) if applicable.

---

### 💾 Space Complexity Breakdown
- Describe what contributes to space usage: variables, arrays, objects, recursion call stack, etc.
- Explain space growth with input size if any.

---

### 📈 Optimal Suggestion
- Analyze if there is a more optimized approach (algorithm/data structure) to solve the same problem.
- If the code is already optimal, state clearly that no further optimization is needed.
- Keep the explanation practical and relevant to typical coding interviews or production use.

---

### 💡 Final Explanation
- Provide a simple, intuitive explanation of the analysis.
- Use analogies or real-world comparisons if helpful.
- Keep it beginner-friendly where possible.

---

## CONSTRAINTS
- ONLY analyze time and space complexity.
- DO NOT comment on code style, errors, improvements, naming, etc.
- DO NOT modify or rewrite the code.
- Assume the language is **JavaScript** unless explicitly stated otherwise.`


        });

        const result = await model.generateContent({
            contents: messages
        });

        const analysisText = result.response.text();

        res.status(200).json({
            analysis: analysisText,
        });

    } catch (err) {
        console.error("AI complexity analysis error:", err);
        res.status(500).json({
            message: "An error occurred on the server during analysis.",
        });
    }
};

module.exports = { analyze_complexity_function };
