// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import postRoutes from "./routes/posts.routes.js";
// import userRoutes from "./routes/user.routes.js";


// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json()); 
// app.use(postRoutes);
// app.use(userRoutes);







// const start = async () => {

//     const connectDB = await mongoose.connect("mongodb+srv://raunak1kumar2:K8kIG4brLOocLCGa@fynk.xzvivxb.mongodb.net/?retryWrites=true&w=majority&appName=Fynk")
// }

// app.listen(9080, () => {
//     console.log("Server is running on port 9080");
//     console.log("Connecting to MongoDB...");
// })


// start();

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9090;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // optional for form data

// Mount routes with prefixes
app.use(postRoutes);
app.use(userRoutes);
app.use("/api/chat", chatRoutes);
app.use(express.static("uploads"))

const start = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI
        );
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};

start();
