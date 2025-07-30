let problem = require("../models/problem_schema")
let submission = require("../models/submission_schema")
let { language_number, submit_batch, submit_token } = require("../utils/problem_utlis");
const ContestProgress = require('../models/contestProgressSchema')
const {trackProblemAttempt}=require("./contest_fun")


const submit_the_code = async (req, res) => {
    try {

         
        const  user_id = req.real_user._id;
        const problem_id = req.params.id;
        const { language, code, contestId } = req.body; // Add contestId from request body

        console.log(code,problem_id)

        if (!user_id || !problem_id || !language || !code) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const submit_problem = await problem.findById(problem_id);
        if (!submit_problem) {
            return res.status(404).json({ success: false, message: "Problem not found." });
        }

        // --- CONTEST INTEGRATION: Track attempt if from contest ---
        if (contestId) {
            try {
                await trackProblemAttempt(user_id, contestId, problem_id);
            } catch (error) {
                console.error('Error tracking contest attempt:', error);
                // Continue with submission even if tracking fails
            }
        }

        // --- CHANGE 1: Combine both visible and hidden test cases ---
        const all_testcases = [
            ...submit_problem.visible_testcase,
            ...submit_problem.hidden_testcase
        ];

        // Create a pending submission record first
        // --- CHANGE 2: Use the combined length for the total count ---
        let submissionss = await submission.create({
            user_id,
            problem_id,
            code,
            language,
            status: "pending",
            total_testcase: all_testcases.length, // Use the total length of all test cases
            contest_id: contestId || null, // Store contest ID if provided
        });

        const language_num = language_number(language);

        // --- CHANGE 3: Create the Judge0 batch from the combined array ---
        const submission_batch = all_testcases.map((val) => ({
            source_code: code,
            language_id: language_num,
            stdin: val.input,
            expected_output: val.output,
        }));

        const testcase_tokens = await submit_batch(submission_batch);
        const token_array = testcase_tokens.map((val) => val.token);
        const final_result = await submit_token(token_array);

        // Process the results (this logic remains the same)
        let testcase_passed = 0;
        let totalRuntime = 0;
        let maxMemory = 0;
        let finalStatus = "accepted";
        let finalErrorMessage = null;

        for (const result of final_result) {
            if (result.status_id === 3) { // Accepted
                testcase_passed++;
                totalRuntime += parseFloat(result.time);
                maxMemory = Math.max(maxMemory, result.memory);
            } else {
                if (finalStatus === "accepted") {
                    finalStatus = result.status.description.replace(/ /g, '_').toLowerCase();
                    finalErrorMessage = result.stderr || result.compile_output || `Failed on a hidden test case.`;
                }
            }
        }

        // Update the submission record in the database
        submissionss.status = finalStatus;
        submissionss.testcase_passed = testcase_passed;
        submissionss.error_message = finalErrorMessage;
        submissionss.runtime = totalRuntime;
        submissionss.memory = maxMemory;
        await submissionss.save();

        // If accepted, update user's solved problems
        if (finalStatus === "accepted") {
            if (!req.real_user.problem_solved.includes(problem_id)) {
                req.real_user.problem_solved.push(problem_id);
                await req.real_user.save();
            }

            // --- CONTEST INTEGRATION: Track solve if from contest ---
            // if (contestId) {
            //     try {
            //         await trackProblemSolved(user_id, contestId, problem_id);
            //     } catch (error) {
            //         console.error('Error tracking contest solve:', error);
                    
            //     }
            // }
        }

        // Send a detailed response back to the frontend
        res.status(200).json({
            success: finalStatus === "accepted",
            status: finalStatus,
            runtime: totalRuntime,
            memory: maxMemory,
            errorMessage: finalErrorMessage,
            contestId: contestId || null,
            problemId: problem_id, // <--- THIS IS THE ONLY CHANGE YOU NEED
        });

    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({
            success: false,
            status: "server_error",
            errorMessage: "An internal server error occurred.",
        });
    }
};


let run_the_code = async (req, res) => {
    try {
        let user_id = req.real_user._id;
        let problem_id = req.params.id;
        let { language, code } = req.body;

        if (!user_id || !problem_id || !language || !code) {
            return res.status(400).send("Some fields are missing");
        }

        const submit_problem = await problem.findById(problem_id);
        if (!submit_problem) {
            return res.status(404).send("Problem not found");
        }

        let language_num = language_number(language);

        let submission_batch = submit_problem.visible_testcase.map((val) => ({
            source_code: code,
            language_id: language_num,
            stdin: val.input,
            expected_output: val.output
        }));

        let testcase_token = await submit_batch(submission_batch);
        let token_array = testcase_token.map((val) => val.token);
        let final_result = await submit_token(token_array);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let overallStatus = true; // Renamed from 'status' to avoid confusion
        let finalErrorMessage = null; // To hold the first error encountered

        for (const test of final_result) {
            if (test.status_id === 3) { // Accepted
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                // If this is the first error we've seen, capture its message
                if (overallStatus) { 
                    finalErrorMessage = test.stderr || test.compile_output || `Failed on test case with input: ${test.stdin}`;
                }
                overallStatus = false;
            }
        }

        // Send the structured response
        res.status(200).json({ // Use 200 for success, even if tests fail
            success: overallStatus,
            testCases: final_result,
            runtime,
            memory,
            errorMessage: finalErrorMessage // Include the error message
        });

    } catch (err) {
        // Ensure even server errors send back a structured response
        res.status(500).json({
            success: false,
            testCases: [],
            errorMessage: "Internal Server Error: " + err.message
        });
    }
}


module.exports = { submit_the_code, run_the_code };