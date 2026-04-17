import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173']

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, postman, curl)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error(`CORS blocked: ${origin} not allowed`))
    },
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.router.js'
import videoRouter from './routes/video.router.js'
import subscriptionRouter from './routes/subscription.router.js'
import playlistRouter from './routes/playlist.router.js'
import tweetRouter from './routes/tweet.router.js'
import likeRouter from './routes/like.router.js'
import commentRouter from './routes/comment.router.js'
import dashboardRouter from './routes/dashboard.router.js'

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/dashboard",dashboardRouter)


app.get("/",(req,res)=>{
    res.send("server is running")
})

//http://localhost:8000/users/login

export default app