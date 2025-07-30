const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contestSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    problems: [{
        type: Schema.Types.ObjectId,
        ref: 'problem', 
    }],
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'user', 
    }],
    maxParticipants: {
        type: Number,
        default: 100,
    },
}, { timestamps: true });

const Contest = mongoose.model('Contest', contestSchema);
module.exports= Contest;