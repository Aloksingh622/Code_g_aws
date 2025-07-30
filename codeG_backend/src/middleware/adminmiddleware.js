let  jwt=require("jsonwebtoken");
let user=require("../models/user")
let redisclient=require("../config/redisdatabase")
let adminmiddleware=async (req,res,next) =>{
    try{
    let {token}=req.cookies;
    
    if(!token){
        throw new Error("Token is not present")
    }

    let payload=jwt.verify(token,process.env.private_key);

    let {_id}=payload;

    if(!_id){
        throw new Error("token is not present")
    }

    let result =await user.findById(_id)

    if(!result){
        throw new Error("user does't not exist")
    }
    
    if(result.role!="admin"){
        throw new Error("This is only access by Admins")
    }

    const IsBlocked = await redisclient.exists(`token:${token}`);

    if(IsBlocked)
    throw new Error("Invalid Token");
    
    req.real_user=result;

    next()
}
catch(err){
        res.status(401).send("Error: "+ err.message)
    }
     

    


}
module.exports=adminmiddleware;

// let jwt = require("jsonwebtoken");
// let user = require("../models/user");
// let redisclient = require("../config/redisdatabase");

// let adminmiddleware = async (req, res, next) => {
//   try {
//     let { token } = req.cookies;

//     if (!token) {
//       throw new Error("Token is not present");
//     }

//     let payload = jwt.verify(token, process.env.private_key);
//     let { _id } = payload;

//     if (!_id) {
//       throw new Error("Invalid token payload");
//     }

//     let result = await user.findById(_id);

//     if (!result) {
//       throw new Error("User does not exist");
//     }

//     if (result.role !== "admin") {
//       throw new Error("This route is only accessible by admins");
//     }

//     const isBlocked = await redisclient.exists(`token:${token}`);
//     if (isBlocked) {
//       throw new Error("Invalid token");
//     }

//     req.result = result; // ✅ use req.result, not req.real_user

//     next();
//   } catch (err) {
//     res.status(401).send("Error: " + err.message);
//   }
// };

// module.exports = adminmiddleware;
