const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  problem_id: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript','c++','java',"python"] 
  },
  status: {
    type: String,
    // enum: ['pending', 'accepted', 'wrong', 'error'],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  error_message: {
    type: String,
    default: ''
  },
  testcase_passed: {
    type: Number,
    default: 0
  },
  total_testcase: {  // Recommended addition
    type: Number,
    default: 0
  },
  


}, { 
  timestamps: true
});

submissionSchema.index({user_id:1,problem_id:1});

let submissions= mongoose.model("submissions",submissionSchema);

module.exports=submissions