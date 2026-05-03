import { upsertStreamUser } from "../lib/stream.js";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";


export async function signup (req, res){
   const {fullName, email, password} = req.body;
   try {
    if (!email || !password || !fullName){
        return res.status(400).json({
            message: "All fields are required",
        });
    }
    if (password.length < 6){
        return res.status(400).json({
            message: "Password must be at least 6 characters",
        });

   } 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({
            message: "Invalid email address",
        });
    }
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            message: "Email already exists. Please Try a New One.",
        });
    }
    const idx = Math.floor(Math.random() * 9) + 1; // use 10 pic from assets folder
    const randomAvatar = `/public/avatar/image${idx}.jpg`;

    const newUser = await User.create({
        fullName,
        email,
        password,
        profilePic: randomAvatar,
    })

    try {
        await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
    })
    console.log(`Stream user created for ${newUser.fullName}`)
    } catch (error) {
        console.log("Error Creating stream user", error)
    }
    const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",

    })
    res.cookie("jwt",token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
    res.status(201).json({
        success: true,
        user: newUser,
    })
    }
   catch (error) {
    console.log("Error in Signup Controller", error);
    res.status(500).json({
        message: "Internal Server Error",
    });
   }

}
export async function login (req, res){
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message: "Invalid Email or Password",
            });
        }
        const isPassworCorrect= await user.matchPassword(password);
        if(!isPassworCorrect){ return res.status(401).json({
            message: "Invalid Email or Password",
        });
    }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",

    })
    res.cookie("jwt",token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    })
    res.status(201).json({
        success: true,
        user,
    })

    } catch (error) {
        console.log("Error in Login Controller", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }

}
export async function logout (req, res){
    res.clearCookie("jwt");
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });


}

export async function onboard (req, res){
    try {
        const userId = req.user._id;
        const {fullName, dateOfBirth, bio, profilePic, city, country,  workAs, education, maritalStatus} = req.body;
        if(!fullName || !dateOfBirth || !bio || !profilePic || !city || !country || !workAs || !education || !maritalStatus){
            return res.status(400).json({
                message: "All fields are required",
                missingFields : [
                    !fullName && "fullName",
                    !dateOfBirth && "dateOfBirth",
                    !bio && "bio",
                    !profilePic && "profilePic",
                    !city && "city",
                    !country  && "country",
                    !workAs && "workAs",
                    !education && "education",
                    !maritalStatus && "maritalStatus",
                ].filter(Boolean),
            });
        }

    // 2. Controlled Update (Security: only update specific fields)
        const updateData = {
            fullName,
            dateOfBirth,
            bio,
            profilePic,
            city,
            country,
            workAs,
            education,
            maritalStatus,
            isOnboarded: true,
        };

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            ...req.body,
            isOnboarded: true,
        },
        {
            new: true,
            runValidators: true,
        }, {new:true}
    );
    if(!updatedUser) return res.status(404).json({
        message: "User not found",
    });

    try {
        await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
        })
        console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
        } catch (streamError) {
        console.log("Error Updating stream user", streamError.message);
    }
    res.status(200).json({
        success: true,
        user: updatedUser,
    });
        
    } catch (error) {
        console.log("Error in Onboarding Controller", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    
    }
}