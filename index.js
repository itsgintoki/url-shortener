import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { authenticationMiddleware } from './middlewares/auth.middleware.js';
import userRouter from './routes/user.routes.js'
import urlRouter from './routes/url.routes.js'
const app = express()
const PORT = process.env.PORT ?? 8000;

app.use(express.json())
app.use(authenticationMiddleware)
app.use(cors({
  origin: 'https://url-shortener-gilt-seven.vercel.app'
}))

// 100 requests per 15 minutes per IP 
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
}))

// Stricter limit on shorten endpoint — 10 per 15 minutes
app.use('/shorten', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many links created, slow down.' }
}))

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running...' })
})


app.use('/user', userRouter);
app.use(urlRouter);


app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})