import mongoose from "mongoose";


const connectDB=async()=>{
    try {
       const con= await mongoose.connect(`${process.env.MONGODB_URI}`);
       console.log(`\n DB connected....${con.connection.host}`);
    } catch (error) {
        console.log("DBErr: ",error);
        process.exit(1);
    }
}

export default connectDB;