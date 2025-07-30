let express=require("express");
let user_routes=express.Router();
let {register,login,logout,admin_register,delete_profile,check_user,detailofuser,email_varification,social_login,get_all_user,change_role,update_user,change_pass,addProblemToTodo,removeProblemFromTodo,getTodoProblems}=require("../controllers/routes_functions")
const usermiddleware=require("../middleware/usermiddleware")
const adminmiddleware=require("../middleware/adminmiddleware")


user_routes.post("/emailVerification",email_varification)
user_routes.post("/register",register)
user_routes.post("/login",login)
user_routes.post("/logout",usermiddleware,logout)
user_routes.post("/register/admin",adminmiddleware,admin_register)
user_routes.delete("/deleteProfile",usermiddleware,delete_profile)
user_routes.get("/check",usermiddleware,check_user)
user_routes.post("/socialLogin",social_login)
user_routes.get("/alluser",adminmiddleware,get_all_user)
user_routes.put("/updateRole/:userId",adminmiddleware,change_role)
user_routes.put("/updateUser",usermiddleware,update_user)
user_routes.put("/change-password",usermiddleware,change_pass)
user_routes.post('/todo/add',usermiddleware ,addProblemToTodo);
user_routes.delete('/todo/remove',usermiddleware, removeProblemFromTodo);
user_routes.get('/todo/get',usermiddleware, getTodoProblems);
user_routes.get('/profile/:userId',detailofuser);




module.exports=user_routes