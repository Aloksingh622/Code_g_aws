
const express = require('express');


const { getAllContests, registerForContest ,createContest,findProblem,getContests,updateContest,getContestById,getContestArenaData, getContestProgress,
    trackProblemVisit,
    trackProblemSolved,
    trackProblemAttempt,
    getContestLeaderboard,
deleteContest} = require('../controllers/contest_fun');

const usermiddleware = require('../middleware/usermiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');


const constest_router = express.Router();

constest_router.get('/getcontest', usermiddleware, getAllContests);
constest_router.post('/:contestId/register', usermiddleware, registerForContest);
constest_router.post('/create', adminmiddleware, createContest);
constest_router.get('/find', usermiddleware, findProblem);
constest_router.put('/edit/:contestId', adminmiddleware, updateContest);
constest_router.get('/get/:contestId', adminmiddleware, getContests);
constest_router.get('/get/:contestId', adminmiddleware, getContests);
constest_router.get("/:contestId",adminmiddleware,getContestById)
constest_router.get('/:contestId/arena', usermiddleware, getContestArenaData);
constest_router.delete('/delete/:contestId', adminmiddleware, deleteContest);
constest_router.get('/:contestId/progress',usermiddleware, getContestProgress);
constest_router.post('/:contestId/track-visit/:problemId', usermiddleware, trackProblemVisit);
constest_router.post('/:contestId/track-solve/:problemId', usermiddleware, trackProblemSolved);
constest_router.post('/:contestId/track-attempt/:problemId', usermiddleware, trackProblemAttempt);
constest_router.get('/:contestId/leaderboard', usermiddleware, getContestLeaderboard);





module.exports =constest_router