const express = require('express');
const adminMiddleware = require('../middleware/adminmiddleware');
const videoRouter =  express.Router();
const usermiddleware=require("../middleware/usermiddleware")

const {generateUploadSignature,saveVideoMetadata,deleteVideo,profile_pic} = require("../controllers/videoSection")

videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete",adminMiddleware,deleteVideo);


videoRouter.get("/upload/pic",usermiddleware,profile_pic)

module.exports = videoRouter;