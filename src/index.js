// require('dotenv').config({path:'./env'}); nodemon -r dotenv/config --experimental-json-module
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import { app } from './app.js';

dotenv.config({path:"./env"})

connectDB()
.then(()=>{
    // app.on("error",(error)=>{
    //     console.log("application error",error);
    //     throw error;
    // })

    app.listen(`${process.env.PORT}`,()=>{
        console.log("Application has started @"+process.env.PORT);
    })
})
.catch((err)=>{console.log("MongoDB connection failed",err)});