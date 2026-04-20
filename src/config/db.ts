import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()

export const connectToDB = async () => {
    try {
        await  mongoose.connect(process.env.MONGO_URI as string)
        console.log("Mongodb Connected Successfully.");
        
    } catch (err) {
        console.error("Mongodb Connection Failed.", err);
        process.exit(1);
    }
}