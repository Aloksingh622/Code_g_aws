let express=require("express");
let assist_routes=express.Router();
let usermiddleware=require("../middleware/usermiddleware")
let {analyze_complexity_function}=require("../controllers/assist_function")


assist_routes.post("/assist",usermiddleware,analyze_complexity_function);

module.exports=assist_routes 