'use strict'

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const authMiddleware = require('./middleware/auth')
const authRouter = require('./routes/auth')
const toolsRouter = require('./routes/tools')
const checkoutsRouter = require('./routes/checkouts')

const app = express()

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// Public route
app.use('/api/auth', authRouter)

// Protected routes
app.use('/api/tools', authMiddleware, toolsRouter)
app.use('/api/tools/:id/checkouts', authMiddleware, checkoutsRouter)

module.exports = app
