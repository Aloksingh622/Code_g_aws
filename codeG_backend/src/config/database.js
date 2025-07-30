let mongoose=require("mongoose")

async function Main(){
     
     await mongoose.connect(process.env.Data_base_string);
}

module.exports=Main;