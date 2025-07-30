
const express = require('express');
const code_routes = express.Router();
let usermiddleware=require("../middleware/usermiddleware");
let {submit_the_code,run_the_code}=require("../controllers/submit_functions")


code_routes.post("/submit/:id",usermiddleware,submit_the_code)
code_routes.post("/run/:id",usermiddleware,run_the_code)

module.exports=code_routes