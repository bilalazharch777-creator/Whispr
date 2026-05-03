import express from 'express';

import "dotenv/config";
import authRoutes from "./Routes/auth.route.js"
import userRoutes from "./Routes/user.route.js"
import chatRoutes from "./Routes/chat.route.js"
import postRoutes from "./Routes/post.route.js"
import storyRoutes from "./Routes/story.route.js"
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT
app.use("/public", express.static("public")); // for avatars

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth/", authRoutes);  
app.use("/api/users/", userRoutes);
app.use("/api/chat/", chatRoutes);
app.use("/api/post/", postRoutes);
app.use("/api/story/", storyRoutes);



app.listen(PORT, ()=>{
    console.log(`Server is Running on Port ${PORT}!`);
    connectDB();
       
})