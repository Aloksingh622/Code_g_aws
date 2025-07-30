
const Contest = require('../models/contest');
const problem=require("../models/problem_schema")
const ContestProgress = require('../models/contestProgressSchema');
const mongoose = require('mongoose');

 const getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find().lean();
        const userId = req.real_user._id;

        const contestsWithStatus = contests.map(contest => ({
            ...contest,
            isRegistered: contest.participants.some(pId => pId.toString() === userId)
        }));

        res.status(200).json(contestsWithStatus);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ message: "Server error" });
    }
};

 const getContests = async (req, res) => {
try {
        const { contestId } = req.params;
       

        // 1. Validate that the provided ID is in a valid format
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: 'Invalid contest ID format.' });
        }

        // 2. Find the contest by its ID and populate the 'problems' field.
        //    We only select the '_id', 'serial_number', and 'title' from each problem.
        const contest = await Contest.findById(contestId)
            .populate('problems', '_id serial_number title'); // <--- The key enhancement is here

        // 3. Handle the case where the contest is not found
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }
        
        // 4. Send the populated contest data back to the frontend
        res.status(200).json(contest);

    } catch (error) {
        console.error("Error fetching contest by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
};


 const registerForContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.real_user._id;

        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: 'Invalid contest ID' });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        // Check if registration period is over (contest has started or is past)
        if (new Date() >= new Date(contest.startTime)) {
            return res.status(400).json({ message: 'Registration has closed for this contest.' });
        }

        // Check if the contest is full
        if (contest.participants.length >= contest.maxParticipants) {
            return res.status(400).json({ message: 'This contest is already full.' });
        }

        // Check if user is already registered
        if (contest.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are already registered for this contest.' });
        }

        // Add user to participants list
        contest.participants.push(userId);
        await contest.save();

        res.status(200).json({ message: 'Successfully registered for the contest!' });

    } catch (error) {
        console.error("Error registering for contest:", error);
        res.status(500).json({ message: "Server error" });
    }

    
};

 const createContest = async (req, res) => {
    const { title, description, startTime, endTime, problems, maxParticipants } = req.body;

    // --- Backend Validation ---
    if (!title || !description || !startTime || !endTime || !problems || !maxParticipants) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (new Date(endTime) <= new Date(startTime)) {
        return res.status(400).json({ message: "End time must be after the start time." });
    }

    // Optional but good practice: validate that problems are actual ObjectIDs
    const invalidProblemId = problems.find(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidProblemId) {
        return res.status(400).json({ message: `Invalid problem ID format: ${invalidProblemId}`});
    }

    try {
        const newContest = new Contest({
            title,
            description,
            startTime,
            endTime,
            problems, // Already an array from the frontend
            maxParticipants,
        });

        const savedContest = await newContest.save();
        
        // Return the newly created contest
        res.status(201).json(savedContest);

    } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ message: "Server error while creating the contest." });
    }
};


const findProblem = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Search query is required." });
    }

    try {
        let problems;
        // Check if the query is a number and search by serial_number, otherwise search by title
        if (!isNaN(query)) {
            problems = await problem.findOne({ serial_number: Number(query) });
        } else {
            // Case-insensitive search for the title
            problems = await problem.findOne({ title: { $regex: new RegExp(`^${query}$`, 'i') } });
        }

        if (!problems) {
            return res.status(404).json({ message: `Problem with query "${query}" not found.` });
        }

        // Return only the necessary details
        res.status(200).json({
            _id: problems._id,
            title: problems.title,
            serial_number: problems.serial_number,
        });

    } catch (error) {
        console.error("Error finding problem:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const updateContest = async (req, res) => { 
    const { contestId } = req.params;
  
    const { title, description, startTime, endTime, problems, maxParticipants } = req.body;

    // --- Backend Validation ---
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID." });
    }
    if (!title || !description || !startTime || !endTime || !problems || !maxParticipants) {
        return res.status(400).json({ message: "All fields are required." });
    }
    if (new Date(endTime) <= new Date(startTime)) {
        return res.status(400).json({ message: "End time must be after start time." });
    }

    try {
        const updatedContest = await Contest.findByIdAndUpdate(
            contestId,
            { title, description, startTime, endTime, problems, maxParticipants },
            { new: true, runValidators: true } // {new: true} returns the updated doc
        );

        if (!updatedContest) {
            return res.status(404).json({ message: "Contest not found." });
        }
        
        res.status(200).json(updatedContest);

    } catch (error) {
        console.error("Error updating contest:", error);
        res.status(500).json({ message: "Server error while updating the contest." });
    }
}

const getContestById = async (req, res) => {
    try {
        const { contestId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: 'Invalid contest ID format.' });
        }
        
     
        const contest = await Contest.findById(contestId)
            .populate('problems', '_id serial_number title') 
            .populate('participants', '_id first_name profile_pic_url'); 

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }
        
        res.status(200).json(contest);

    } catch (error) {
        console.error("Error fetching contest by ID:", error);
        res.status(500).json({ message: "Server error" });
    }

}

const getContestArenaData = async (req, res) => {
    try {
        const { contestId } = req.params;
        console.log("hi", contestId)
      
        
        const userId = req.real_user.id;

        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: "Invalid contest ID." });
        }

        const contest = await Contest.findById(contestId)
            // Fully populate all problem details for the arena
            .populate('problems'); 

        if (!contest) {
            return res.status(404).json({ message: "Contest not found." });
        }
        

      
        const isParticipant = contest.participants.some(pId => pId.toString() === userId);
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not registered for this contest." });
        }
        
        // 2. Check if the contest is actually live
        const now = new Date();
        if (now < new Date(contest.startTime) || now > new Date(contest.endTime)) {
             return res.status(403).json({ message: "This contest is not currently live." });
        }

        res.status(200).json(contest);

    } catch (error) {
        console.error("Error fetching contest arena data:", error);
        res.status(500).json({ message: "Server error." });
    }
};

const getContestProgress = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.real_user._id; // Assuming auth middleware sets req.user

        // Find or create progress record
        let progress = await ContestProgress.findOne({ 
            userId, 
            contestId 
        }).populate('problemProgress.problemId', 'title difficulty points');

        if (!progress) {
            // Create initial progress record
            const contest = await Contest.findById(contestId).populate('problems');
            if (!contest) {
                return res.status(404).json({ message: 'Contest not found' });
            }

            progress = new ContestProgress({
                userId,
                contestId,
                problemProgress: contest.problems.map(problem => ({
                    problemId: problem._id,
                    status: 'NOT_ATTEMPTED',
                    attemptCount: 0
                })),
                totalSolved: 0,
                totalScore: 0
            });

            await progress.save();
        }

        res.json(progress);
    } catch (error) {
        console.error('Error fetching contest progress:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const trackProblemVisit = async (req, res) => {
    try {
        const { contestId, problemId } = req.params;
        const userId = req.real_user._id;

        // Find or create progress record
        let progress = await ContestProgress.findOne({ userId, contestId });
        
        if (!progress) {
            // Create new progress record
            const contest = await Contest.findById(contestId).populate('problems');
            if (!contest) {
                return res.status(404).json({ message: 'Contest not found' });
            }

            progress = new ContestProgress({
                userId,
                contestId,
                problemProgress: contest.problems.map(problem => ({
                    problemId: problem._id,
                    status: problem._id.toString() === problemId ? 'ATTEMPTED' : 'NOT_ATTEMPTED',
                    visitedAt: problem._id.toString() === problemId ? new Date() : null,
                    attemptCount: 0
                })),
                totalSolved: 0,
                totalScore: 0
            });
        } else {
            // Update existing progress
            const problemProgress = progress.problemProgress.find(
                p => p.problemId.toString() === problemId
            );

            if (problemProgress) {
                // Only update if not already solved
                if (problemProgress.status !== 'SOLVED') {
                    problemProgress.status = 'ATTEMPTED';
                    if (!problemProgress.visitedAt) {
                        problemProgress.visitedAt = new Date();
                    }
                }
            } else {
                // Add new problem progress
                progress.problemProgress.push({
                    problemId,
                    status: 'ATTEMPTED',
                    visitedAt: new Date(),
                    attemptCount: 0
                });
            }
        }

        await progress.save();
        res.json({ message: 'Problem visit tracked successfully', progress });
    } catch (error) {
        console.error('Error tracking problem visit:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const trackProblemSolved = async (req, res) => {
    try {
        const { contestId, problemId } = req.params;
        const userId = req.real_user._id;

        // Find progress record
        const progress = await ContestProgress.findOne({ userId, contestId });
        
        if (!progress) {
            return res.status(404).json({ message: 'Contest progress not found' });
        }

        // Find the problem progress
        const problemProgress = progress.problemProgress.find(
            p => p.problemId.toString() === problemId
        );

        if (!problemProgress) {
            return res.status(404).json({ message: 'Problem progress not found' });
        }

        // Only update if not already solved
        if (problemProgress.status !== 'SOLVED') {
            problemProgress.status = 'SOLVED';
            problemProgress.solvedAt = new Date();
            
            // Update total solved count
            progress.totalSolved += 1;
            
            // Update total score (if you have problem points)
            // Uncomment if you have problem model with points
            // const problem = await Problem.findById(problemId);
            // if (problem && problem.points) {
            //     progress.totalScore += problem.points;
            // }
        }

        await progress.save();
        res.json({ message: 'Problem solved tracked successfully', progress });
    } catch (error) {
        console.error('Error tracking problem solved:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const trackProblemAttempt = async (req, res) => {
    try {
        const { contestId, problemId } = req.params;
        const userId = req.real_user.id;

        const progress = await ContestProgress.findOne({ userId, contestId });
        
        if (!progress) {
            return res.status(404).json({ message: 'Contest progress not found' });
        }

        const problemProgress = progress.problemProgress.find(
            p => p.problemId.toString() === problemId
        );

        if (problemProgress) {
            problemProgress.attemptCount += 1;
            await progress.save();
        }

        res.json({ message: 'Problem attempt tracked successfully' });
    } catch (error) {
        console.error('Error tracking problem attempt:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get contest leaderboard
const getContestLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;

        const leaderboard = await ContestProgress.find({ contestId })
            .populate('userId', 'name email_id first_name profile_pic_url') // Adjust fields as per your User model
            .sort({ totalSolved: -1, totalScore: -1, lastUpdated: 1 }) // Sort by problems solved, then score, then time
            .limit(100); // Top 100

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteContest = async (req, res) => {
    try {
        const { contestId } = req.params;

        // 1. Validate the Contest ID format before proceeding
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: "Invalid contest ID format." });
        }

        // 2. Find and delete the contest itself
        const deletedContest = await Contest.findByIdAndDelete(contestId);

        // If no contest was found and deleted, send a 404 response
        if (!deletedContest) {
            return res.status(404).json({ message: "Contest not found. It may have already been deleted." });
        }

        // 3. If the contest was deleted successfully, now delete all associated progress records
        // This is crucial for keeping your database clean (cascade delete)
        await ContestProgress.deleteMany({ contestId: contestId });
        
        // 4. Send a success confirmation message
        res.status(200).json({ 
            success: true, 
            message: "Contest and all associated participant progress records have been successfully deleted." 
        });

    } catch (error) {
        console.error("Error deleting contest:", error);
        res.status(500).json({ 
            success: false, 
            message: "A server error occurred while trying to delete the contest.",
            error: error.message 
        });
    }
};


module.exports = {
    getAllContests,
    registerForContest,
    createContest,
    findProblem,
    updateContest,
    getContests,
    getContestById,
    getContestArenaData,
     getContestProgress,
    trackProblemVisit,
    trackProblemSolved,
    trackProblemAttempt,
    getContestLeaderboard,
    deleteContest
};
