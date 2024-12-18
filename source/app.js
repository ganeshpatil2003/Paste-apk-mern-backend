import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.routes.js";
import { pastesRoute } from "./routes/pastes.routes.js";

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({
    limit : "16kb",
}))

app.use(express.urlencoded({
    limit : "16kb",
    extended : true,
}))

app.use(express.static('public'))

app.use(cookieParser())

app.use('/user',userRouter);

app.use('/pastes',pastesRoute)

export {app}