let problem = require("../models/problem_schema");
let user = require("../models/user")
let submission = require("../models/submission_schema")
const { GoogleGenAI } = require("@google/genai");
let { language_number, submit_batch, submit_token } = require("../utils/problem_utlis");
const SolutionVideo = require("../models/solutionVideo")


let create_problem = async (req, res) => {
    try {
        let { title, difficulty, description, tags, visible_testcase, hidden_testcase, start_code, problem_solution, problem_created_by } = req.body;



        for (const { language, complete_code } of problem_solution) {
            let language_num = language_number(language);


            let submissions = visible_testcase.map((val) => ({
                source_code: complete_code,
                language_id: language_num,
                stdin: val.input,
                expected_output: val.output
            }))



            const testcase_token = await submit_batch(submissions);
          

            let token_array = testcase_token.map((val) => val.token);

            const final_result = await submit_token(token_array);


            for (const result of final_result) {

            

                if (result.status_id != 3) {
                  
                    return res.status(400).json({
                        message: "some of testcase is falied ..please check your code and try again "
                    });
                }
            }





        }

        problem.create({
            ...req.body,
            problem_created_by: req.real_user._id
        })

        res.status(201).json({
            message: "problem is created successfully"
        })
    }
    catch (err) {
        res.status(400).json({
            message: `Error: ${err.message}`
        })
    }


}

let update_problem = async (req, res) => {

    let { by, value } = req.query;

    let update_by = undefined;

    if (by === "id") {
        update_by = { _id: value };

    }
    else if (by === "name") {
        update_by = { title: value };
    }
    else if (by === "serial") {
        update_by = { serial_number: value };
    }
    else {
        return res.status(400).send("invalid by value ...use id,name or serial")
    }


    let { serial_number, title, difficulty, description, tags, visible_testcase, hidden_testcase, start_code, problem_solution, problem_created_by } = req.body;

    try {
        for (const { language, complete_code } of problem_solution) {
            let language_num = language_number(language);


            let submissions = visible_testcase.map((val) => ({

                source_code: complete_code,
                language_id: language_num,
                stdin: val.input,
                expected_output: val.output
            }))



            const testcase_token = await submit_batch(submissions);
       

            let token_array = testcase_token.map((val) => val.token);

            const final_result = await submit_token(token_array);

            for (const result of final_result) {
              
                if (result.status_id != 3) {
                    return res.status(400).send("some of testcase is falied ..please check your code and try again ");
                }
            }
        }

     
        let updated_problem = await problem.findOneAndUpdate(update_by, { ...req.body }, { runValidators: true, new: true })
        if (!update_problem) {
            return res.status(404).send("problem is not found in database please check your name,id or serial")
        }

        res.status(200).send(updated_problem);

    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }


}

let delete_problem = async (req, res) => {
    let { by, value } = req.query;

    let delete_by = undefined;

    if (by === "id") {
        delete_by = { _id: value };
    }
    else if (by === "name") {
        delete_by = { title: value };
    }
    else if (by === "serial") {
        delete_by = { serial_number: value };
    }
    else {
        return res.status(400).send("invalid by value ...use id,name or serial")
    }

    try {
        let deleted_problem = await problem.findOneAndDelete(delete_by);
        if (!deleted_problem) {
            return res.status(404).send("problem is not found in database please check your name,id or serial")
        }


        res.status(200).send("problem deleted successfully")
    }
    catch (err) {

        res.status(500).send("Error: " + err);
    }
}

const get_problem = async (req, res) => {


    let { by, value } = req.query;

    let get_by = undefined;

    if (by === "id") {
        get_by = { _id: value };
    }
    else if (by === "name") {
        get_by = { title: value };
    }
    else if (by === "serial") {
        get_by = { serial_number: value };
    }
    else {
        return res.status(400).send("invalid by value ...use id,name or serial")
    }

    try {


        const getProblem = await problem.findOne(get_by).select(" -problem_created_by");

        if (!getProblem)
            return res.status(404).send("Problem is Missing");

        const videos = await SolutionVideo.findOne({ problemId: getProblem._id })

        if (videos) {
            const responseData = {
                ...getProblem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration,
            }

            res.status(200).json({
                problem: responseData
            });

        }
        else {

            res.status(200).json({
                problem: getProblem
            });
        }


    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const get_all_problem = async (req, res) => {

    try {

        const getProblem = await problem.find({}).select("_id title difficulty serial_number tags ");

        if (getProblem.length == 0)
            return res.status(404).send("Problem is Missing");


        res.status(200).json({
            problem: getProblem
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const problem_solved_by_user = async (req, res) => {
    try {
        let user_id = req.real_user._id;

        let real_user = await user.findById(user_id).populate({
            path: "problem_solved",
            select: "_id title difficulty tags"
        })
        res.status(200).send(real_user.problem_solved);
    }
    catch (err) {
        res.status(500).send("internal server error ->" + err.message)
    }
}


const all_submissions = async (req, res) => {
    try {

        const userId = req.real_user._id;


        const submissions = await submission.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "problem_id",
                select: "title difficulty"
            })
            .select("status createdAt problem_id language ");
      
        const formatted = submissions.map((s) => ({
            problem_name: s.problem_id?.title || "Unknown",
            problem_difficulty: s.problem_id?.difficulty,
            problem_id: s.problem_id._id,
            status: s.status,
            date: s.createdAt,
            language:s.language
        }));

   

        res.status(201).json({
            success: true,
            submissions: formatted
        });


    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



const submission_of_problem = async (req, res) => {
    try {
        const problem_id = req.params.pid;
        const user_id = req.real_user._id;

        // Fetch all submissions for the given user and problem, sorted by the most recent first.
        const all_submissions = await submission.find({ user_id, problem_id }).sort({ createdAt: -1 });

        if (all_submissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Submissions Yet",
                submissions: []
            });
        }

        // Map over the submissions to create a more structured and frontend-friendly response.
        const detailed_submissions = all_submissions.map(sub => ({
            submission_id: sub._id,
            language: sub.language,
            code: sub.code, // You might want to omit the full code for brevity in a list view
            status: sub.status,
            testcases_passed: `${sub.testcase_passed}/${sub.total_testcase}`,
            runtime: `${sub.runtime.toFixed(4)}s`, // Format runtime to a fixed number of decimal places
            memory: `${sub.memory} KB`, // Add units for clarity
            submitted_at: sub.createdAt, // Include the submission timestamp
            error_message: sub.error_message,
        }));

        res.status(200).json({
            success: true,
            submissions: detailed_submissions
        });

    } catch (err) {
        console.error("Error fetching submissions:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message // Provide a more specific error message in development
        });
    }
};


const ai_chat = async (req, res) => {
    try {

        const { messages, title, description, testCases, startCode } = req.body;

        

        const ai = new GoogleGenAI({ apiKey: process.env.gemini_key_1 });
       

        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: messages,
                config: {
                    systemInstruction: `
✅ CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}

[PROBLEM_DESCRIPTION]: ${description}

[EXAMPLES]: ${testCases}

[Starter Code]: ${startCode}

💡 YOUR CAPABILITIES:
Hint Provider: Offer incremental, thought-provoking hints that guide users step-by-step toward the solution.

Code Reviewer: Debug, improve, and explain submitted code while encouraging best practices.

Solution Guide: Deliver clean, optimal solutions with thorough algorithmic reasoning (only when explicitly requested).

Approach Suggester: Present and compare different algorithmic strategies (e.g., brute force vs. optimized).

Test Case Generator: Help build edge case tests to validate user logic.

Complexity Analyst: (Subscription only) — Inform users that time/space complexity analysis requires Subscription

📚 INTERACTION GUIDELINES:
📌 If the user asks for HINTS:
Do NOT give full code.

Break the problem into smaller logical steps.

Ask guiding questions to spark algorithmic thinking.

Suggest helpful data structures or patterns (e.g., sorting, binary search, hash map, etc.).

📌 If the user shares their CODE:
Review for bugs, logic flaws, or inefficiencies.

Explain problems clearly with annotated feedback.

Offer clean and corrected snippets only where needed.

Encourage improved readability and style.

📌 If the user asks for the OPTIMAL SOLUTION:
First explain the core algorithm and why it’s efficient.

Then share clean, well-commented code.

Add intuitive explanation of how the algorithm works step-by-step.

⚠️ NOTE: If the user asks for time and space complexity analysis, politely inform them:
"To access complexity analysis and trade-offs, you’ll need to buy Subscription"

📌 If the user requests ALTERNATIVE APPROACHES:
List multiple ways to solve the problem.

Explain when and why to choose each approach.

Mention trade-offs and limitations.

✍️ RESPONSE FORMAT:
Use clear, simple explanations

Format code in proper blocks with syntax highlighting

Use real examples where possible

Keep responses structured and easy to follow

Always relate answers to the current problem only

🚫 STRICT LIMITATIONS:
❌ Do NOT help with unrelated topics (e.g., web dev, UI, databases)

❌ Do NOT solve different problems than the one currently being discussed

❌ Do NOT reveal full solutions unless explicitly asked

If asked about non-DSA topics, reply:
"I can only assist with the current DSA problem. Let me know what part of this problem you'd like help with."

🧠 TEACHING PHILOSOPHY:
Promote problem-solving intuition, not just memorization

Encourage learning by doing

Help users understand the "why", not just the "how"

Instill confidence and clarity in solving DSA problems

Focus on growth through consistent practice and guided logic
`},
            });

            res.status(201).json({
                message: response.text
            });

        }

        main();

    }
    catch (err) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

const potd = async (req, res) => {
    try {

     
        const getProblem = await problem.findOne({ isProblemOfTheDay: true });

        if (!getProblem)
            return res.status(404).send("Problem is Missing");


        res.status(200).json({
            problem: getProblem
        });
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}



module.exports = { create_problem, update_problem, delete_problem, get_all_problem, get_problem, problem_solved_by_user, submission_of_problem, ai_chat, potd, all_submissions };