const mongoose = require('mongoose');

const contestProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true
    },
    problemProgress: [{
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'problem',
            required: true
        },
        status: {
            type: String,
            enum: ['SOLVED', 'ATTEMPTED', 'NOT_ATTEMPTED'],
            default: 'NOT_ATTEMPTED'
        },
        visitedAt: {
            type: Date,
            default: null
        },
        solvedAt: {
            type: Date,
            default: null
        },
        attemptCount: {
            type: Number,
            default: 0
        }
    }],
    totalSolved: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
contestProgressSchema.index({ userId: 1, contestId: 1 }, { unique: true });
contestProgressSchema.index({ contestId: 1, totalSolved: -1 }); // For leaderboard

// Update lastUpdated on save
contestProgressSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model('ContestProgress', contestProgressSchema);

