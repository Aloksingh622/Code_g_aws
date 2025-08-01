let problem = require("../models/problem_schema")
let submission = require("../models/submission_schema")
let { language_number, submit_batch, submit_token } = require("../utils/problem_utlis");
const ContestProgress = require('../models/contestProgressSchema')
const {trackProblemAttempt}=require("./contest_fun")


const submit_the_code = async (req, res) => {
    try {
        const user_id = req.real_user._id;
        const problem_id = req.params.id;
        const { language, code, contestId } = req.body;

        if (!user_id || !problem_id || !language || !code) {
            return res.status(400).json({
                success: false,
                status: "bad_request",
                errorMessage: "Missing required fields.",
            });
        }

        const submit_problem = await problem.findById(problem_id);
        if (!submit_problem) {
            return res.status(404).json({
                success: false,
                status: "not_found",
                errorMessage: "Problem not found.",
            });
        }

        // --- CONTEST ATTEMPT TRACKING ---
        if (contestId) {
            try {
                await trackProblemAttempt(user_id, contestId, problem_id);
            } catch (error) {
                console.error('Error tracking contest attempt:', error);
                // Continue submission
            }
        }

        const all_testcases = [
            ...submit_problem.visible_testcase,
            ...submit_problem.hidden_testcase
        ];

        let submissionDoc = await submission.create({
            user_id,
            problem_id,
            code,
            language,
            status: "pending",
            total_testcase: all_testcases.length,
            contest_id: contestId || null,
        });

        const language_num = language_number(language);
        const submission_batch = all_testcases.map((testcase) => ({
            source_code: code,
            language_id: language_num,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const tokens = await submit_batch(submission_batch);
        const token_array = tokens.map((t) => t.token);
        const results = await submit_token(token_array);

        // --- Error Handling & Aggregation ---
        let testcase_passed = 0;
        let runtime = 0;
        let memory = 0;
        let finalStatus = "accepted";
        let finalErrorMessage = null;

        for (const result of results) {
            if (result.status_id === 3) {
                testcase_passed++;
                runtime += parseFloat(result.time || 0);
                memory = Math.max(memory, result.memory || 0);
            } else {
                if (finalStatus === "accepted") {
                    if (result.compile_output) {
                        finalStatus = "compile_error";
                        finalErrorMessage = `Compilation Error:\n${result.compile_output}`;
                    } else if (result.stderr) {
                        finalStatus = "runtime_error";
                        finalErrorMessage = `Runtime Error:\n${result.stderr}`;
                    } else if (result.status && result.status.description) {
                        finalStatus = result.status.description.replace(/ /g, "_").toLowerCase();
                        finalErrorMessage = `Judge Error: ${result.status.description}`;
                    } else {
                        finalStatus = "unknown_error";
                        finalErrorMessage = "An unknown error occurred during evaluation.";
                    }
                }
            }
        }

        // Save to DB
        submissionDoc.status = finalStatus;
        submissionDoc.testcase_passed = testcase_passed;
        submissionDoc.error_message = finalErrorMessage;
        submissionDoc.runtime = runtime;
        submissionDoc.memory = memory;
        await submissionDoc.save();

        // Update user's solved problems
        if (finalStatus === "accepted") {
            if (!req.real_user.problem_solved.includes(problem_id)) {
                req.real_user.problem_solved.push(problem_id);
                await req.real_user.save();
            }

            // Optional: Track solve in contest
            // if (contestId) {
            //     try {
            //         await trackProblemSolved(user_id, contestId, problem_id);
            //     } catch (err) {
            //         console.error('Error tracking contest solve:', err);
            //     }
            // }
        }

        // Final Response
        console.log(finalStatus)
        res.status(200).json({
            success: finalStatus === "accepted",
            status: finalStatus,
            runtime,
            memory,
            errorMessage: finalErrorMessage,
            contestId: contestId || null,
            problemId: problem_id,
        });

    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({
            success: false,
            status: "server_error",
            errorMessage: "Internal Server Error: " + err.message
        });
    }
};

let run_the_code = async (req, res) => {
    try {
        let user_id = req.real_user._id;
        let problem_id = req.params.id;
        let { language, code } = req.body;

        if (!user_id || !problem_id || !language || !code) {
            return res.status(400).json({
                success: false,
                testCases: [],
                errorMessage: "Missing required fields"
            });
        }

        const submit_problem = await problem.findById(problem_id);
        if (!submit_problem) {
            return res.status(404).json({
                success: false,
                testCases: [],
                errorMessage: "Problem not found"
            });
        }

        let language_num = language_number(language);

        let submission_batch = submit_problem.visible_testcase.map((val) => ({
            source_code: code,
            language_id: language_num,
            stdin: val.input,
            expected_output: val.output
        }));

        let testcase_token = await submit_batch(submission_batch);
        if (!testcase_token || !Array.isArray(testcase_token)) {
            return res.status(500).json({
                success: false,
                testCases: [],
                errorMessage: "Failed to submit code to Judge0"
            });
        }

        let token_array = testcase_token.map((val) => val.token);
        let final_result = await submit_token(token_array);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let overallStatus = true;
        let finalErrorMessage = null;

        for (const test of final_result) {
            if (test.status_id === 3) {
                // Accepted
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                overallStatus = false;

                // Construct a detailed error message
                if (!finalErrorMessage) {
                    if (test.compile_output) {
                        finalErrorMessage = `Compilation Error:\n${test.compile_output}`;
                    } else if (test.stderr) {
                        finalErrorMessage = `Runtime Error:\n${test.stderr}`;
                    } else if (test.status && test.status.description) {
                        finalErrorMessage = `Judge Error: ${test.status.description}`;
                    } else {
                        finalErrorMessage = `Unknown error on input: ${test.stdin}`;
                    }
                }
            }
        }

        res.status(200).json({
            success: overallStatus,
            testCases: final_result,
            runtime,
            memory,
            errorMessage: finalErrorMessage
        });

    } catch (err) {
        console.error("Run code error:", err);
        res.status(500).json({
            success: false,
            testCases: [],
            errorMessage: "Internal Server Error: " + err.message
        });
    }
}


module.exports = { submit_the_code, run_the_code };