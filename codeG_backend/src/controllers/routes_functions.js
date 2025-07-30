
let user = require("../models/user");
let problem = require("../models/problem_schema");
let jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const redisclient = require("../config/redisdatabase")
const nodemailer = require("nodemailer")
const otp_generator = require("otp-generator")
const admin = require("firebase-admin")

const validate = require("../utils/validate")

let email_varification = async (req, res) => {

    try {

        const { email_id } = req.body;
        if (!email_id) return res.status(400).json({ error: "Missing email_id" });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });
        let otp = otp_generator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true
        })
        await redisclient.set(`otp:${email_id}`, otp, {
            EX: 300,
        });


        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: req.body.email_id,
            subject: "Your CodeG OTP",
            html:
                `
        <div style="font-family:sans-serif; padding:10px; color:#333">
          <h2>Your OTP is: <span style="color:#3b82f6">${otp}</span></h2>
          <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <br />
          <p>– Team CodeG</p>
        </div>
      `,
        });



        res.send("otp send")
    }
    catch (err) {
        res.status(500).send({ error: err.message || "Something went wrong" });
    }
}

let register = async (req, res) => {

    try {

        validate(req.body);

        let { first_name, email_id, otp, password } = req.body;

        const real_otp = await redisclient.get(`otp:${email_id}`)

        if (!real_otp) {
            return res.status(400).json({ message: "OTP is expired" });
        }

        if (real_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }


        req.body.password = await bcrypt.hash(password, 10);

        if (req.role) {
            if (req.role == "admin") {
                throw new Error('you are not admin .so, your role must be User')
            }
        }


        let real_user = await user.create(req.body);

        let token = jwt.sign({ _id: real_user._id, email_id: email_id, first_name: first_name }, process.env.private_key, { expiresIn: "1d" });

        let reply = {
            first_name: real_user.first_name,
            email_id: real_user.email_id,
            _id: real_user._id,
            createdAt: real_user.createdAt,
            problem_solved: real_user.problem_solved,
            role: real_user.role,
            subscribed: real_user.subscribed
        }


        res.cookie("token", token, 
            {   httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',  
            maxAge: 24 * 60 * 60 * 1000,
            overwrite: true });

        res.status(201).json({
            user: reply,
            message: "User Register Successfully"
        })
    }
    catch (err) {
        res.status(400).send("Error : " + err)
    }
}

let change_pass = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.real_user._id; // From authMiddleware


    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    try {
        // 2. Find the authenticated user in the database
        const User = await user.findById(userId);
        if (!User) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 3. Compare the provided current password with the hashed password in the DB
        const isMatch = await bcrypt.compare(currentPassword, User.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // 4. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 5. Update the user's password in the database
        User.password = hashedPassword;
        await User.save();

        // 6. Send a success response
        return res.status(200).json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error('Error during password change:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}


let login = async (req, res) => {

    try {

        let { email_id, password } = req.body;

        if (!email_id) {
            throw new Error("Invalid Credentials")
        }
        if (!password) {
            throw new Error("Invalid Credentials")
        }

        let real_user = await user.findOne({ email_id });

        let match = await bcrypt.compare(password, real_user.password);

        if (!match) {
            throw new Error("Invalid Credentials")
        }

        let token = jwt.sign({ _id: real_user._id, email_id: email_id }, process.env.private_key, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',  
            maxAge: 24 * 60 * 60 * 1000,
            overwrite: true
        });


        let setpassword = "password" in real_user;
        let reply = {
            first_name: real_user.first_name,
            email_id: real_user.email_id,
            _id: real_user._id,
            profile_pic_url: real_user.profile_pic_url,
            problem_solved: real_user.problem_solved,
            role: real_user.role,
            subscribed: real_user.subscribed,
            createdAt: real_user.createdAt,
            setpassword
        }



        res.status(200).json({
            user: reply,
            message: "Logged In Successfullyr"
        })


    }
    catch (err) {
        res.status(401).send("Error : " + err)
    }



}

let logout = async (req, res) => {
    try {

        let { token } = req.cookies;

        let payload = jwt.decode(token);

        await redisclient.set(`token:${token}`, "blocked")
        await redisclient.expireAt(`token:${token}`, payload.exp)

        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.status(200).json({
            message: "you logout successfully"
        });
    }
    catch (err) {
        res.status(503).send("Error: " + err);
    }
}

let admin_register = async (req, res) => {
    try {



        let { first_name, email_id, password, role, last_name } = req.body;

        req.body.password = await bcrypt.hash(req.body.password, 10);

        let real_user = await user.create(
            {
                first_name,
                last_name,
                email_id,
                password: req.body.password,
                role: role // 5. Explicitly set the ro
            }
        )

        let reply = {
            Email: email_id,
            Password: password,
        }
        res.status(201).json({
            reply,
            message: "share this credential with new admin"

        })

    }
    catch (err) {
        res.status(400).send("Error : " + err)
    }
}

let delete_profile = async (req, res) => {
    try {

        let id = req.real_user._id;
        await user.findOneAndDelete({ _id: id });


        res.status(201).json({
            message: "User Deleted successfully"
        })


    }
    catch (err) {
        res.status(500).send("Internal Server Error ->", err.message)
    }
}

let check_user = async (req, res) => {
    try {
        let setpassword = req.real_user.password ? true : false;
        let reply = {
            first_name: req.real_user.first_name,
            email_id: req.real_user.email_id,
            _id: req.real_user._id,
            profile_pic_url: req.real_user.profile_pic_url,
            problem_solved: req.real_user.problem_solved || [],
            role: req.real_user.role,
            subscribed: req.real_user.subscribed,
            createdAt: req.real_user.createdAt,
            setpassword




        }


        res.status(201).json({
            user: reply,
            message: "valid user"
        })
    }
    catch (err) {
        res.status(500).send("Something went wrong -> " + err.message)
    }

}

const social_login = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(401).json({ message: "Id token is not present" });
        }

        const decoded_token = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decoded_token;

        let real_user = await user.findOne({ email_id: email });


        if (!real_user) {
            real_user = await user.create({
                first_name: name,
                email_id: email,
                firebase_uid: uid,
                profile_pic_url: picture,
                role: "user",
                auth_method: decoded_token.firebase.sign_in_provider

            });
        }

        // Update if profile_pic is missing
        if (!real_user.firebase_uid || !real_user.profile_pic_url) {
            real_user.firebase_uid = real_user.firebase_uid || uid;
            real_user.profile_pic_url = real_user.profile_pic_url || picture;
            await real_user.save();
        }

        const token = jwt.sign(
            {
                _id: real_user._id,
                email_id: real_user.email_id,
                first_name: real_user.first_name
            },
            process.env.private_key,
            { expiresIn: "1d" } // 1 hour
        );

        let setpassword = real_user.password ? true : false;

        const reply = {
            first_name: real_user.first_name,
            email_id: real_user.email_id,
            _id: real_user._id,
            profile_pic_url: real_user.profile_pic_url,
            problem_solved: real_user.problem_solved || [],
            role: real_user.role,
            subscribed: real_user.subscribed,
            createdAt: real_user.createdAt,
            setpassword,
            firebase_uid: real_user.firebase_uid
        };


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',  
            maxAge: 24 * 60 * 60 * 1000,
            overwrite: true
        });

        res.status(200).json({
            user: reply,
            message: "User authenticated successfully"
        });
    } catch (error) {
        console.error("Social login error:", error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        res.status(500).json({ message: "An internal server error occurred." });
    }
};


const get_all_user = async (req, res) => {
    try {
        const users = await user.find({}).select('-password');

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        // Send the list of users as a response
        res.status(200).json({
            success: true,
            count: users.length,
            users: users,
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching users.",
        });
    }
}


const change_role = async (req, res) => {
    const { userId } = req.params; // The ID of the user to be updated
    const { role: newRole } = req.body; // The new role from the request body

    // --- 1. Input Validation ---
    if (!newRole || !['user', 'admin'].includes(newRole)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role specified. Role must be 'user' or 'admin'."
        });
    }



    if (req.real_user.id === userId) {
        return res.status(403).json({ // 403 Forbidden
            success: false,
            message: "Admins cannot change their own role."
        });
    }

    try {
        const userToUpdate = await user.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ // 404 Not Found
                success: false,
                message: "User not found."
            });
        }

        userToUpdate.role = newRole;
        await userToUpdate.save();


        res.status(200).json({
            success: true,
            message: `Successfully updated role for ${userToUpdate.first_name} to '${newRole}'.`,
            user: {
                id: userToUpdate._id,
                first_name: userToUpdate.first_name,
                email_id: userToUpdate.email_id,
                role: userToUpdate.role
            }
        });

    } catch (err) {
        console.error("Error updating user role:", err);
        res.status(500).json({
            success: false,
            message: "An internal server error occurred."
        });
    }
};


const update_user = async (req, res) => {
    try {
        if (!req.real_user || !req.real_user._id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const userId = req.real_user._id;
        const { first_name, profile_pic_url, password } = req.body;

        const updateData = {};

        if (first_name && typeof first_name === 'string' && first_name.trim() !== "") {
            updateData.first_name = first_name.trim();
        }
        if (profile_pic_url && typeof profile_pic_url === 'string') {
            updateData.profile_pic_url = profile_pic_url;
        }

        if (password) {
            // 1. Backend Validation (Critical Security Step)
            if (typeof password !== 'string' || password.length < 8) {
                return res.status(400).json({ message: "Password must be at least 8 characters long." });
            }
            if (!/[A-Z]/.test(password)) {
                return res.status(400).json({ message: "Password must contain at least one uppercase letter." });
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                return res.status(400).json({ message: "Password must contain at least one special character." });
            }


            const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Add the *hashed* password to the update object
            updateData.password = hashedPassword;
        }

        // If no valid data was provided, return without hitting the database
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid data provided for update." });
        }

        // Find the user by ID and update the document with the new data
        const updatedUser = await user.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password'); // IMPORTANT: Exclude the password hash from the response

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Send a success response with the updated user object (without the password)
        res.status(200).json({
            message: "Profile updated successfully!",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }

}

const addProblemToTodo = async (req, res) => {
    const { problemId } = req.body;
    const userId = req.real_user._id

    try {

        const User = await user.findById(userId);
        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }


        // Check if the problem exists
        const Problem = await problem.findById(problemId);
        if (!Problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Check if the problem is already in the to-do list
        if (User.todo.includes(problemId)) {
            return res.status(400).json({ message: 'Problem is already in the to-do list' });
        }

        // Add the problem to the to-do list
        User.todo.push(problemId);
        await User.save();

        res.status(200).json({ message: 'Problem added to to-do list successfully', todo: user.todo });

    } catch (error) {
        console.error('Error adding problem to to-do list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const removeProblemFromTodo = async (req, res) => {
    const { problemId } = req.body;
    const userId = req.real_user._id
    try {
        // Find the user and update their to-do list by pulling the problemId
        const User = await user.findByIdAndUpdate(
            userId,
            { $pull: { todo: problemId } },
            { new: true } // Returns the updated document
        );

        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Problem removed from to-do list successfully', todo: user.todo });

    } catch (error) {
        console.error('Error removing problem from to-do list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getTodoProblems = async (req, res) => {
    const userId = req.real_user._id
    console.log("hi")

    try {
        // Find the user and populate the 'todo' field to get the full problem documents
        const User = await user.findById(userId).populate('todo');

        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }

        // The user.todo field now contains an array of problem objects
        res.status(200).json({
            message: 'To-do list fetched successfully',
            todo: User.todo
        });

    } catch (error) {
        console.error('Error fetching to-do list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const detailofuser = async (req, res) => {

    try {

        const { userId } = req.params;
        const User = await user.findById(userId);


        if (!User) {
            return res.status(404).json({ message: "User not found." });
        }

        const safeUserProfile = {
            _id: User._id,
            first_name: User.first_name,
            profile_pic_url: User.profile_pic_url
        };


        res.status(200).json(safeUserProfile);

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error while fetching user profile." });
    }

}


module.exports = { register, login, logout, admin_register, delete_profile, check_user, email_varification, social_login, get_all_user, change_role, update_user, change_pass, addProblemToTodo, removeProblemFromTodo, getTodoProblems, detailofuser }