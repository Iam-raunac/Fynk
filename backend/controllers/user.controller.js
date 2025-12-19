import Profile from '../models/profile.model.js';
import User from '../models/user.model.js';
import crypto from 'crypto';

import bcrypt from 'bcrypt';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import ConnectionRequest from '../models/connections.model.js';
import Post from '../models/posts.model.js';
// import jwt from 'jsonwebtoken';

// const secret = "123455ojniwfevbgu"

const convertUserDataTOPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);
    console.log(userData)

    doc.pipe(stream);
    doc.image(`uploads/${userData.userId.profilePicture}`, {align: 'center', width: 100})
    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Positon: ${userData.currentPost}`);

    doc.fontSize(14).text("Past Work: ")
    userData.pastWork.forEach(work => {
        doc.fontSize(14).text(`Company: ${work.company}`);
        doc.fontSize(14).text(`Position: ${work.position}`);
        doc.fontSize(14).text(`Years: ${work.years}`);
    })
    doc.end();

    return outputPath;
}






export const register = async (req, res) => {   // <--  controller ban gaya ab usko serve krega routes 
    console.log(req.body); 
    try{

        const {name, email, password, username} = req.body;

        if(!name || !email || !password || !username) {
            return res.status(400).json({message: "All fields are required"});
        }
        // agar user ban gaya hai

        const user = await User.findOne({
            email
        });

        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        // toh agr sab mil gaya toh hm passwork # hash krenge

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();

    // jab bhi naya user banyenge profile created krenge at instance
    const profile = new Profile({userId: newUser._id}); // user ko profile bharne ke liye already mili hogi
        await profile.save();

    return res.json({message: "User registered successfully"})

    } catch(error) {
        return res.status(500).json({message: error.message})
    }
}

export const login = async (req, res) => {
    // get email and password from request body
    // check email in db
    // error 400 if mail not found
    //if found then 
    //check password
    // if password not matches -> error 400
    // if found 
    // generate token using user id
    // send token in response
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({
            email
        });
        if(!user) return res.status(404).json({message: "User not found"});
        // compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"});
        // generate token
        const token = crypto.randomBytes(32).toString("hex"); // use token to reduce frequency + security
        await User.updateOne({_id: user._id}, {token}); // update user with token
       

        return res.json({token: token})

    } catch(error) {
        return res.status(500).json({message: error.message});

    }

}

export const uploadProfilePicture = async (req, res) => {
    const {token} = req.body;

    try{
        const user = await User .findOne({token: token});

        if(!user) return res.status(404).json({message: "User not found"});

        user.profilePicture = req.file.filename; // multer se file ka path milega

        await user.save();

        return res.json({message: "Profile picture Updated"})

    }catch (error){
        return res.status(500).json({message: error.message})
    }
}
    export const updateUserProfile = async (req, res) => {


        try{
            const {token, ...newUserData} = req.body;  // spread operator use krenge qunki token update mhi krna hai

            const user = await User.findOne({token: token});

            if(!user) return res.status(404).json({message: "User not found"});

            const {username, email} = newUserData;

            const existingUser = await User.findOne({ $or: [{username}, {email}] });

            if(existingUser) {
                if(existingUser || String(existingUser._id) !== String(user._id)){

                    return res.status(400).json({message: "Username or email already exists"});

                }
            }
            Object.assign(user, newUserData);

            await user.save();

            return res.json({message: "User Updated"})

        } catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

export const getUserAndProfile = async (req, res) => {


    try{


        const {token} = req.query;

        console.log(`Token: ${token}`);

        const user = await User.findOne({token: token});
        console.log(user)
        if(!user) return res.status(404).json({message: "User not found"});

        const UserProfile = await Profile.findOne({userId: user._id})
        .populate('userId', 'name email username profilePicture');

          return res.json(UserProfile)

        

    } catch(error) {
        return res.status(500).json({message: error.message});
    }
}

export const updateProfileData = async (req, res) => {

    try{
        const {token, ...newprofileData} = req.body;
        const userProfile = await User.findOne({token: token});

        if(!userProfile) return res.status(404).json({message: "User not found"});

        const profile_to_update = await Profile.findOne({userId: userProfile._id});

        Object.assign(profile_to_update, newprofileData);

        await profile_to_update.save();

        return res.json({message: "Profile Updated"})

    } catch(error) {
        return res.status(500).json({message: error.message});
    }
}

// searching functionality

export const getAllUserProfiles = async (req, res) => {
    try{
        const profiles = await Profile.find().populate('userId', 'name username email profilePicture');
        return res.json({profiles});
    } catch(error){
        return res.status(500).json({message: error.message});
    }
}

export const dowloadProfile = async (req, res) => {

    const user_id = req.query.id
    console.log(user_id);

    const userProfile = await Profile.findOne({userId: user_id})
        .populate('userId', 'name username email profilePicture');

        console.log(userProfile);

    let outputPath = await convertUserDataTOPDF(userProfile);

    return res.json({"message": outputPath});
    
}

export const sendConnectionRequest = async (req, res) => {

    const {token, connectionId} = req.body;

    try{

        const user = await User.findOne({token});

        if(!user){
            return res.status(404).json({ message: "User not found"})
        }

        const connectionUser = await User.findById({_id:connectionId });
        if(!connectionUser) {
            return res.status(404).json({message: "Connection user not found"});
        }

        const existingUser = await ConnectionRequest.findOne(
            {
                userId: user._id,
                connectionId: connectionUser._id
            }
            

        )
        if(existingUser) {
            return res.status(400).json({message: "Connection request already sent"});
        }

        const request = new ConnectionRequest(
            {
                userId: user._id,
                connectionId: connectionUser._id
            }

        );
        await request.save();

        return res.json({message: "Connection request sent successfully"});





    } catch(error) {
        return res.status(500).json({message: error.message});

    }

}

export const getMyConnectionsRequest = async (req, res) => {
    const {token} = req.body;

    try{
        const user = await User.findOne({token});

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        const connections = await ConnectionRequest.find({userId: user._id})
        .populate('connectionId', 'name username email profilePicture');

        return res.json({connections});

    } catch(error) {
        return res.status(500).json({message: error.message});
    }
}

export const whatAreMyConnections = async (req, res) => {

    const { token} = req.body;

    try {
        const user = await User.findOne({token});

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        const connections = await ConnectionRequest.find({connectionId: user._id})
        .populate('userId', 'name username email profilePicture');

        return res.json(connections);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const acceptConnectionRequest = async (req, res) => {
    const {token, requestId, action_type} = req.body;

    try{
        const user = await User.findOne({token});
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        const connection = await ConnectionRequest.findOne({_id: requestId})

        if(!connection) {
            return res.status(404).json({message: "Connection request not found"});
        }
        if(action_type === 'accept') {
            connection.status_accepted = true; // accept the request
        } else {
            connection.status_accepted = false; // reject the request
        }

        await connection.save();
        return res.json({message: "Connection request updated successfully"});

    } catch(error) {
        return res.status(500).json({message: error.message});
    }
}

