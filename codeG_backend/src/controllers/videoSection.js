const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem_schema");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");
const { sanitizeFilter } = require('mongoose');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.real_user?._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};



// Alternative approach with better error handling and multiple thumbnail options
const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    const userId = req.real_user?._id;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Check if video already exists for this problem and user
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

    // Generate multiple thumbnail options
    const thumbnailOptions = {
      auto: cloudinary.url(cloudinaryResource.public_id, {
        resource_type: 'video',
        transformation: [
          { width: 400, height: 225, crop: 'fill' },
          { quality: 'auto' },
          { start_offset: 'auto' }
        ],
        format: 'jpg'
      }),
      middle: cloudinary.url(cloudinaryResource.public_id, {
        resource_type: 'video',
        transformation: [
          { width: 400, height: 225, crop: 'fill' },
          { quality: 'auto' },
          { start_offset: '50%' }
        ],
        format: 'jpg'
      }),
      early: cloudinary.url(cloudinaryResource.public_id, {
        resource_type: 'video',
        transformation: [
          { width: 400, height: 225, crop: 'fill' },
          { quality: 'auto' },
          { start_offset: '10%' }
        ],
        format: 'jpg'
      })
    };

    // Use auto-detection as primary, with fallback options
    const primaryThumbnail = thumbnailOptions.auto;

    // Create video solution record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl: primaryThumbnail,
      // Optional: store alternative thumbnails
      thumbnailOptions: thumbnailOptions
    });

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt,
        // Optional: include alternative thumbnails in response
        thumbnailOptions: thumbnailOptions
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    
    // More detailed error logging
    if (error.http_code) {
      console.error('Cloudinary API Error:', error.http_code, error.message);
    }
    
    res.status(500).json({ 
      error: 'Failed to save video metadata',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const deleteVideo = async (req, res) => {
    let { by, value } = req.query;

    let delete_by;

    if (by === "id") {
        delete_by = { _id: value };
    } else if (by === "problem") {
        delete_by = { problemId: value };
    } else if (by === "cloudinaryId") {
        delete_by = { cloudinaryPublicId: value };
    } else {
        return res.status(400).send("Invalid 'by' value. Use id, problem, or cloudinaryId.");
    }

    try {
        const deletedVideo = await SolutionVideo.findOneAndDelete(delete_by);
        if (!deletedVideo) {
            return res.status(404).send("Video not found with the given criteria.");
        }

        return res.status(200).send("Video deleted successfully.");
    } catch (err) {
        return res.status(500).send("Error: " + err.message);
    }
};


const profile_pic = async (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
    const userId = req.real_user._id;

    // Construct the Cloudinary public ID path
    const publicId = `profile-pictures/${userId}/profile_${timestamp}.jpg`;

    // Generate a signed upload request
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        public_id: publicId,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    
   
    // Return Cloudinary upload data to the frontend
    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });

  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
};





module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo,profile_pic};