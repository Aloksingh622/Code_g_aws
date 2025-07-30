let express=require("express");
let problem_routes=express.Router();
let adminmiddleware=require("../middleware/adminmiddleware")
let usermiddleware=require("../middleware/usermiddleware")
let  {create_problem,update_problem,delete_problem,get_all_problem,get_problem,problem_solved_by_user,submission_of_problem,ai_chat,potd, all_submissions}=require("../controllers/problem_functions");


problem_routes.post("/create",adminmiddleware,create_problem);
problem_routes.put("/update",adminmiddleware,update_problem);
problem_routes.delete("/delete",adminmiddleware,delete_problem);

problem_routes.get("/getAllProblem",usermiddleware,get_all_problem);
problem_routes.get("/getParticularProblem",usermiddleware,get_problem);
problem_routes.get("/problemSolvedByUser",usermiddleware,problem_solved_by_user)
problem_routes.get("/submissionOfProblem/:pid",usermiddleware,submission_of_problem)
problem_routes.post("/aichat",usermiddleware,ai_chat)
problem_routes.get("/potd",usermiddleware,potd)
problem_routes.get("/allsubmission",usermiddleware,all_submissions)

module.exports=problem_routes