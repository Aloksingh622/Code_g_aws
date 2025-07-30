let express = require("express")
let app = express();
let cookieParser = require("cookie-parser")
require('dotenv').config()
let redisclient = require("./config/redisdatabase")
let user_routes = require("./routes/user_routes")
let problem_routes=require("./routes/problem_routes")
let code_routes=require("./routes/submit_routes")
let Main = require("./config/database")
const cors=require("cors")
const admin = require('firebase-admin');
const assist_routes=require("./routes/assistant")
const payment_router=require("./routes/payment")
const cron = require('node-cron');
const problem=require("./models/problem_schema")
const videoRouter = require("./routes/videoCreator");
const discussion_router =require("./routes/discusion")
const constest_router=require("./routes/contest")
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);
// const serviceAccount=require("../serviceAccountKey.json")
app.use(cookieParser());


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const pairmode_routes=require("./routes/pairMode");


app.use(cors({
    origin:"https://code-g-frontend.vercel.app",
    credentials:true
}))


app.use(express.json());

app.use("/user", user_routes);
app.use("/problem",problem_routes)
app.use("/code",code_routes) 
app.use("/ai",assist_routes)
app.use("/pay",payment_router)
app.use("/video", videoRouter);
app.use("/discussion",discussion_router)
app.use("/contest",constest_router)
app.use("/pairMode",pairmode_routes)

cron.schedule('0 0 * * *', async () => {

    try {
       
        await problem.findOneAndUpdate(
            { isProblemOfTheDay: true },
            { $set: { isProblemOfTheDay: false } }
        );

        const potentialProblemsCount = await problem.countDocuments({ potdDate: "null" });
        
        if (potentialProblemsCount === 0) {
         
            
            await problem.updateMany({}, { $set: { potdDate: "null" } });
            return;
        }

        const randomIndex = Math.floor(Math.random() * potentialProblemsCount);
        const newPotd = await problem.findOne({ potdDate: "null" }).skip(randomIndex);

        if (newPotd) {
            newPotd.isProblemOfTheDay = true;
            newPotd.potdDate = new Date();
            await newPotd.save();
          ;
        }
    } catch (error) {
        console.error('Error in POTD daily task:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" 
});


async function connections() {
    try {
        await Promise.all([redisclient.connect(), Main()])
    
        app.listen(process.env.port, () => {
            console.log("server is start listening at port number" + process.env.port);
        })
    } 
    catch (err) {
        console.log("Error: " + err);
    }
}

connections()