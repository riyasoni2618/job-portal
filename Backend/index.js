import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from"./routes/user.route.js"; //1
import companyRoute from"./routes/company.route.js";
import jobRoute from"./routes/job.route.js";
import applicationRoute from"./routes/application.route.js";

dotenv.config({});
const app = express();
//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser()); 
const allowedOrigins = [
    'https://job-portal-sandy-two.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

const corsOption = {
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive in dev to avoid CORS blocking
        }
    },
    credentials: true,
};
app.use(cors(corsOption));
const PORT = process.env.PORT ||3000;

app.use("/api/v1/user",userRoute); //1 connected
app.use("/api/v1/company",companyRoute);
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",applicationRoute);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
})
// import mongoose from 'mongoose';
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected ✅'))
//   .catch((err) => console.error('MongoDB connection error ❌:', err));