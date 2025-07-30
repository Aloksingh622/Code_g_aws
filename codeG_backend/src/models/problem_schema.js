let mongoose=require("mongoose");
let {Schema}=mongoose;

let problem_schema=new Schema({
    serial_number:{
        type:Number,
        required:true,
        unique:true
    },
    title:{
        type:String,
        required:true,
        unique:true
    },
    difficulty:{
        type:String,
        enum:["Easy","Medium","Hard"],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tags:{
        type:String,
        required:true
    },
    visible_testcase:[
        {
            input:{
                type:String,
                 required:true
            },
            output:{
                type:String,
                 required:true
            },
             explanation:{
                type:String,
                required:true
            }
        }
    ],
    hidden_testcase:[
       
         {
            input:{
                type:String,
                 required:true
            },
            output:{
                type:String,
                 required:true
            }
        }
    ],
    start_code:[
        {
            language:{
                type:String,
                required:true
            },
            initial_code:{
                type:String,
                required:true
            }
        }
    ],

    problem_solution:[
            {
                language:{
                    type:String,
                    required:true
                },
                complete_code:{
                    type:String,
                    required:true
                }
            }
    ],
    problem_created_by:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
        
    },
     isProblemOfTheDay: {
        type: Boolean,
        default: false,
        index: true 
    },
    potdDate: {
        type: String,
        default: "null"
    },
    isprime:{
        type:Boolean,
        default:false
    }
})

let problem=mongoose.model("problem",problem_schema);

module.exports=problem

