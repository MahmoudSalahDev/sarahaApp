import checkConnectionDB from "./DB/connectionDB.js"
import { globalErrorHandling } from "./middleware/globalErrorHandling.js"
import userRouter from "./Modules/users/user.controller.js"
import cors from "cors"
import "./Cron/deleteExpiredTokens.js";
import messageRouter from "./Modules/messages/message.controller.js";
import morgan from "morgan"
import { rateLimit } from 'express-rate-limit'
import helmet from "helmet";


const whitelist = [process.env.FRONT_ORIGIN, undefined]
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
const bootstrap = (app, express) => {

    const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 50,
        message:{
            error:"Too many requests, please try again later."
        }
    })

    app.use(cors(corsOptions))

    app.use(morgan("dev"))

    app.use(limiter)
    app.use(helmet());


    app.use(express.json())


    checkConnectionDB()

    app.use("/uploads", express.static("uploads"))

    app.use("/users", userRouter)
    app.use("/messages", messageRouter)


    app.use("{/*demo}", (req, res, next) => {
        throw new Error(`404 Url not found ${req.originalUrl}`, { cause: 404 })
    })

    app.use(globalErrorHandling)
}

export default bootstrap