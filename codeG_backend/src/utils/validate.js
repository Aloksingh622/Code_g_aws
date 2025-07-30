let validator=require("validator");

let validate=(data)=>{

    let medatoryfield=["first_name","email_id","password","otp"];

    let allow=medatoryfield.every((k)=>Object.keys(data).includes(k));

    if(!allow){
        throw new Error ("some field is missing");
    }
    
    if(!validator.isEmail(data.email_id)){
        throw new Error ("your email formate is wrong");
    }

    if(!validator.isStrongPassword(data.password)){
        throw new Error ("choose strong password");
    }
}
module.exports=validate