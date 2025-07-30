const express = require('express');
let usermiddleware=require("../middleware/usermiddleware")
let pairmode_routes=express.Router();
const {sessionId,sessionDetail}=require("../controllers/pairmodeFunction")

pairmode_routes.post("/createSession",usermiddleware,sessionId )
pairmode_routes.get("/details/:sessionId",usermiddleware,sessionDetail )


module.exports=pairmode_routes
