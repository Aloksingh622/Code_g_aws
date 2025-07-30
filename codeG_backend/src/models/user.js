let mongoose = require("mongoose");
let { Schema } = mongoose;

const userschema = new Schema({
    first_name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength:25
    },
    last_name: {
        type: String,
        minLength: 3,
        maxLength: 15
    },
    email_id: {
        type: String,
        unique: true,
        required: true,
        immutable: true,
        lowercase: true,
        trim: true
    },
    age: {
        type: Number,
        min: 10,
        max: 80
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    problem_solved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'problem'
        }],
         default: [] 
    },
    firebase_uid: {
        type: String,
        required: false,
        index: true
    },
    profile_pic_url: {
        type: String
    },
    auth_method: {
        type: String,
        enum: ['local', 'google.com', 'github.com'], 
       
    }
    ,
    password: {
        type: String,
        required: false
    },
    
    subscribed:{
        type:Boolean,
        default:false
    },
     todo: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'problem'
        }],
        default: []
    }
}, { timestamps: true });

userschema.post("findOneAndDelete", async (real_user) => {
    if (real_user) {
        await mongoose.model("submissions").deleteMany({ user_id: real_user._id });
    }
});


const user = mongoose.model("user", userschema);

module.exports = user