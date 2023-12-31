import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app = express();

// MIDDLEWARE
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential : true
}))
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))
app.use(cookieParser());



//ROUTING IMPORT & DECLARATION......
import UserRouter from './routes/UserRoute.js'
app.use('/api/v1/user',UserRouter);



export {app};